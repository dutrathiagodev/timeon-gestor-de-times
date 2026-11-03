-- 00024 · testes de acesso: papeis, time unico, criar time, codigo do time e aceite.
-- Rode depois das migrations (veja supabase/tests/run-local.sh).
\set ON_ERROR_STOP on
\set u1 '00000000-0000-0000-0000-000000000001'
\set u2 '00000000-0000-0000-0000-000000000002'
\set u3 '00000000-0000-0000-0000-000000000003'
\set u4 '00000000-0000-0000-0000-000000000004'
\set u5 '00000000-0000-0000-0000-000000000005'
\set u6 '00000000-0000-0000-0000-000000000006'
\set u7 '00000000-0000-0000-0000-000000000007'
\set u8 '00000000-0000-0000-0000-000000000008'
\set u9 '00000000-0000-0000-0000-000000000009'
\set u10 '00000000-0000-0000-0000-000000000010'
\set orgA 'a0000000-0000-0000-0000-00000000000a'
\set orgB 'b0000000-0000-0000-0000-00000000000b'
\set tA1 'a1000000-0000-0000-0000-0000000000a1'
\set tA2 'a2000000-0000-0000-0000-0000000000a2'
\set tB1 'b1000000-0000-0000-0000-0000000000b1'
begin;

-- Cenario: org A (owner u1, admin u2). Time A1 (volei masculino): coach u3, manager u4.
-- Time A2 (futsal masculino): viewer u5. u6 a u9 sem vinculo. Org B: owner u10 e time B1.
insert into auth.users (id) select ('00000000-0000-0000-0000-0000000000' || lpad(n::text, 2, '0'))::uuid from generate_series(1, 10) n;
insert into public.organizations (id, name, slug) values (:'orgA', 'Org A', 'org-a'), (:'orgB', 'Org B', 'org-b');
insert into public.org_memberships (organization_id, user_id, role) values
  (:'orgA', :'u1', 'owner'), (:'orgA', :'u2', 'admin'), (:'orgB', :'u10', 'owner');
insert into public.teams (id, organization_id, name, slug, sport, category) values
  (:'tA1', :'orgA', 'Volei Masculino', 'volei-masculino', 'volleyball', 'male'),
  (:'tA2', :'orgA', 'Futsal Masculino', 'futsal-masculino', 'futsal', 'male'),
  (:'tB1', :'orgB', 'Basquete B', 'basquete-b', 'basketball', 'mixed');
insert into public.team_staff (team_id, user_id, role) values
  (:'tA1', :'u3', 'coach'), (:'tA1', :'u4', 'manager'), (:'tA2', :'u5', 'viewer');

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
-- Executa o comando e exige o SQLSTATE esperado.
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
-- Quantas linhas de team_players o usuario atual consegue apagar (uid nulo = todas do time).
create function t.delete_players(team uuid, uid uuid default null) returns integer language plpgsql as $$
declare n integer;
begin
  delete from public.team_players where team_id = team and (uid is null or user_id = uid);
  get diagnostics n = row_count;
  return n;
end $$;
create function t.put(key text, val text) returns void language sql as $$
  insert into t.store values (key, val) on conflict (k) do update set v = excluded.v;
$$;
create function t.get(key text) returns text language sql as $$ select v from t.store where k = key; $$;

-- Esportes e papeis ------------------------------------------------------------
select t.expect('chaves de esporte do banco = chaves do codigo',
  (select array_agg(key order by key) from public.sports) =
  array['basketball','football_field','football_society','futsal','handball','volleyball']);
select t.expect_error('papel invalido na comissao', 'insert into public.team_staff (team_id, user_id, role) values (''' || :'tA2' || ''', ''' || :'u6' || ''', ''boss'')', '23514');

-- Um time por esporte + categoria + faixa etaria ---------------------------------
select t.expect_error('mesmo esporte e categoria (adulto) duplicado',
  format('insert into public.teams (organization_id, name, slug, sport, category) values (%L, %L, %L, %L, %L)', :'orgA', 'Outro', 'outro', 'volleyball', 'male'), '23505');
insert into public.teams (organization_id, name, slug, sport, category) values (:'orgA', 'Volei Feminino', 'volei-feminino', 'volleyball', 'female');
select t.expect('mesmo esporte, categoria diferente: pode', true);
insert into public.teams (organization_id, name, slug, sport, category, age_group) values (:'orgA', 'Volei Masc Sub17', 'volei-masc-sub17', 'volleyball', 'male', 'sub17');
select t.expect('mesma categoria com faixa etaria (sub17): pode', true);
select t.expect_error('sub17 duplicada',
  format('insert into public.teams (organization_id, name, slug, sport, category, age_group) values (%L, %L, %L, %L, %L, %L)', :'orgA', 'Outro sub', 'outro-sub', 'volleyball', 'male', 'sub17'), '23505');
insert into public.teams (organization_id, name, slug, sport, category) values (:'orgB', 'Volei Masculino B', 'volei-masculino', 'volleyball', 'male');
select t.expect('outra organizacao pode ter o mesmo esporte e categoria', true);

-- Permissoes por papel -----------------------------------------------------------
select t.as_user(:'u2');
select t.expect('admin: gerencia, escreve e convida', private.can_manage_team(:'tA1') and private.can_write_team(:'tA1') and private.can_invite_players(:'tA1'));
reset role;
select t.as_user(:'u4');
select t.expect('gestor: gerencia, escreve e convida', private.can_manage_team(:'tA1') and private.can_write_team(:'tA1') and private.can_invite_players(:'tA1'));
select t.expect('gestor nao gerencia outro time', not private.can_manage_team(:'tA2'));
reset role;
select t.as_user(:'u3');
select t.expect('tecnico: escreve e convida, mas nao gerencia', private.can_write_team(:'tA1') and private.can_invite_players(:'tA1') and not private.can_manage_team(:'tA1'));
reset role;
select t.as_user(:'u5');
select t.expect('viewer: le, mas nao escreve nem convida', private.can_read_team(:'tA2') and not private.can_write_team(:'tA2') and not private.can_invite_players(:'tA2'));
reset role;

-- Criar time: admin, gestor e tecnico ---------------------------------------------
select t.as_user(:'u2');
select t.put('t_admin', public.create_team(:'orgA', 'Basquete Masculino', 'basquete-masculino', 'basketball', 'male')::text);
select t.expect('admin cria time e nao vira da comissao', not exists (select 1 from public.team_staff where team_id = t.get('t_admin')::uuid));
reset role;
select t.as_user(:'u4');
select t.put('t_manager', public.create_team(:'orgA', 'Handebol Masculino', 'handebol-masculino', 'handball', 'male')::text);
select t.expect('gestor cria time e entra como gestor', (select role from public.team_staff where team_id = t.get('t_manager')::uuid and user_id = :'u4') = 'manager');
reset role;
select t.as_user(:'u3');
select t.put('t_coach', public.create_team(:'orgA', 'Futsal Feminino', 'futsal-feminino', 'futsal', 'female')::text);
select t.expect('tecnico cria time e entra como tecnico, nunca como gestor', (select role from public.team_staff where team_id = t.get('t_coach')::uuid and user_id = :'u3') = 'coach');
select t.expect_error('time repetido volta como violacao de unicidade',
  format('select public.create_team(%L, %L, %L, %L, %L)', :'orgA', 'Copia', 'copia', 'futsal', 'female'), '23505');
reset role;
select t.as_user(:'u5');
select t.expect_error('viewer nao cria time', format('select public.create_team(%L, %L, %L, %L)', :'orgA', 'Nao', 'nao', 'handball'), '42501');
reset role;
select t.as_user(:'u6');
select t.expect_error('sem vinculo nao cria time', format('select public.create_team(%L, %L, %L, %L)', :'orgA', 'Nao', 'nao2', 'handball'), '42501');
reset role;
select t.as_user(:'u3');
select t.expect_error('tecnico nao cria time em outra organizacao', format('select public.create_team(%L, %L, %L, %L)', :'orgB', 'Nao', 'nao3', 'handball'), '42501');
reset role;

-- Gerar codigo --------------------------------------------------------------------
select t.as_user(:'u2');
select t.put('code_admin', (select invite_code from public.create_team_invite(:'tA1', 'player', 24, 10, false)));
select t.expect('codigo no formato XXXX-XXXX-XXXX', t.get('code_admin') ~ '^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$');
select t.expect_error('ttl zero', format('select * from public.create_team_invite(%L, %L, 0)', :'tA1', 'player'), '22023');
select t.expect_error('ttl acima de 30 dias', format('select * from public.create_team_invite(%L, %L, 721)', :'tA1', 'player'), '22023');
select t.expect_error('usos zero', format('select * from public.create_team_invite(%L, %L, 24, 0)', :'tA1', 'player'), '22023');
select t.expect_error('usos acima de 200', format('select * from public.create_team_invite(%L, %L, 24, 201)', :'tA1', 'player'), '22023');
select t.expect_error('papel invalido', format('select * from public.create_team_invite(%L, %L)', :'tA1', 'admin'), '22023');
select t.put('code_coach_admin', (select invite_code from public.create_team_invite(:'tA1', 'coach', 24, 30, false)));
reset role;
select t.expect('codigo de tecnico vale 1 uso mesmo pedindo 30',
  (select max_uses from public.team_invites where role = 'coach') = 1);
select t.expect('so o hash fica guardado, nunca o codigo',
  exists (select 1 from public.team_invites where code_hash = sha256(convert_to(replace(t.get('code_admin'), '-', ''), 'UTF8')))
  and not exists (select 1 from public.team_invites where code_hash = convert_to(replace(t.get('code_admin'), '-', ''), 'UTF8')));

select t.as_user(:'u3');
select t.put('code_coach_player', (select invite_code from public.create_team_invite(:'tA1', 'player', 24, 5, true)));
select t.expect('tecnico gera codigo de jogador do proprio time', true);
select t.expect_error('tecnico nao gera codigo de tecnico', format('select * from public.create_team_invite(%L, %L)', :'tA1', 'coach'), '42501');
select t.expect_error('tecnico nao gera codigo de gestor', format('select * from public.create_team_invite(%L, %L)', :'tA1', 'manager'), '42501');
select t.expect_error('tecnico nao gera codigo de outro time', format('select * from public.create_team_invite(%L, %L)', :'tA2', 'player'), '42501');
reset role;
select t.as_user(:'u4');
select t.put('code_manager_player', (select invite_code from public.create_team_invite(:'tA1', 'player', 24, 5, true)));
select t.expect('gestor gera codigo de jogador', true);
select t.expect_error('gestor nao gera codigo de gestor', format('select * from public.create_team_invite(%L, %L)', :'tA1', 'manager'), '42501');
reset role;
select t.as_user(:'u5');
select t.expect_error('viewer nao gera codigo', format('select * from public.create_team_invite(%L, %L)', :'tA2', 'player'), '42501');
reset role;
select t.as_user(:'u10');
select t.expect_error('admin de outra organizacao nao gera codigo', format('select * from public.create_team_invite(%L, %L)', :'tA1', 'player'), '42501');
reset role;

-- O hash nunca sai do banco -------------------------------------------------------
select t.as_user(:'u2');
select t.expect_error('admin nao le code_hash', 'select code_hash from public.team_invites', '42501');
select t.expect_error('select * tambem falha (coluna protegida)', 'select * from public.team_invites', '42501');
select t.expect('admin lista os codigos sem o hash', (select count(*) from public.team_invites) = 4);
reset role;
select t.as_user(:'u3');
select t.expect('tecnico ve o proprio codigo e os de jogador do time, nao o de tecnico do admin',
  (select count(*) from public.team_invites) = 3 and not exists (select 1 from public.team_invites where role = 'coach'));
select t.expect_error('INSERT direto em team_invites negado', format('insert into public.team_invites (team_id, role, code_hash, expires_at, max_uses) values (%L, %L, %L, now() + interval ''1 day'', 1)', :'tA1', 'player', 'x'::bytea), '42501');
reset role;

-- Usar o codigo: entrada na hora -----------------------------------------------------
select t.as_user(:'u6');
select t.expect('codigo invalido responde invalid', (select outcome from public.redeem_team_invite('ZZZZ-ZZZZ-ZZZZ')) = 'invalid');
select t.expect('codigo curto responde invalid', (select outcome from public.redeem_team_invite('ABC')) = 'invalid');
select t.expect('codigo vazio responde invalid', (select outcome from public.redeem_team_invite('')) = 'invalid');
select t.expect('sem aceite: entra na hora, com minusculas e espacos', (select outcome from public.redeem_team_invite(lower(replace(t.get('code_admin'), '-', ' ')))) = 'joined');
select t.expect('jogador le o time e a organizacao', private.can_read_team(:'tA1') and (select count(*) from public.teams where id = :'tA1') = 1 and (select count(*) from public.organizations) = 1);
select t.expect('jogador nao escreve nem convida', not private.can_write_team(:'tA1') and not private.can_invite_players(:'tA1') and not private.can_manage_team(:'tA1'));
select t.expect('jogador nao ve outros times da organizacao', (select count(*) from public.teams) = 1);
select t.expect('jogador nao lista a comissao', (select count(*) from public.team_staff) = 0);
select t.expect('jogador ve so a propria linha em team_players', (select count(*) from public.team_players) = 1);
select t.expect('usar de novo o mesmo codigo: ja e membro', (select outcome from public.redeem_team_invite(t.get('code_admin'))) = 'already_member');
reset role;
select t.expect('uso do codigo foi contado uma vez', (select used_count from public.team_invites where code_hash = private.invite_code_hash(t.get('code_admin'))) = 1);

-- Travar quem fica chutando ---------------------------------------------------------------
select t.as_user(:'u9');
select t.expect('5 erros seguidos respondem invalid', (select count(*) from generate_series(1, 5) g, lateral public.redeem_team_invite('WRONG-WRONG-' || g::text)) = 5);
select t.expect('depois de 5 erros ate o codigo certo e travado', (select outcome from public.redeem_team_invite(t.get('code_admin'))) = 'too_many_attempts');
reset role;
update public.invite_attempts set attempted_at = now() - interval '20 minutes';
select t.as_user(:'u9');
select t.expect('passada a janela de 15 minutos, volta a funcionar', (select outcome from public.redeem_team_invite(t.get('code_admin'))) = 'joined');
reset role;

-- Usar o codigo: com aceite ------------------------------------------------------------------
select t.as_user(:'u7');
select t.expect('com aceite: fica pendente', (select outcome from public.redeem_team_invite(t.get('code_coach_player'))) = 'pending');
select t.expect('pendente ainda nao le o time', not private.can_read_team(:'tA1'));
select t.expect('pendente ve o proprio pedido', (select count(*) from public.team_join_requests) = 1);
select t.expect('pedir de novo: ja esta pendente', (select outcome from public.redeem_team_invite(t.get('code_coach_player'))) = 'already_pending');
select t.put('req_u7', (select id::text from public.team_join_requests limit 1));
select t.expect_error('ninguem decide o proprio pedido', format('select public.decide_join_request(%L, true)', t.get('req_u7')), '42501');
reset role;
select t.as_user(:'u8');
select t.expect('outra pessoa nao ve o pedido alheio', (select count(*) from public.team_join_requests) = 0);
select t.expect_error('quem nao e da comissao nao decide', format('select public.decide_join_request(%L, true)', t.get('req_u7')), '42501');
select t.expect('u8 entra pendente com outro codigo', (select outcome from public.redeem_team_invite(t.get('code_manager_player'))) = 'pending');
select t.put('req_u8', (select id::text from public.team_join_requests limit 1));
reset role;
select t.as_user(:'u3');
select t.expect('tecnico ve os dois pedidos de jogador do time', (select count(*) from public.team_join_requests where status = 'pending') = 2);
select t.expect('tecnico aceita o pedido', public.decide_join_request(t.get('req_u7')::uuid, true) = 'accepted');
select t.expect_error('pedido ja decidido nao decide de novo', format('select public.decide_join_request(%L, false)', t.get('req_u7')), '23514');
reset role;
select t.as_user(:'u7');
select t.expect('depois de aceito, le o time', private.can_read_team(:'tA1'));
reset role;
select t.as_user(:'u4');
select t.expect('gestor recusa o pedido', public.decide_join_request(t.get('req_u8')::uuid, false) = 'rejected');
reset role;
select t.as_user(:'u8');
select t.expect('recusado continua sem acesso', not private.can_read_team(:'tA1'));
reset role;

-- Codigo de tecnico: 1 uso e so o admin decide ---------------------------------------------------
select t.as_user(:'u8');
select t.expect('codigo de tecnico sem aceite: entra como tecnico', (select outcome from public.redeem_team_invite(t.get('code_coach_admin'))) = 'joined');
select t.expect('virou tecnico do time', (select role from public.team_staff where team_id = :'tA1' and user_id = :'u8') = 'coach');
reset role;
select t.as_user(:'u6');
select t.expect('mesmo codigo de tecnico, 2a pessoa: esgotado', (select outcome from public.redeem_team_invite(t.get('code_coach_admin'))) = 'invalid');
reset role;
select t.as_user(:'u2');
select t.put('code_manager_staff', (select invite_code from public.create_team_invite(:'tA2', 'manager', 24, 1, true)));
reset role;
select t.as_user(:'u9');
select t.expect('codigo de gestor com aceite: pendente', (select outcome from public.redeem_team_invite(t.get('code_manager_staff'))) = 'pending');
select t.put('req_u9', (select id::text from public.team_join_requests where user_id = :'u9' and role = 'manager'));
reset role;
select t.as_user(:'u3');
select t.expect_error('tecnico nao decide pedido de gestor', format('select public.decide_join_request(%L, true)', t.get('req_u9')), '42501');
reset role;
select t.as_user(:'u2');
select t.expect('admin aceita pedido de gestor', public.decide_join_request(t.get('req_u9')::uuid, true) = 'accepted');
select t.expect('virou gestor do time A2', (select role from public.team_staff where team_id = :'tA2' and user_id = :'u9') = 'manager');
reset role;

-- Revogar e vencer ------------------------------------------------------------------------------------
-- O id do convite e guardado como superusuario: o cliente nao le code_hash.
select t.as_user(:'u2');
select t.put('code_to_revoke', (select invite_code from public.create_team_invite(:'tA1', 'player', 24, 5, false)));
reset role;
select t.put('id_to_revoke', (select id::text from public.team_invites where code_hash = private.invite_code_hash(t.get('code_to_revoke'))));
select t.as_user(:'u4');
select t.expect_error('gestor nao revoga codigo de outra pessoa', format('select public.revoke_team_invite(%L)', t.get('id_to_revoke')), '42501');
reset role;
select t.as_user(:'u2');
select public.revoke_team_invite(t.get('id_to_revoke')::uuid);
select t.expect('admin revoga qualquer codigo', true);
reset role;
select t.as_user(:'u1');
select t.expect('codigo revogado vira invalid', (select outcome from public.redeem_team_invite(t.get('code_to_revoke'))) = 'invalid');
reset role;
select t.as_user(:'u3');
select t.put('code_mine', (select invite_code from public.create_team_invite(:'tA1', 'player', 1, 5, false)));
reset role;
select t.put('id_mine', (select id::text from public.team_invites where code_hash = private.invite_code_hash(t.get('code_mine'))));
select t.as_user(:'u3');
select public.revoke_team_invite(t.get('id_mine')::uuid);
select t.expect('quem gerou revoga o proprio codigo', true);
reset role;
select t.expect('revogar duas vezes nao muda a data', (select revoked_at is not null from public.team_invites where id = t.get('id_mine')::uuid));
select t.as_user(:'u2');
select t.put('code_old', (select invite_code from public.create_team_invite(:'tA1', 'player', 1, 5, false)));
reset role;
update public.team_invites set created_at = now() - interval '3 days', expires_at = now() - interval '2 days'
  where code_hash = private.invite_code_hash(t.get('code_old'));
select t.as_user(:'u1');
select t.expect('codigo vencido vira invalid', (select outcome from public.redeem_team_invite(t.get('code_old'))) = 'invalid');
reset role;

-- Time arquivado nao convida ------------------------------------------------------------------------------
update public.teams set status = 'archived' where id = :'tA2';
select t.as_user(:'u2');
select t.expect_error('time arquivado nao gera codigo', format('select * from public.create_team_invite(%L, %L)', :'tA2', 'player'), '23514');
reset role;

-- Remover jogador ------------------------------------------------------------------------------------------------
select t.as_user(:'u3');
select t.expect('tecnico nao remove jogador (so gestor e admin)', t.delete_players(:'tA1') = 0);
reset role;
select t.as_user(:'u4');
select t.expect('gestor remove jogador', t.delete_players(:'tA1', :'u7') = 1);
reset role;
select t.as_user(:'u7');
select t.expect('removido perde o acesso', not private.can_read_team(:'tA1'));
reset role;

-- Auditoria -----------------------------------------------------------------------------------------------------------
select t.as_user(:'u2');
select t.expect('admin le a auditoria', (select count(*) from public.audit_events) > 10);
select t.expect('auditou criar time, gerar, usar, decidir e revogar',
  (select count(distinct action) from public.audit_events where action in ('team.created', 'invite.created', 'invite.redeemed', 'join_request.accepted', 'join_request.rejected', 'invite.revoked')) = 6);
select t.expect_error('cliente nao escreve na auditoria', format('insert into public.audit_events (organization_id, action, entity) values (%L, %L, %L)', :'orgA', 'x', 'y'), '42501');
reset role;
select t.expect('auditoria nunca guarda o codigo',
  not exists (select 1 from public.audit_events where data::text like '%' || replace(t.get('code_admin'), '-', '') || '%' or data::text like '%' || t.get('code_admin') || '%'));
select t.as_user(:'u3');
select t.expect('tecnico nao le a auditoria', (select count(*) from public.audit_events) = 0);
reset role;
select t.expect_error('auditoria e so de insercao (update)', 'update public.audit_events set entity = ''x''', '42501');
select t.expect_error('auditoria e so de insercao (delete)', 'delete from public.audit_events', '42501');

-- anon nao tem nada ------------------------------------------------------------------------------------------------------
set local role anon;
select t.expect_error('anon nao usa codigo', 'select * from public.redeem_team_invite(''ABCD-EFGH-JKLM'')', '42501');
select t.expect_error('anon nao cria time', format('select public.create_team(%L, %L, %L, %L)', :'orgA', 'X', 'x', 'futsal'), '42501');
select t.expect_error('anon nao le team_invites', 'select 1 from public.team_invites', '42501');
select t.expect_error('anon nao le team_players', 'select 1 from public.team_players', '42501');
select t.expect_error('anon nao le a auditoria', 'select 1 from public.audit_events', '42501');
reset role;
-- sem sessao (auth.uid() nulo) tambem nao passa
select t.as_user('');
select t.expect_error('sem sessao nao usa codigo', 'select * from public.redeem_team_invite(''ABCD-EFGH-JKLM'')', '42501');
reset role;

rollback;
\echo 'TODOS OS TESTES DE ACESSO PASSARAM'
