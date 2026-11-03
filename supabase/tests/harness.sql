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
