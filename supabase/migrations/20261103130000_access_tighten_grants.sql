-- 00038 · endurece as permissoes de tabela (defesa em profundidade).
--
-- No Supabase, toda tabela criada em public nasce com ALL para anon e authenticated
-- (default privileges do projeto). As migrations anteriores revogavam so do anon em
-- algumas tabelas; o authenticated ficava com INSERT, UPDATE e DELETE a mais, barrados
-- apenas pelo RLS. Aqui cada tabela volta a ter exatamente o privilegio de que precisa.
-- supabase/tests/grants_audit.sql falha se uma tabela nova nascer sem decisao.

revoke all on
  public.sports, public.sport_positions, public.organizations, public.org_memberships,
  public.teams, public.team_staff, public.team_players, public.team_join_requests,
  public.team_members, public.athletes, public.audit_events,
  public.team_invites, public.invite_attempts, public.athlete_private
  from anon, authenticated;

grant select on public.sports, public.sport_positions to authenticated;
grant select, update on public.organizations to authenticated;
grant select, insert, update, delete on public.org_memberships, public.teams, public.team_staff to authenticated;
grant select, delete on public.team_players, public.team_members to authenticated;
grant select on public.team_join_requests, public.athletes, public.audit_events to authenticated;
-- O hash do codigo nunca sai do banco: leitura por colunas, sem code_hash.
grant select (id, team_id, role, created_by, created_at, expires_at, max_uses, used_count, requires_approval, revoked_at)
  on public.team_invites to authenticated;

-- Identidades das tabelas so avancam por dentro das funcoes SECURITY DEFINER.
revoke all on all sequences in schema public from anon, authenticated;
