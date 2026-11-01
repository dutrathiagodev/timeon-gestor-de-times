-- 00017 · testes de RLS da fundacao multi-time. Rode depois das migrations
-- (veja supabase/tests/run-local.sh). Falha com excecao se algo estiver errado.
\set ON_ERROR_STOP on
begin;

-- Cenario: org A (owner u1, admin u2; time A1 com coach u3; time A2 com viewer u4),
-- org B (owner u5) e u6 sem vinculo nenhum.
insert into auth.users (id) values
  ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003'), ('00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000005'), ('00000000-0000-0000-0000-000000000006');
insert into public.organizations (id, name, slug) values
  ('a0000000-0000-0000-0000-00000000000a', 'Org A', 'org-a'),
  ('b0000000-0000-0000-0000-00000000000b', 'Org B', 'org-b');
insert into public.org_memberships (organization_id, user_id, role) values
  ('a0000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('a0000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000002', 'admin'),
  ('b0000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-000000000005', 'owner');
insert into public.teams (id, organization_id, name, slug, sport) values
  ('a1000000-0000-0000-0000-0000000000a1', 'a0000000-0000-0000-0000-00000000000a', 'Volei A', 'volei-a', 'volleyball'),
  ('a2000000-0000-0000-0000-0000000000a2', 'a0000000-0000-0000-0000-00000000000a', 'Futsal A', 'futsal-a', 'futsal'),
  ('b1000000-0000-0000-0000-0000000000b1', 'b0000000-0000-0000-0000-00000000000b', 'Basquete B', 'basquete-b', 'basketball');
insert into public.team_staff (team_id, user_id, role) values
  ('a1000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000003', 'coach'),
  ('a2000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-000000000004', 'viewer');

create schema t;
grant usage on schema t to authenticated;

create function t.as_user(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', uid, true);
  execute 'set local role authenticated';
end $$;

create function t.expect(label text, ok boolean) returns void language plpgsql as $$
begin
  if not ok then raise exception 'FALHOU: %', label; end if;
  raise notice 'ok - %', label;
end $$;

-- u6 (sem vinculo) nao ve nada
select t.as_user('00000000-0000-0000-0000-000000000006');
select t.expect('u6 nao ve organizacoes', (select count(*) from public.organizations) = 0);
select t.expect('u6 nao ve times', (select count(*) from public.teams) = 0);
select t.expect('u6 nao ve vinculos', (select count(*) from public.org_memberships) = 0);
reset role;

-- u1 (owner A) enxerga a org A e seus dois times, nao a org B
select t.as_user('00000000-0000-0000-0000-000000000001');
select t.expect('owner ve so a propria organizacao', (select count(*) from public.organizations) = 1);
select t.expect('owner ve os 2 times da org A', (select count(*) from public.teams) = 2);
select t.expect('owner ve a lista de vinculos da org', (select count(*) from public.org_memberships) = 2);
update public.organizations set name = 'Org A Renomeada' where id = 'a0000000-0000-0000-0000-00000000000a';
select t.expect('owner renomeia a organizacao', (select name from public.organizations) = 'Org A Renomeada');
reset role;

-- u2 (admin A): cria time na org A, mas nao na B nem promove ninguem
select t.as_user('00000000-0000-0000-0000-000000000002');
insert into public.teams (organization_id, name, slug, sport)
  values ('a0000000-0000-0000-0000-00000000000a', 'Basquete A', 'basquete-a', 'basketball');
select t.expect('admin cria time na propria org', (select count(*) from public.teams) = 3);
do $$ begin
  insert into public.teams (organization_id, name, slug, sport)
    values ('b0000000-0000-0000-0000-00000000000b', 'Invasor', 'invasor', 'volleyball');
  raise exception 'FALHOU: admin criou time em outra org';
exception when insufficient_privilege then raise notice 'ok - admin nao cria time em outra org';
end $$;
do $$ begin
  insert into public.org_memberships (organization_id, user_id, role)
    values ('a0000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000006', 'owner');
  raise exception 'FALHOU: admin promoveu owner';
exception when insufficient_privilege then raise notice 'ok - admin nao cria vinculo (so owner)';
end $$;
update public.organizations set name = 'Hack' where id = 'a0000000-0000-0000-0000-00000000000a';
select t.expect('admin nao altera a organizacao', (select name from public.organizations) = 'Org A Renomeada');
reset role;

-- u3 (coach do time A1): le so o proprio time e escreve nele, mas nao cria time
select t.as_user('00000000-0000-0000-0000-000000000003');
select t.expect('coach ve so o proprio time', (select count(*) from public.teams) = 1);
select t.expect('coach ve a organizacao do time', (select count(*) from public.organizations) = 1);
select t.expect('coach nao ve vinculos de org', (select count(*) from public.org_memberships) = 0);
select t.expect('coach pode escrever no proprio time', private.can_write_team('a1000000-0000-0000-0000-0000000000a1'));
select t.expect('coach nao escreve em outro time', not private.can_write_team('a2000000-0000-0000-0000-0000000000a2'));
do $$ begin
  insert into public.teams (organization_id, name, slug, sport)
    values ('a0000000-0000-0000-0000-00000000000a', 'Novo', 'novo', 'handball');
  raise exception 'FALHOU: coach criou time';
exception when insufficient_privilege then raise notice 'ok - coach nao cria time';
end $$;
reset role;

-- u4 (viewer do time A2): le, mas nao escreve
select t.as_user('00000000-0000-0000-0000-000000000004');
select t.expect('viewer le o proprio time', private.can_read_team('a2000000-0000-0000-0000-0000000000a2'));
select t.expect('viewer nao escreve', not private.can_write_team('a2000000-0000-0000-0000-0000000000a2'));
select t.expect('viewer nao le time de outra comissao', not private.can_read_team('a1000000-0000-0000-0000-0000000000a1'));
reset role;

-- u5 (owner B) nao enxerga a org A
select t.as_user('00000000-0000-0000-0000-000000000005');
select t.expect('owner B so ve a org B', (select count(*) from public.organizations) = 1);
select t.expect('owner B nao ve times da org A', (select count(*) from public.teams where organization_id = 'a0000000-0000-0000-0000-00000000000a') = 0);
reset role;

-- anon nao tem nenhum acesso
set local role anon;
do $$ begin
  perform 1 from public.teams;
  raise exception 'FALHOU: anon leu teams';
exception when insufficient_privilege then raise notice 'ok - anon sem acesso a teams';
end $$;
reset role;

-- regras de integridade (como superusuario)
do $$ begin
  delete from public.org_memberships
    where organization_id = 'b0000000-0000-0000-0000-00000000000b' and role = 'owner';
  raise exception 'FALHOU: removeu o ultimo owner';
exception when check_violation then raise notice 'ok - ultimo owner e protegido';
end $$;
do $$ begin
  update public.teams set sport = 'futsal' where id = 'a1000000-0000-0000-0000-0000000000a1';
  raise exception 'FALHOU: trocou o esporte do time';
exception when check_violation then raise notice 'ok - esporte do time nao muda';
end $$;
delete from public.organizations where id = 'b0000000-0000-0000-0000-00000000000b';
select t.expect('apagar a organizacao inteira e permitido', (select count(*) from public.organizations) = 1);

rollback;
\echo 'TODOS OS TESTES DE RLS PASSARAM'
