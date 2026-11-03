-- Verificacao DEPOIS de aplicar as migrations. So le o catalogo do Postgres: nao cria,
-- nao altera e nao apaga nada. Cole no SQL Editor do Supabase do projeto (ou rode com
-- psql) e confira que TODAS as linhas dizem OK. Qualquer FALHOU traz o que esta errado
-- na coluna "detalhe". Roda tambem no Docker (supabase/tests/run-local.sh).
with
new_tables(tbl) as (values
  ('sports'), ('sport_positions'), ('organizations'), ('org_memberships'), ('teams'),
  ('team_staff'), ('team_players'), ('team_invites'), ('team_join_requests'),
  ('invite_attempts'), ('audit_events'), ('athletes'), ('team_members'), ('athlete_private')
),
expected(tbl, priv) as (values
  ('sports', 'SELECT'), ('sport_positions', 'SELECT'),
  ('organizations', 'SELECT'), ('organizations', 'UPDATE'),
  ('org_memberships', 'SELECT'), ('org_memberships', 'INSERT'), ('org_memberships', 'UPDATE'), ('org_memberships', 'DELETE'),
  ('teams', 'SELECT'), ('teams', 'INSERT'), ('teams', 'UPDATE'), ('teams', 'DELETE'),
  ('team_staff', 'SELECT'), ('team_staff', 'INSERT'), ('team_staff', 'UPDATE'), ('team_staff', 'DELETE'),
  ('team_players', 'SELECT'), ('team_players', 'DELETE'),
  ('team_join_requests', 'SELECT'),
  ('team_members', 'SELECT'), ('team_members', 'DELETE'),
  ('athletes', 'SELECT'),
  ('audit_events', 'SELECT')
),
privs(priv) as (values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')),
expected_rpcs(fn) as (values
  ('add_athlete_to_team'), ('correct_athlete_identity'), ('create_team'), ('create_team_invite'),
  ('decide_join_request'), ('delete_athlete_private'), ('find_athlete_by_cpf_index'),
  ('read_athlete_private'), ('redeem_team_invite'), ('register_athlete'), ('register_my_athlete'),
  ('revoke_team_invite'), ('set_athlete_private'), ('update_athlete_profile'), ('update_team_member')
),
checks as (
  select '01 as 14 tabelas novas existem' as nome,
    not exists (select 1 from new_tables n where to_regclass('public.' || n.tbl) is null) as ok,
    coalesce((select string_agg(n.tbl, ', ') from new_tables n where to_regclass('public.' || n.tbl) is null), '') as detalhe
  union all
  select '02 toda tabela de public tem RLS ligada',
    not exists (select 1 from pg_tables where schemaname = 'public' and not rowsecurity),
    coalesce((select string_agg(tablename, ', ') from pg_tables where schemaname = 'public' and not rowsecurity), '')
  union all
  select '03 anon nao tem NENHUM privilegio em nenhuma tabela de public',
    not exists (select 1 from pg_tables t cross join privs p
      where t.schemaname = 'public' and has_table_privilege('anon', format('public.%I', t.tablename), p.priv)),
    coalesce((select string_agg(t.tablename || ':' || p.priv, ', ') from pg_tables t cross join privs p
      where t.schemaname = 'public' and has_table_privilege('anon', format('public.%I', t.tablename), p.priv)), '')
  union all
  select '04 authenticated so tem o privilegio esperado em cada tabela nova',
    not exists (select 1 from new_tables n cross join privs p
      where to_regclass('public.' || n.tbl) is not null
        and has_table_privilege('authenticated', format('public.%I', n.tbl), p.priv)
        and not exists (select 1 from expected e where e.tbl = n.tbl and e.priv = p.priv)),
    coalesce((select string_agg(n.tbl || ':' || p.priv, ', ') from new_tables n cross join privs p
      where to_regclass('public.' || n.tbl) is not null
        and has_table_privilege('authenticated', format('public.%I', n.tbl), p.priv)
        and not exists (select 1 from expected e where e.tbl = n.tbl and e.priv = p.priv)), '')
  union all
  select '05 os privilegios esperados de authenticated existem',
    not exists (select 1 from expected e where to_regclass('public.' || e.tbl) is not null
      and not has_table_privilege('authenticated', format('public.%I', e.tbl), e.priv)),
    coalesce((select string_agg(e.tbl || ':' || e.priv, ', ') from expected e where to_regclass('public.' || e.tbl) is not null
      and not has_table_privilege('authenticated', format('public.%I', e.tbl), e.priv)), '')
  union all
  select '06 team_invites, invite_attempts e athlete_private sem nenhum privilegio de tabela para authenticated',
    not exists (select 1 from unnest(array['team_invites','invite_attempts','athlete_private']) tb cross join privs p
      where to_regclass('public.' || tb) is not null and has_table_privilege('authenticated', format('public.%I', tb), p.priv)),
    coalesce((select string_agg(tb || ':' || p.priv, ', ') from unnest(array['team_invites','invite_attempts','athlete_private']) tb cross join privs p
      where to_regclass('public.' || tb) is not null and has_table_privilege('authenticated', format('public.%I', tb), p.priv)), '')
  union all
  select '07 code_hash nao e legivel por coluna (nem por anon)',
    to_regclass('public.team_invites') is not null
      and not has_column_privilege('authenticated', 'public.team_invites', 'code_hash', 'SELECT')
      and not has_column_privilege('anon', 'public.team_invites', 'code_hash', 'SELECT'),
    ''
  union all
  select '08 athlete_private sem nenhuma coluna legivel ou gravavel por authenticated',
    to_regclass('public.athlete_private') is not null and not exists (
      select 1 from information_schema.columns c cross join unnest(array['SELECT','INSERT','UPDATE']) p
      where c.table_schema = 'public' and c.table_name = 'athlete_private'
        and has_column_privilege('authenticated', 'public.athlete_private', c.column_name, p)),
    ''
  union all
  select '09 sequencias das tabelas novas fechadas para anon e authenticated',
    not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'S' and c.relname in ('audit_events_id_seq', 'invite_attempts_id_seq')
        and (has_sequence_privilege('anon', c.oid, 'USAGE') or has_sequence_privilege('authenticated', c.oid, 'USAGE')
             or has_sequence_privilege('anon', c.oid, 'UPDATE') or has_sequence_privilege('authenticated', c.oid, 'UPDATE'))),
    ''
  union all
  select '10 anon nao executa nenhuma funcao de public nem de private',
    not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname in ('public', 'private') and p.prokind = 'f' and has_function_privilege('anon', p.oid, 'EXECUTE')),
    coalesce((select string_agg(n.nspname || '.' || p.proname, ', ') from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname in ('public', 'private') and p.prokind = 'f' and has_function_privilege('anon', p.oid, 'EXECUTE')), '')
  union all
  select '11 as 15 RPCs existem, executaveis por authenticated e SECURITY DEFINER com search_path vazio',
    not exists (select 1 from expected_rpcs r where not exists (
      select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = r.fn and p.prosecdef
        and exists (select 1 from unnest(p.proconfig) c where c = 'search_path=""')
        and has_function_privilege('authenticated', p.oid, 'EXECUTE'))),
    coalesce((select string_agg(r.fn, ', ') from expected_rpcs r where not exists (
      select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = r.fn and p.prosecdef
        and exists (select 1 from unnest(p.proconfig) c where c = 'search_path=""')
        and has_function_privilege('authenticated', p.oid, 'EXECUTE'))), '')
  union all
  select '12 nenhuma OUTRA funcao de public e executavel por authenticated (confira as listadas)',
    not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.prokind = 'f' and has_function_privilege('authenticated', p.oid, 'EXECUTE')
        and p.proname not in (select fn from expected_rpcs)),
    coalesce((select string_agg(p.proname, ', ') from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.prokind = 'f' and has_function_privilege('authenticated', p.oid, 'EXECUTE')
        and p.proname not in (select fn from expected_rpcs)), '')
  union all
  select '13 o schema private nao esta exposto na API (Settings > API > Exposed schemas)',
    not exists (select 1 from pg_roles r, unnest(r.rolconfig) c
      where r.rolname = 'authenticator' and c like 'pgrst.db_schemas=%' and c like '%private%'),
    coalesce((select string_agg(c, ' ') from pg_roles r, unnest(r.rolconfig) c
      where r.rolname = 'authenticator' and c like 'pgrst.db_schemas=%'), 'configuracao nao encontrada: confira no painel')
  union all
  select '14 a auditoria e so de insercao (gatilho que barra update e delete)',
    exists (select 1 from pg_trigger t where t.tgrelid = to_regclass('public.audit_events') and t.tgname = 'audit_events_append_only' and not t.tgisinternal),
    ''
  union all
  select '15 athletes nao tem data de nascimento em claro, so o ano',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'athletes' and column_name = 'birth_year')
      and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'athletes' and column_name = 'birth_date'),
    ''
)
select nome, case when ok then 'OK' else 'FALHOU' end as resultado, detalhe
from checks
order by nome;
