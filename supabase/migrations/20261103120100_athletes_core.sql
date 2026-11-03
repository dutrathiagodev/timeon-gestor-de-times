-- 00025 · passo 2: atletas, perfil esportivo por time e CPF protegido.
--
-- Uma pessoa = um cadastro (athletes) e um perfil esportivo POR TIME (team_members):
-- posicao, camisa e status nunca se misturam entre modalidades. O CPF vive em
-- athlete_private, cifrado no servidor (AES-256-GCM) com um indice cego (HMAC); o banco
-- nunca o ve em claro. A tabela nao tem policy nenhuma: so as funcoes abaixo a acessam,
-- e cada leitura e gravada em audit_events na mesma transacao.

create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  nickname text check (nickname is null or char_length(btrim(nickname)) between 1 and 40),
  sex text not null check (sex in ('male', 'female')),
  birth_date date not null check (birth_date >= date '1900-01-01'),
  -- Sinal para a tela ("CPF pendente") sem ler athlete_private.
  cpf_registered boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, organization_id)
);
-- Uma conta e um atleta por organizacao.
create unique index athletes_org_user_idx on public.athletes (organization_id, user_id) where user_id is not null;
create index athletes_org_idx on public.athletes (organization_id);

create table public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  position text,
  shirt_number smallint check (shirt_number between 0 and 99),
  status text not null default 'active' check (status in ('active', 'inactive', 'injured')),
  created_at timestamptz not null default now(),
  primary key (team_id, athlete_id)
);
-- A camisa e unica por time, nao por pessoa: o mesmo numero pode existir em outro time.
create unique index team_members_shirt_idx on public.team_members (team_id, shirt_number) where shirt_number is not null;
create index team_members_athlete_idx on public.team_members (athlete_id);

create table public.athlete_private (
  athlete_id uuid primary key,
  organization_id uuid not null,
  -- [versao:1][iv:12][tag:16][11 digitos cifrados] = 40 bytes. O tamanho fixo barra CPF em claro.
  cpf_ciphertext bytea not null check (octet_length(cpf_ciphertext) = 40),
  cpf_blind_index bytea not null check (octet_length(cpf_blind_index) = 32),
  key_version smallint not null check (key_version between 1 and 255),
  phone text check (phone is null or phone ~ '^[0-9]{10,13}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (athlete_id, organization_id) references public.athletes (id, organization_id) on delete cascade,
  unique (organization_id, cpf_blind_index)
);

-- Permissoes ------------------------------------------------------------------------------

-- Gestor de algum time do atleta, ou admin da organizacao.
create function private.is_athlete_manager(athlete uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.athletes a
    where a.id = athlete
      and private.has_org_role(a.organization_id, array['owner', 'admin'])
  ) or exists (
    select 1 from public.team_members m
    join public.team_staff s on s.team_id = m.team_id
    where m.athlete_id = athlete and s.user_id = (select auth.uid()) and s.role = 'manager'
  );
$$;

create function private.is_athlete_self(athlete uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.athletes a
    where a.id = athlete and a.user_id = (select auth.uid())
  );
$$;

-- Le o cadastro: a propria pessoa, admin ou a comissao de algum time dela.
create function private.can_read_athlete(athlete uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_athlete_self(athlete)
    or exists (
      select 1 from public.athletes a
      where a.id = athlete and private.has_org_role(a.organization_id, array['owner', 'admin'])
    )
    or exists (
      select 1 from public.team_members m
      where m.athlete_id = athlete and private.can_staff_team(m.team_id)
    );
$$;

-- Dados protegidos (CPF e telefone): a propria pessoa, admin ou gestor. Tecnico nao.
create function private.can_access_athlete_private(athlete uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_athlete_self(athlete) or private.is_athlete_manager(athlete);
$$;

-- Admin ou gestor de algum time da organizacao.
create function private.is_org_manager(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_org_role(org, array['owner', 'admin']) or private.org_staff_role(org) = 'manager';
$$;

-- Qualquer vinculo com a organizacao, inclusive pedido de entrada pendente.
create function private.has_org_access(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.can_read_org(org) or exists (
    select 1 from public.team_join_requests r
    join public.teams t on t.id = r.team_id
    where t.organization_id = org and r.user_id = (select auth.uid()) and r.status = 'pending'
  );
$$;

-- Integridade do perfil esportivo --------------------------------------------------------------

create function private.check_team_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  team_org uuid;
  team_sport text;
  athlete_org uuid;
begin
  select t.organization_id, t.sport into team_org, team_sport from public.teams t where t.id = new.team_id;
  select a.organization_id into athlete_org from public.athletes a where a.id = new.athlete_id;
  if team_org is distinct from athlete_org then
    raise exception 'athlete and team belong to different organizations' using errcode = 'check_violation';
  end if;
  if new.position is not null and not exists (
    select 1 from public.sport_positions p where p.sport = team_sport and p.key = new.position
  ) then
    raise exception 'invalid position for this sport' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
create trigger team_members_check
  before insert or update of team_id, athlete_id, position on public.team_members
  for each row execute function private.check_team_member();

-- Quem ganha acesso de jogador a um time e ja tem cadastro entra no elenco; quem perde
-- o acesso fica inativo (o historico do perfil esportivo nao se apaga).
create function private.sync_team_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_user uuid := coalesce(new.user_id, old.user_id);
  member_team uuid := coalesce(new.team_id, old.team_id);
  aid uuid;
begin
  select a.id into aid
  from public.athletes a
  join public.teams t on t.organization_id = a.organization_id
  where t.id = member_team and a.user_id = member_user;
  if aid is null then
    return coalesce(new, old);
  end if;
  if tg_op = 'INSERT' then
    insert into public.team_members (team_id, athlete_id) values (member_team, aid)
    on conflict (team_id, athlete_id) do update set status = 'active';
  else
    update public.team_members set status = 'inactive' where team_id = member_team and athlete_id = aid;
  end if;
  return coalesce(new, old);
end;
$$;
create trigger team_players_sync_member
  after insert or delete on public.team_players
  for each row execute function private.sync_team_member();

-- Cadastro ------------------------------------------------------------------------------------------

create function private.valid_birth(birth date)
returns boolean
language sql
stable
set search_path = ''
as $$ select birth is not null and birth between date '1900-01-01' and current_date; $$;

-- A propria pessoa se inscreve (depois de entrar por codigo). Sexo e nascimento
-- ficam gravados aqui; depois so admin ou gestor corrigem.
create function public.register_my_athlete(
  p_organization uuid,
  p_full_name text,
  p_nickname text,
  p_sex text,
  p_birth_date date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  new_id uuid;
begin
  if uid is null or not private.has_org_access(p_organization) then
    raise exception 'no access to this organization' using errcode = 'insufficient_privilege';
  end if;
  if not private.valid_birth(p_birth_date) then
    raise exception 'invalid birth date' using errcode = 'invalid_parameter_value';
  end if;

  insert into public.athletes (organization_id, user_id, full_name, nickname, sex, birth_date)
  values (p_organization, uid, btrim(p_full_name), nullif(btrim(p_nickname), ''), p_sex, p_birth_date)
  returning id into new_id;

  -- Entra no elenco de cada time em que ja tem acesso de jogador.
  insert into public.team_members (team_id, athlete_id)
  select p.team_id, new_id
  from public.team_players p
  join public.teams t on t.id = p.team_id
  where p.user_id = uid and t.organization_id = p_organization
  on conflict (team_id, athlete_id) do nothing;

  perform private.audit(p_organization, 'athlete.registered', 'athlete', new_id, '{"by":"self"}'::jsonb);
  return new_id;
end;
$$;

-- Admin ou gestor cadastra quem ainda nao tem conta.
create function public.register_athlete(
  p_organization uuid,
  p_full_name text,
  p_nickname text,
  p_sex text,
  p_birth_date date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if (select auth.uid()) is null or not private.is_org_manager(p_organization) then
    raise exception 'only admin or manager can register athletes' using errcode = 'insufficient_privilege';
  end if;
  if not private.valid_birth(p_birth_date) then
    raise exception 'invalid birth date' using errcode = 'invalid_parameter_value';
  end if;
  insert into public.athletes (organization_id, full_name, nickname, sex, birth_date)
  values (p_organization, btrim(p_full_name), nullif(btrim(p_nickname), ''), p_sex, p_birth_date)
  returning id into new_id;
  perform private.audit(p_organization, 'athlete.registered', 'athlete', new_id, '{"by":"staff"}'::jsonb);
  return new_id;
end;
$$;

-- Nome e nome de camisa: a propria pessoa, admin ou gestor.
create function public.update_athlete_profile(p_athlete uuid, p_full_name text, p_nickname text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
begin
  select a.organization_id into org from public.athletes a where a.id = p_athlete;
  if org is null or not (private.is_athlete_self(p_athlete) or private.is_athlete_manager(p_athlete)) then
    raise exception 'not allowed' using errcode = 'insufficient_privilege';
  end if;
  update public.athletes
    set full_name = btrim(p_full_name), nickname = nullif(btrim(p_nickname), '')
    where id = p_athlete;
  perform private.audit(org, 'athlete.profile_updated', 'athlete', p_athlete, '{"fields":["full_name","nickname"]}'::jsonb);
end;
$$;

-- Sexo e nascimento: so admin ou gestor corrigem (a pessoa nao muda depois de inscrita).
create function public.correct_athlete_identity(p_athlete uuid, p_sex text, p_birth_date date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
begin
  select a.organization_id into org from public.athletes a where a.id = p_athlete;
  if org is null or not private.is_athlete_manager(p_athlete) then
    raise exception 'only admin or manager can correct identity data' using errcode = 'insufficient_privilege';
  end if;
  if not private.valid_birth(p_birth_date) then
    raise exception 'invalid birth date' using errcode = 'invalid_parameter_value';
  end if;
  update public.athletes set sex = p_sex, birth_date = p_birth_date where id = p_athlete;
  perform private.audit(org, 'athlete.identity_corrected', 'athlete', p_athlete, '{"fields":["sex","birth_date"]}'::jsonb);
end;
$$;

-- Perfil esportivo --------------------------------------------------------------------------------------

-- Coloca no elenco de um time: admin ou gestor.
create function public.add_athlete_to_team(p_team uuid, p_athlete uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.can_manage_team(p_team) then
    raise exception 'only admin or manager can add athletes to the team' using errcode = 'insufficient_privilege';
  end if;
  insert into public.team_members (team_id, athlete_id) values (p_team, p_athlete)
  on conflict (team_id, athlete_id) do update set status = 'active';
  perform private.audit(private.org_of_team(p_team), 'team_member.added', 'athlete', p_athlete,
    jsonb_build_object('team_id', p_team));
end;
$$;

-- Posicao, camisa e status: admin, gestor ou tecnico. Nulo limpa o campo.
create function public.update_team_member(
  p_team uuid,
  p_athlete uuid,
  p_position text,
  p_shirt_number smallint,
  p_status text default 'active'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.can_write_team(p_team) then
    raise exception 'not allowed' using errcode = 'insufficient_privilege';
  end if;
  update public.team_members
    set position = p_position, shirt_number = p_shirt_number, status = coalesce(p_status, 'active')
    where team_id = p_team and athlete_id = p_athlete;
  if not found then
    raise exception 'athlete is not in this team' using errcode = 'no_data_found';
  end if;
  perform private.audit(private.org_of_team(p_team), 'team_member.updated', 'athlete', p_athlete,
    jsonb_build_object('team_id', p_team, 'fields', jsonb_build_array('position', 'shirt_number', 'status')));
end;
$$;

-- CPF e telefone ---------------------------------------------------------------------------------------------
-- O servidor cifra o CPF e calcula o indice cego (src/lib/cpf.ts); o banco guarda e audita.

create function public.set_athlete_private(
  p_athlete uuid,
  p_cpf_ciphertext bytea,
  p_cpf_blind_index bytea,
  p_key_version smallint,
  p_phone text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
  phone_digits text := nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'), '');
begin
  select a.organization_id into org from public.athletes a where a.id = p_athlete;
  if org is null or not private.can_access_athlete_private(p_athlete) then
    raise exception 'not allowed' using errcode = 'insufficient_privilege';
  end if;

  insert into public.athlete_private (athlete_id, organization_id, cpf_ciphertext, cpf_blind_index, key_version, phone)
  values (p_athlete, org, p_cpf_ciphertext, p_cpf_blind_index, p_key_version, phone_digits)
  on conflict (athlete_id) do update set
    cpf_ciphertext = excluded.cpf_ciphertext,
    cpf_blind_index = excluded.cpf_blind_index,
    key_version = excluded.key_version,
    phone = excluded.phone,
    updated_at = now();
  update public.athletes set cpf_registered = true where id = p_athlete;

  perform private.audit(org, 'athlete_private.set', 'athlete', p_athlete, '{}'::jsonb);
end;
$$;

-- Leitura: confere o papel e grava a leitura na MESMA transacao, antes de devolver.
-- Devolve o texto cifrado; quem decifra e o servidor.
create function public.read_athlete_private(p_athlete uuid)
returns table (cpf_ciphertext bytea, key_version smallint, phone text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
begin
  select a.organization_id into org from public.athletes a where a.id = p_athlete;
  if org is null or not private.can_access_athlete_private(p_athlete) then
    raise exception 'not allowed' using errcode = 'insufficient_privilege';
  end if;
  perform private.audit(org, 'athlete_private.read', 'athlete', p_athlete, '{}'::jsonb);
  return query
    select p.cpf_ciphertext, p.key_version, p.phone
    from public.athlete_private p where p.athlete_id = p_athlete;
end;
$$;

-- Acha duplicado pelo indice cego, sem decifrar. Admin ou gestor da organizacao.
create function public.find_athlete_by_cpf_index(p_organization uuid, p_blind_index bytea)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  found_id uuid;
begin
  if (select auth.uid()) is null or not private.is_org_manager(p_organization) then
    raise exception 'not allowed' using errcode = 'insufficient_privilege';
  end if;
  select p.athlete_id into found_id
  from public.athlete_private p
  where p.organization_id = p_organization and p.cpf_blind_index = p_blind_index;
  perform private.audit(p_organization, 'athlete_private.lookup', 'athlete', found_id, '{}'::jsonb);
  return found_id;
end;
$$;

-- Apagar os dados protegidos: a propria pessoa ou admin (gestor nao apaga).
create function public.delete_athlete_private(p_athlete uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
begin
  select a.organization_id into org from public.athletes a where a.id = p_athlete;
  if org is null or not (private.is_athlete_self(p_athlete) or private.has_org_role(org, array['owner', 'admin'])) then
    raise exception 'not allowed' using errcode = 'insufficient_privilege';
  end if;
  delete from public.athlete_private where athlete_id = p_athlete;
  update public.athletes set cpf_registered = false where id = p_athlete;
  perform private.audit(org, 'athlete_private.deleted', 'athlete', p_athlete, '{}'::jsonb);
end;
$$;

-- RLS -----------------------------------------------------------------------------------------------------------
alter table public.athletes enable row level security;
alter table public.team_members enable row level security;
alter table public.athlete_private enable row level security;

create policy athletes_read on public.athletes
  for select to authenticated using ((select private.can_read_athlete(id)));

-- Elenco: comissao e admin leem todos; o jogador le so o proprio perfil esportivo.
create policy team_members_read on public.team_members
  for select to authenticated
  using ((select private.can_staff_team(team_id)) or (select private.is_athlete_self(athlete_id)));
create policy team_members_delete on public.team_members
  for delete to authenticated using ((select private.can_manage_team(team_id)));

-- athlete_private: nenhuma policy e nenhum grant. Acesso so pelas funcoes acima.
revoke all on public.athletes, public.team_members, public.athlete_private from anon, authenticated;
grant select on public.athletes to authenticated;
grant select, delete on public.team_members to authenticated;

revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;
revoke all on function
  public.register_my_athlete(uuid, text, text, text, date),
  public.register_athlete(uuid, text, text, text, date),
  public.update_athlete_profile(uuid, text, text),
  public.correct_athlete_identity(uuid, text, date),
  public.add_athlete_to_team(uuid, uuid),
  public.update_team_member(uuid, uuid, text, smallint, text),
  public.set_athlete_private(uuid, bytea, bytea, smallint, text),
  public.read_athlete_private(uuid),
  public.find_athlete_by_cpf_index(uuid, bytea),
  public.delete_athlete_private(uuid)
  from public, anon;
grant execute on function
  public.register_my_athlete(uuid, text, text, text, date),
  public.register_athlete(uuid, text, text, text, date),
  public.update_athlete_profile(uuid, text, text),
  public.correct_athlete_identity(uuid, text, date),
  public.add_athlete_to_team(uuid, uuid),
  public.update_team_member(uuid, uuid, text, smallint, text),
  public.set_athlete_private(uuid, bytea, bytea, smallint, text),
  public.read_athlete_private(uuid),
  public.find_athlete_by_cpf_index(uuid, bytea),
  public.delete_athlete_private(uuid)
  to authenticated;
