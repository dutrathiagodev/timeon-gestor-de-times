-- 00017 · passo 5: RLS, policies e grants das tabelas novas.
-- Sem policy de INSERT/DELETE em organizations: a criacao e o bootstrap do
-- primeiro owner passam por RPC em fase futura (nenhum cliente cria organizacao).
alter table public.sports enable row level security;
alter table public.organizations enable row level security;
alter table public.org_memberships enable row level security;
alter table public.teams enable row level security;
alter table public.team_staff enable row level security;

create policy sports_read on public.sports
  for select to authenticated using (true);

create policy organizations_read on public.organizations
  for select to authenticated using ((select private.can_read_org(id)));
create policy organizations_update on public.organizations
  for update to authenticated
  using ((select private.has_org_role(id, array['owner'])))
  with check ((select private.has_org_role(id, array['owner'])));

-- admin enxerga a lista; qualquer um enxerga a propria linha; so owner promove.
create policy org_memberships_read on public.org_memberships
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.has_org_role(organization_id, array['owner', 'admin']))
  );
create policy org_memberships_insert on public.org_memberships
  for insert to authenticated
  with check ((select private.has_org_role(organization_id, array['owner'])));
create policy org_memberships_update on public.org_memberships
  for update to authenticated
  using ((select private.has_org_role(organization_id, array['owner'])))
  with check ((select private.has_org_role(organization_id, array['owner'])));
create policy org_memberships_delete on public.org_memberships
  for delete to authenticated
  using ((select private.has_org_role(organization_id, array['owner'])));

create policy teams_read on public.teams
  for select to authenticated using ((select private.can_read_team(id)));
create policy teams_insert on public.teams
  for insert to authenticated
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));
create policy teams_update on public.teams
  for update to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
  with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));
create policy teams_delete on public.teams
  for delete to authenticated
  using ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy team_staff_read on public.team_staff
  for select to authenticated using ((select private.can_read_team(team_id)));
create policy team_staff_insert on public.team_staff
  for insert to authenticated
  with check ((select private.has_org_role(private.org_of_team(team_id), array['owner', 'admin'])));
create policy team_staff_update on public.team_staff
  for update to authenticated
  using ((select private.has_org_role(private.org_of_team(team_id), array['owner', 'admin'])))
  with check ((select private.has_org_role(private.org_of_team(team_id), array['owner', 'admin'])));
create policy team_staff_delete on public.team_staff
  for delete to authenticated
  using ((select private.has_org_role(private.org_of_team(team_id), array['owner', 'admin'])));

-- Privilegios explicitos: o RLS decide; anon fica sem nada.
grant select on public.sports to authenticated;
grant select, update on public.organizations to authenticated;
grant select, insert, update, delete on public.org_memberships, public.teams, public.team_staff to authenticated;
revoke all on public.sports, public.organizations, public.org_memberships, public.teams, public.team_staff from anon;
