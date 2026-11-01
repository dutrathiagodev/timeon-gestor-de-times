-- 00017 · passo 4: funcoes de permissao usadas por todas as policies.
-- SECURITY DEFINER + search_path vazio: leem as tabelas sem recursao de RLS e
-- sem risco de sequestro de search_path. Nao ficam expostas pela API (schema private).

create function private.has_org_role(org uuid, roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.org_memberships m
    where m.organization_id = org
      and m.user_id = (select auth.uid())
      and m.role = any (roles)
  );
$$;

create function private.org_of_team(team uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select t.organization_id from public.teams t where t.id = team;
$$;

-- Le o time: administra a organizacao ou faz parte da comissao do time.
create function private.can_read_team(team uuid)
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

-- Escreve no time: administra a organizacao ou e coach do time.
create function private.can_write_team(team uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_org_role(private.org_of_team(team), array['owner', 'admin'])
    or exists (
      select 1 from public.team_staff s
      where s.team_id = team and s.user_id = (select auth.uid()) and s.role = 'coach'
    );
$$;

-- Enxerga a organizacao: membro dela ou comissao de algum time dela.
create function private.can_read_org(org uuid)
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
    );
$$;

revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;
