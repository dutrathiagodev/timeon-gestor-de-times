-- 00024 · passo 2: papel de gestor, um time por esporte+categoria+faixa etaria,
-- auditoria e criacao de time por admin, gestor e tecnico.

-- Gestor (manager) administra o time: elenco, agenda e jogos. Tecnico (coach) cuida
-- da escalacao e da pontuacao. scout e viewer seguem aceitos, sem uso na interface.
alter table public.team_staff drop constraint team_staff_role_check;
alter table public.team_staff
  add constraint team_staff_role_check check (role in ('manager', 'coach', 'scout', 'viewer'));

-- Time = esporte + categoria + faixa etaria. Faixa vazia e adulto/livre.
create unique index teams_unique_sport_category_age
  on public.teams (organization_id, sport, category, coalesce(age_group, ''));

-- Jogador com acesso ao time. O perfil esportivo (posicao, camisa) vem na task 00025.
create table public.team_players (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);
create index team_players_user_id_idx on public.team_players (user_id);

-- Auditoria: so insercao. Nada de dado pessoal nem de codigo no payload.
create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid,
  action text not null check (action ~ '^[a-z_]+(\.[a-z_]+)*$'),
  entity text not null,
  entity_id uuid,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_org_created_idx on public.audit_events (organization_id, created_at desc);

create function private.block_audit_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_events is append-only' using errcode = 'insufficient_privilege';
end;
$$;
create trigger audit_events_append_only
  before update or delete on public.audit_events
  for each row execute function private.block_audit_changes();

create function private.audit(
  org uuid, action text, entity text, entity_id uuid, data jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_events (organization_id, actor_id, action, entity, entity_id, data)
  values (org, (select auth.uid()), action, entity, entity_id, coalesce(data, '{}'::jsonb));
$$;

-- Permissoes por papel ---------------------------------------------------------

-- Qualquer pessoa da comissao do time (ou admin da organizacao).
create function private.can_staff_team(team uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_org_role(private.org_of_team(team), array['owner', 'admin'])
    or exists (
      select 1 from public.team_staff s
      where s.team_id = team and s.user_id = (select auth.uid())
    );
$$;

-- Le o time: comissao, admin ou jogador do time.
create or replace function private.can_read_team(team uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.can_staff_team(team)
    or exists (
      select 1 from public.team_players p
      where p.team_id = team and p.user_id = (select auth.uid())
    );
$$;

-- Administra o time (elenco, agenda, jogos): admin ou gestor.
create function private.can_manage_team(team uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_org_role(private.org_of_team(team), array['owner', 'admin'])
    or exists (
      select 1 from public.team_staff s
      where s.team_id = team and s.user_id = (select auth.uid()) and s.role = 'manager'
    );
$$;

-- Escreve no time (escalacao, pontuacao, estatisticas): admin, gestor ou tecnico.
create or replace function private.can_write_team(team uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_org_role(private.org_of_team(team), array['owner', 'admin'])
    or exists (
      select 1 from public.team_staff s
      where s.team_id = team and s.user_id = (select auth.uid()) and s.role in ('manager', 'coach')
    );
$$;

-- Convida jogadores para o time: admin, gestor ou tecnico.
create function private.can_invite_players(team uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.can_write_team(team);
$$;

-- Enxerga a organizacao: admin, comissao ou jogador de algum time dela.
create or replace function private.can_read_org(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_org_role(org, array['owner', 'admin'])
    or exists (
      select 1 from public.team_staff s
      join public.teams t on t.id = s.team_id
      where t.organization_id = org and s.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.team_players p
      join public.teams t on t.id = p.team_id
      where t.organization_id = org and p.user_id = (select auth.uid())
    );
$$;

-- Maior papel de comissao da pessoa na organizacao ('manager' > 'coach'), ou null.
create function private.org_staff_role(org uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select s.role
  from public.team_staff s
  join public.teams t on t.id = s.team_id
  where t.organization_id = org
    and s.user_id = (select auth.uid())
    and s.role in ('manager', 'coach')
  order by case s.role when 'manager' then 0 else 1 end
  limit 1;
$$;

-- Criar time: admin, gestor e tecnico. Quem nao e admin entra no time novo com o
-- mesmo papel que ja tem na organizacao: criar time nunca da papel maior.
create function public.create_team(
  p_organization uuid,
  p_name text,
  p_slug text,
  p_sport text,
  p_category text default 'mixed',
  p_age_group text default null,
  p_color text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  staff_role text;
  new_id uuid;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;
  if not private.has_org_role(p_organization, array['owner', 'admin']) then
    staff_role := private.org_staff_role(p_organization);
    if staff_role is null then
      raise exception 'only admin, manager or coach can create teams' using errcode = 'insufficient_privilege';
    end if;
  end if;

  insert into public.teams (organization_id, name, slug, sport, category, age_group, color)
  values (p_organization, p_name, p_slug, p_sport, p_category, p_age_group, p_color)
  returning id into new_id;

  if staff_role is not null then
    insert into public.team_staff (team_id, user_id, role) values (new_id, uid, staff_role);
  end if;

  perform private.audit(
    p_organization, 'team.created', 'team', new_id,
    jsonb_build_object('sport', p_sport, 'category', p_category, 'age_group', p_age_group)
  );
  return new_id;
end;
$$;

-- Jogador so le a propria linha; comissao e admin leem o elenco.
alter table public.team_players enable row level security;
alter table public.audit_events enable row level security;

create policy team_players_read on public.team_players
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.can_staff_team(team_id)));
create policy team_players_delete on public.team_players
  for delete to authenticated
  using ((select private.can_manage_team(team_id)));

create policy audit_events_read on public.audit_events
  for select to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])));

-- Jogador nao precisa listar a comissao: so quem faz parte dela ou admin.
drop policy team_staff_read on public.team_staff;
create policy team_staff_read on public.team_staff
  for select to authenticated using ((select private.can_staff_team(team_id)));

grant select, delete on public.team_players to authenticated;
grant select on public.audit_events to authenticated;
revoke all on public.team_players, public.audit_events from anon;

revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;
revoke all on function public.create_team(uuid, text, text, text, text, text, text) from public, anon;
grant execute on function public.create_team(uuid, text, text, text, text, text, text) to authenticated;
