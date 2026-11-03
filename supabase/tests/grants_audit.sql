-- Auditoria de permissoes: o que anon e authenticated podem fazer DIRETAMENTE nas
-- tabelas e funcoes. O RLS e a segunda barreira; esta e a primeira. Falha se alguma
-- migration deixar uma permissao a mais (por exemplo a que o Supabase concede por padrao).
\set ON_ERROR_STOP on
begin;

create schema t;
create function t.expect(label text, ok boolean) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FALHOU: %', label; end if;
  raise notice 'ok - %', label;
end $$;

-- Privilegios de tabela esperados para authenticated (nada alem disso). anon nunca tem nada.
create table t.expected (tbl text, priv text);
insert into t.expected values
  ('sports', 'SELECT'),
  ('sport_positions', 'SELECT'),
  ('organizations', 'SELECT'), ('organizations', 'UPDATE'),
  ('org_memberships', 'SELECT'), ('org_memberships', 'INSERT'), ('org_memberships', 'UPDATE'), ('org_memberships', 'DELETE'),
  ('teams', 'SELECT'), ('teams', 'INSERT'), ('teams', 'UPDATE'), ('teams', 'DELETE'),
  ('team_staff', 'SELECT'), ('team_staff', 'INSERT'), ('team_staff', 'UPDATE'), ('team_staff', 'DELETE'),
  ('team_players', 'SELECT'), ('team_players', 'DELETE'),
  ('team_join_requests', 'SELECT'),
  ('team_members', 'SELECT'), ('team_members', 'DELETE'),
  ('athletes', 'SELECT'),
  ('audit_events', 'SELECT');

select t.expect('toda tabela de public esta na lista esperada (tabela nova exige decidir as permissoes)',
  not exists (
    select 1 from pg_tables where schemaname = 'public'
      and tablename not in (select tbl from t.expected)
      and tablename not in ('team_invites', 'invite_attempts', 'athlete_private')
  ));

select t.expect('anon nao tem NENHUM privilegio em nenhuma tabela de public',
  not exists (
    select 1 from pg_tables tb
    cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) p
    where tb.schemaname = 'public' and has_table_privilege('anon', format('public.%I', tb.tablename), p)
  ));

select t.expect('authenticated so tem os privilegios esperados em cada tabela',
  not exists (
    select 1 from pg_tables tb
    cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) p
    where tb.schemaname = 'public'
      and has_table_privilege('authenticated', format('public.%I', tb.tablename), p)
      and not exists (select 1 from t.expected e where e.tbl = tb.tablename and e.priv = p)
  ));

select t.expect('os privilegios esperados existem de fato (nada ficou revogado a mais)',
  not exists (
    select 1 from t.expected e
    where not has_table_privilege('authenticated', format('public.%I', e.tbl), e.priv)
  ));

select t.expect('team_invites, invite_attempts e athlete_private: nenhum privilegio de tabela para authenticated',
  not exists (
    select 1 from unnest(array['team_invites','invite_attempts','athlete_private']) tb
    cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) p
    where has_table_privilege('authenticated', format('public.%I', tb), p)
  ));

select t.expect('o hash do codigo nao e legivel por coluna',
  not has_column_privilege('authenticated', 'public.team_invites', 'code_hash', 'SELECT')
  and not has_column_privilege('anon', 'public.team_invites', 'code_hash', 'SELECT'));

select t.expect('athlete_private nao tem nenhuma coluna legivel ou gravavel por authenticated',
  not exists (
    select 1 from information_schema.columns c
    cross join unnest(array['SELECT','INSERT','UPDATE']) p
    where c.table_schema = 'public' and c.table_name = 'athlete_private'
      and has_column_privilege('authenticated', 'public.athlete_private', c.column_name, p)
  ));

select t.expect('so as colunas esperadas de team_invites sao legiveis (sem code_hash)',
  (select count(*) from information_schema.columns c
    where c.table_schema = 'public' and c.table_name = 'team_invites'
      and has_column_privilege('authenticated', 'public.team_invites', c.column_name, 'SELECT')) = 10);

select t.expect('sequencias: nem anon nem authenticated usam nextval',
  not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'S'
      and (has_sequence_privilege('anon', c.oid, 'USAGE') or has_sequence_privilege('authenticated', c.oid, 'USAGE')
           or has_sequence_privilege('anon', c.oid, 'UPDATE') or has_sequence_privilege('authenticated', c.oid, 'UPDATE'))
  ));

-- Funcoes: anon nunca executa nada; authenticated so as RPCs previstas e as de private.
select t.expect('anon nao executa nenhuma funcao de public nem de private',
  not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private') and has_function_privilege('anon', p.oid, 'EXECUTE')
  ));

select t.expect('as unicas funcoes de public chamaveis por authenticated sao as RPCs previstas',
  (select array_agg(p.proname::text order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prokind = 'f' and has_function_privilege('authenticated', p.oid, 'EXECUTE'))
  = array['add_athlete_to_team','correct_athlete_identity','create_team','create_team_invite','decide_join_request',
          'delete_athlete_private','find_athlete_by_cpf_index','read_athlete_private','redeem_team_invite','register_athlete',
          'register_my_athlete','revoke_team_invite','set_athlete_private','update_athlete_profile','update_team_member']);

select t.expect('todas as RPCs de public sao SECURITY DEFINER com search_path vazio',
  not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private') and p.prokind = 'f'
      and not (p.prosecdef and exists (select 1 from unnest(p.proconfig) c where c = 'search_path=""'))
      -- as funcoes de private sem SECURITY DEFINER sao puras (sem acesso a tabela)
      and not (n.nspname = 'private' and p.proname in ('new_invite_code', 'normalize_invite_code', 'invite_code_hash', 'valid_birth_year'))
      and not (n.nspname = 'private' and exists (select 1 from unnest(p.proconfig) c where c = 'search_path=""') and not p.prosecdef)
  ));

select t.expect('toda tabela de public tem RLS ligada',
  not exists (select 1 from pg_tables where schemaname = 'public' and not rowsecurity));

rollback;
\echo 'AUDITORIA DE PERMISSOES PASSOU'
