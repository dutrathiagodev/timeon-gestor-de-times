-- Simula o minimo do Supabase para testar migrations em um Postgres puro:
-- papeis anon/authenticated, schema auth com users e auth.uid().
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end $$;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
grant usage on schema auth to authenticated;
grant usage on schema public to anon, authenticated;

-- No Supabase, tudo que o usuario postgres cria em public nasce com permissao para
-- anon e authenticated (ALTER DEFAULT PRIVILEGES do projeto). Sem isto os testes nao
-- veriam permissao a mais; com isto, so passa o que as migrations revogam de proposito.
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;

-- O projeto do TimeOn tem o recurso "Automatically enable RLS" do Supabase: uma funcao
-- rls_auto_enable() em public e um gatilho que liga o RLS de toda tabela nova. Reproduz-se
-- aqui para as migrations rodarem como no banco real. Por ser funcao de gatilho de evento,
-- a API nao consegue chama-la, e a auditoria de permissoes a ignora.
create function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  cmd record;
begin
  for cmd in
    select * from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name = 'public' then
      execute format('alter table if exists %s enable row level security', cmd.object_identity);
    end if;
  end loop;
end;
$$;
create event trigger ensure_rls on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.rls_auto_enable();

