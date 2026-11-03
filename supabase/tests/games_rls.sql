-- 00040 · testes da agenda de jogos (RLS, regras de homologacao e auditoria).
-- Rode depois das migrations (veja supabase/tests/run-local.sh).
\set ON_ERROR_STOP on
\set u1 '00000000-0000-0000-0000-000000000001'
\set u2 '00000000-0000-0000-0000-000000000002'
\set u3 '00000000-0000-0000-0000-000000000003'
\set u4 '00000000-0000-0000-0000-000000000004'
\set u6 '00000000-0000-0000-0000-000000000006'
\set u8 '00000000-0000-0000-0000-000000000008'
\set u9 '00000000-0000-0000-0000-000000000009'
\set u10 '00000000-0000-0000-0000-000000000010'
\set orgA 'a0000000-0000-0000-0000-00000000000a'
\set orgB 'b0000000-0000-0000-0000-00000000000b'
\set tA1 'a1000000-0000-0000-0000-0000000000a1'
\set tA2 'a2000000-0000-0000-0000-0000000000a2'
\set tB1 'b1000000-0000-0000-0000-0000000000b1'
begin;

-- Org A (owner u1, admin u2). A1 = volei (coach u3, manager u4, jogador u6); A2 = futsal (manager u9).
-- u8 sem vinculo. Org B: owner u10, time B1.
insert into auth.users (id) select ('00000000-0000-0000-0000-0000000000' || lpad(n::text, 2, '0'))::uuid from generate_series(1, 10) n;
insert into public.organizations (id, name, slug) values (:'orgA', 'Org A', 'org-a'), (:'orgB', 'Org B', 'org-b');
insert into public.org_memberships (organization_id, user_id, role) values
  (:'orgA', :'u1', 'owner'), (:'orgA', :'u2', 'admin'), (:'orgB', :'u10', 'owner');
insert into public.teams (id, organization_id, name, slug, sport, category) values
  (:'tA1', :'orgA', 'Volei Masculino', 'volei-masculino', 'volleyball', 'male'),
  (:'tA2', :'orgA', 'Futsal Masculino', 'futsal-masculino', 'futsal', 'male'),
  (:'tB1', :'orgB', 'Basquete B', 'basquete-b', 'basketball', 'mixed');
insert into public.team_staff (team_id, user_id, role) values
  (:'tA1', :'u3', 'coach'), (:'tA1', :'u4', 'manager'), (:'tA2', :'u9', 'manager');
insert into public.team_players (team_id, user_id) values (:'tA1', :'u6');

create schema t;
grant usage on schema t to authenticated, anon;
create table t.store (k text primary key, v text not null);
grant all on t.store to authenticated;
create function t.as_user(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', uid, true);
  execute 'set local role authenticated';
end $$;
create function t.expect(label text, ok boolean) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FALHOU: %', label; end if;
  raise notice 'ok - %', label;
end $$;
create function t.expect_error(label text, stmt text, expected text) returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    if sqlstate = expected then raise notice 'ok - %', label; return; end if;
    raise exception 'FALHOU: % (esperava %, veio % %)', label, expected, sqlstate, sqlerrm;
  end;
  raise exception 'FALHOU: % (nao deu erro)', label;
end $$;
create function t.put(key text, val text) returns void language sql as $$
  insert into t.store values (key, val) on conflict (k) do update set v = excluded.v;
$$;
create function t.get(key text) returns text language sql as $$ select v from t.store where k = key; $$;

-- Quem cria -------------------------------------------------------------------------------------------------------------------------
select t.as_user(:'u4');
insert into public.games (team_id, kind, opponent, venue, starts_at)
  values (:'tA1', 'friendly', 'Time Rival', 'Ginasio', now() + interval '3 days');
select t.put('g1', (select id::text from public.games where team_id = :'tA1'));
select t.expect('gestor cria jogo no proprio time', t.get('g1') is not null);
select t.expect('o jogo nasce agendado e com o criador', (select status = 'scheduled' and created_by = :'u4' from public.games where id = t.get('g1')::uuid));
select t.expect_error('gestor nao cria jogo em time de outro gestor', format($q$insert into public.games (team_id, kind, opponent, starts_at) values (%L, 'friendly', 'X', now())$q$, :'tA2'), '42501');
select t.expect_error('gestor nao cria jogo em outra organizacao', format($q$insert into public.games (team_id, kind, opponent, starts_at) values (%L, 'friendly', 'X', now())$q$, :'tB1'), '42501');
insert into public.games (team_id, kind, opponent, starts_at, status)
  values (:'tA1', 'friendly', 'Outro', now() + interval '5 days', 'finished');
select t.expect('tentar nascer encerrado vira agendado', (select status = 'scheduled' from public.games where opponent = 'Outro'));
reset role;

select t.as_user(:'u2');
insert into public.games (team_id, kind, starts_at) values (:'tA2', 'training', now() + interval '1 day');
select t.expect('admin da organizacao cria jogo em qualquer time dela', (select count(*) from public.games where team_id = :'tA2') = 1);
reset role;

select t.as_user(:'u3');
select t.expect_error('tecnico nao cria jogo', format($q$insert into public.games (team_id, kind, opponent, starts_at) values (%L, 'friendly', 'X', now())$q$, :'tA1'), '42501');
select t.expect('tecnico ve os jogos do proprio time', (select count(*) from public.games where team_id = :'tA1') = 2);
update public.games set venue = 'Quadra B' where id = t.get('g1')::uuid;
select t.expect('tecnico nao altera jogo (nenhuma linha afetada)', (select venue from public.games where id = t.get('g1')::uuid) = 'Ginasio');
delete from public.games where id = t.get('g1')::uuid;
select t.expect('tecnico nao apaga jogo', (select count(*) from public.games where id = t.get('g1')::uuid) = 1);
reset role;

select t.as_user(:'u6');
select t.expect('jogador ve os jogos do proprio time', (select count(*) from public.games where team_id = :'tA1') = 2);
select t.expect_error('jogador nao cria jogo', format($q$insert into public.games (team_id, kind, opponent, starts_at) values (%L, 'friendly', 'X', now())$q$, :'tA1'), '42501');
update public.games set status = 'cancelled' where id = t.get('g1')::uuid;
select t.expect('jogador nao altera jogo', (select status from public.games where id = t.get('g1')::uuid) = 'scheduled');
reset role;

select t.as_user(:'u8');
select t.expect('quem nao tem vinculo nao ve nenhum jogo', (select count(*) from public.games) = 0);
reset role;
select t.as_user(:'u9');
select t.expect('gestor de outro time nao ve os jogos do volei', (select count(*) from public.games where team_id = :'tA1') = 0);
select t.expect('mas ve os do proprio time', (select count(*) from public.games where team_id = :'tA2') = 1);
reset role;
select t.as_user(:'u10');
select t.expect('outra organizacao nao ve nada da Org A', (select count(*) from public.games where team_id in (:'tA1', :'tA2')) = 0);
reset role;

-- Edicao e homologacao -----------------------------------------------------------------------------------------------------------
select t.as_user(:'u4');
update public.games set venue = 'Quadra B', status = 'confirmed' where id = t.get('g1')::uuid;
select t.expect('gestor edita local e confirma', (select venue = 'Quadra B' and status = 'confirmed' from public.games where id = t.get('g1')::uuid));
select t.expect_error('o jogo nao troca de time', format('update public.games set team_id = %L where id = %L', :'tA2', t.get('g1')), '42501');
select t.expect_error('nao se homologa jogo que nao terminou', format($q$update public.games set status = 'homologated' where id = %L$q$, t.get('g1')), '42501');
update public.games set status = 'in_progress' where id = t.get('g1')::uuid;
update public.games set status = 'finished' where id = t.get('g1')::uuid;
update public.games set status = 'homologated' where id = t.get('g1')::uuid;
select t.expect('gestor homologa jogo encerrado, com quem e quando', (select status = 'homologated' and homologated_by = :'u4' and homologated_at is not null from public.games where id = t.get('g1')::uuid));
select t.expect_error('jogo homologado nao muda', format($q$update public.games set venue = 'Outro' where id = %L$q$, t.get('g1')), '42501');
select t.expect_error('jogo homologado nao volta atras', format($q$update public.games set status = 'scheduled' where id = %L$q$, t.get('g1')), '42501');
select t.expect_error('jogo homologado nao some', format('delete from public.games where id = %L', t.get('g1')), '42501');
reset role;

-- Validacoes -------------------------------------------------------------------------------------------------------------------------
select t.as_user(:'u2');
select t.expect_error('amistoso exige adversario', format($q$insert into public.games (team_id, kind, starts_at) values (%L, 'friendly', now())$q$, :'tA1'), '23514');
select t.expect_error('jogo de liga exige adversario', format($q$insert into public.games (team_id, kind, starts_at) values (%L, 'league', now())$q$, :'tA1'), '23514');
select t.expect_error('tipo invalido', format($q$insert into public.games (team_id, kind, opponent, starts_at) values (%L, 'copa', 'X', now())$q$, :'tA1'), '23514');
select t.expect_error('horario obrigatorio', format($q$insert into public.games (team_id, kind, opponent) values (%L, 'friendly', 'X')$q$, :'tA1'), '23502');
insert into public.games (team_id, kind, opponent, starts_at) values (:'tA1', 'league', 'Time da Liga', now() + interval '9 days');
select t.expect('jogo de liga e so um tipo de jogo no calendario', (select count(*) from public.games where kind = 'league') = 1);
select t.put('g2', (select id::text from public.games where kind = 'league'));
delete from public.games where id = t.get('g2')::uuid;
select t.expect('admin apaga jogo que ainda nao foi homologado', (select count(*) from public.games where id = t.get('g2')::uuid) = 0);
reset role;

-- Auditoria ------------------------------------------------------------------------------------------------------------------------------
select t.expect('criacao, edicao, homologacao e exclusao ficam na auditoria',
  (select count(*) from public.audit_events where action = 'game.created') >= 4
  and exists (select 1 from public.audit_events where action = 'game.updated')
  and exists (select 1 from public.audit_events where action = 'game.homologated' and actor_id = :'u4')
  and exists (select 1 from public.audit_events where action = 'game.deleted' and actor_id = :'u2'));
select t.expect('a auditoria do jogo nao guarda adversario nem local',
  not exists (select 1 from public.audit_events where entity = 'game' and data::text ~* '(rival|ginasio|quadra|liga)'));

-- anon ---------------------------------------------------------------------------------------------------------------------------------------
set local role anon;
select t.expect_error('anon nao le jogos', 'select 1 from public.games', '42501');
select t.expect_error('anon nao cria jogos', format($q$insert into public.games (team_id, kind, opponent, starts_at) values (%L, 'friendly', 'X', now())$q$, :'tA1'), '42501');
reset role;

rollback;
\echo 'TODOS OS TESTES DE JOGOS PASSARAM'
