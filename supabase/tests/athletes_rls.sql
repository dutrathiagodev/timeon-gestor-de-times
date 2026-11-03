-- 00025 · testes de atletas, perfil esportivo por time e CPF protegido.
-- Rode depois das migrations (veja supabase/tests/run-local.sh).
\set ON_ERROR_STOP on
\set u1 '00000000-0000-0000-0000-000000000001'
\set u2 '00000000-0000-0000-0000-000000000002'
\set u3 '00000000-0000-0000-0000-000000000003'
\set u4 '00000000-0000-0000-0000-000000000004'
\set u6 '00000000-0000-0000-0000-000000000006'
\set u7 '00000000-0000-0000-0000-000000000007'
\set u8 '00000000-0000-0000-0000-000000000008'
\set u9 '00000000-0000-0000-0000-000000000009'
\set u10 '00000000-0000-0000-0000-000000000010'
\set orgA 'a0000000-0000-0000-0000-00000000000a'
\set orgB 'b0000000-0000-0000-0000-00000000000b'
\set tA1 'a1000000-0000-0000-0000-0000000000a1'
\set tA2 'a2000000-0000-0000-0000-0000000000a2'
\set tA3 'a3000000-0000-0000-0000-0000000000a3'
\set tB1 'b1000000-0000-0000-0000-0000000000b1'
begin;

-- Cenario: org A (owner u1, admin u2). A1 = volei masculino (coach u3, manager u4, jogadores u6 e u7),
-- A2 = futsal masculino (manager u9), A3 = volei feminino. u8 sem vinculo. Org B: owner u10, time B1.
insert into auth.users (id) select ('00000000-0000-0000-0000-0000000000' || lpad(n::text, 2, '0'))::uuid from generate_series(1, 10) n;
insert into public.organizations (id, name, slug) values (:'orgA', 'Org A', 'org-a'), (:'orgB', 'Org B', 'org-b');
insert into public.org_memberships (organization_id, user_id, role) values
  (:'orgA', :'u1', 'owner'), (:'orgA', :'u2', 'admin'), (:'orgB', :'u10', 'owner');
insert into public.teams (id, organization_id, name, slug, sport, category) values
  (:'tA1', :'orgA', 'Volei Masculino', 'volei-masculino', 'volleyball', 'male'),
  (:'tA2', :'orgA', 'Futsal Masculino', 'futsal-masculino', 'futsal', 'male'),
  (:'tA3', :'orgA', 'Volei Feminino', 'volei-feminino', 'volleyball', 'female'),
  (:'tB1', :'orgB', 'Basquete B', 'basquete-b', 'basketball', 'mixed');
insert into public.team_staff (team_id, user_id, role) values
  (:'tA1', :'u3', 'coach'), (:'tA1', :'u4', 'manager'), (:'tA2', :'u9', 'manager');
insert into public.team_players (team_id, user_id) values (:'tA1', :'u6'), (:'tA1', :'u7');

create schema t;
grant usage on schema t to authenticated, anon;
create table t.store (k text primary key, v text not null);
grant all on t.store to authenticated;
grant select on t.store to anon;
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
-- CPF "cifrado" de mentira com o tamanho certo (40 bytes) e indice cego de 32 bytes.
create function t.ct(seed text) returns bytea language sql as $$ select decode(repeat(seed, 40), 'hex'); $$;
create function t.bi(seed text) returns bytea language sql as $$ select decode(repeat(seed, 32), 'hex'); $$;

-- Posicoes dos esportes ----------------------------------------------------------------------------------------
select t.expect('31 posicoes nos 6 esportes', (select count(*) from public.sport_positions) = 31 and (select count(distinct sport) from public.sport_positions) = 6);
select t.expect('goleiro existe no futsal e libero so no volei',
  exists (select 1 from public.sport_positions where sport = 'futsal' and key = 'goalkeeper')
  and exists (select 1 from public.sport_positions where sport = 'volleyball' and key = 'libero')
  and not exists (select 1 from public.sport_positions where sport = 'futsal' and key = 'libero'));

-- Inscricao pela propria pessoa -------------------------------------------------------------------------------------
select t.as_user(:'u8');
select t.expect_error('sem vinculo nao se inscreve', format('select public.register_my_athlete(%L, %L, %L, %L, %L)', :'orgA', 'Intruso Silva', null, 'male', '2000-01-01'), '42501');
reset role;
select t.as_user(:'u6');
select t.put('ath6', public.register_my_athlete(:'orgA', '  Ana Souza  ', 'Aninha', 'female', '2004-05-10')::text);
select t.expect('jogadora se inscreve e o nome vem sem espacos sobrando', (select full_name from public.athletes where id = t.get('ath6')::uuid) = 'Ana Souza');
select t.expect('o cadastro fica ligado a conta', (select user_id from public.athletes where id = t.get('ath6')::uuid) = :'u6');
select t.expect('entra no elenco do time em que ja tinha acesso', (select count(*) from public.team_members where athlete_id = t.get('ath6')::uuid and team_id = :'tA1') = 1);
select t.expect('sem posicao e sem camisa ate o tecnico definir', (select position is null and shirt_number is null from public.team_members where athlete_id = t.get('ath6')::uuid));
select t.expect_error('inscrever de novo na mesma organizacao', format('select public.register_my_athlete(%L, %L, %L, %L, %L)', :'orgA', 'Ana Souza', null, 'female', '2004-05-10'), '23505');
reset role;
select t.as_user(:'u7');
select t.put('ath7', public.register_my_athlete(:'orgA', 'Bruno Lima', null, 'male', '2001-02-03')::text);
select t.expect_error('sexo invalido', format('select public.register_my_athlete(%L, %L, %L, %L, %L)', :'orgB', 'X Y', null, 'other', '2000-01-01'), '42501');
reset role;
select t.as_user(:'u10');
select t.expect_error('data no futuro', format('select public.register_athlete(%L, %L, %L, %L, %L)', :'orgB', 'Futuro Silva', null, 'male', (current_date + 1)::text), '22023');
select t.expect_error('data antes de 1900', format('select public.register_athlete(%L, %L, %L, %L, %L)', :'orgB', 'Antigo Silva', null, 'male', '1899-12-31'), '22023');
select t.expect_error('sexo fora de masculino e feminino', format('select public.register_athlete(%L, %L, %L, %L, %L)', :'orgB', 'Sem Sexo', null, 'other', '2000-01-01'), '23514');
select t.expect_error('nome curto demais', format('select public.register_athlete(%L, %L, %L, %L, %L)', :'orgB', 'A', null, 'male', '2000-01-01'), '23514');
reset role;

-- Leitura do cadastro -------------------------------------------------------------------------------------------------
select t.as_user(:'u6');
select t.expect('jogadora ve so o proprio cadastro', (select count(*) from public.athletes) = 1);
select t.expect('jogadora ve so o proprio perfil esportivo', (select count(*) from public.team_members) = 1);
reset role;
select t.as_user(:'u3');
select t.expect('tecnico ve o cadastro (com sexo e nascimento) dos atletas do time', (select count(*) from public.athletes where sex is not null and birth_date is not null) = 2);
select t.expect('tecnico ve o elenco do time', (select count(*) from public.team_members) = 2);
reset role;
select t.as_user(:'u9');
select t.expect('gestor de outro time nao ve atletas deste', (select count(*) from public.athletes) = 0);
reset role;
select t.as_user(:'u10');
select t.expect('admin de outra organizacao nao ve atletas', (select count(*) from public.athletes) = 0);
reset role;
select t.as_user(:'u2');
select t.expect('admin ve todos da organizacao', (select count(*) from public.athletes) = 2);
reset role;

-- Cadastro por admin e gestor ----------------------------------------------------------------------------------------------
select t.as_user(:'u4');
select t.put('ath_staff', public.register_athlete(:'orgA', 'Carla Dias', null, 'female', '1999-09-09')::text);
select t.expect('gestor cadastra atleta sem conta', (select user_id is null from public.athletes where id = t.get('ath_staff')::uuid));
reset role;
select t.as_user(:'u3');
select t.expect_error('tecnico nao cadastra atleta', format('select public.register_athlete(%L, %L, %L, %L, %L)', :'orgA', 'Nao Pode', null, 'male', '2000-01-01'), '42501');
reset role;
select t.as_user(:'u8');
select t.expect_error('sem vinculo nao cadastra atleta', format('select public.register_athlete(%L, %L, %L, %L, %L)', :'orgA', 'Nao Pode', null, 'male', '2000-01-01'), '42501');
reset role;
select t.as_user(:'u2');
select t.put('ath_admin', public.register_athlete(:'orgA', 'Davi Rocha', 'Davizinho', 'male', '2008-12-31')::text);
select t.expect('admin cadastra atleta', true);
reset role;

-- Perfil esportivo por time ------------------------------------------------------------------------------------------------------
select t.as_user(:'u3');
select public.update_team_member(:'tA1', t.get('ath6')::uuid, 'setter', 10::smallint, 'active');
select t.expect('tecnico define posicao e camisa', (select position = 'setter' and shirt_number = 10 from public.team_members where athlete_id = t.get('ath6')::uuid and team_id = :'tA1'));
select t.expect_error('posicao de outro esporte', format('select public.update_team_member(%L, %L, %L, 5::smallint)', :'tA1', t.get('ath7'), 'striker'), '23514');
select t.expect_error('camisa repetida no mesmo time', format('select public.update_team_member(%L, %L, %L, 10::smallint)', :'tA1', t.get('ath7'), 'middle'), '23505');
select t.expect_error('camisa acima de 99', format('select public.update_team_member(%L, %L, %L, 100::smallint)', :'tA1', t.get('ath7'), 'middle'), '23514');
select public.update_team_member(:'tA1', t.get('ath7')::uuid, 'libero', 11::smallint, 'injured');
select t.expect('outro atleta com outra camisa e status lesionado', (select status = 'injured' from public.team_members where athlete_id = t.get('ath7')::uuid));
select t.expect_error('atleta que nao e do time', format('select public.update_team_member(%L, %L, %L, 1::smallint)', :'tA1', t.get('ath_staff'), 'setter'), 'P0002');
select t.expect_error('tecnico nao coloca atleta no elenco', format('select public.add_athlete_to_team(%L, %L)', :'tA1', t.get('ath_staff')), '42501');
reset role;
select t.as_user(:'u6');
select t.expect_error('jogadora nao edita o proprio perfil esportivo', format('select public.update_team_member(%L, %L, %L, 3::smallint)', :'tA1', t.get('ath6'), 'setter'), '42501');
reset role;
select t.as_user(:'u4');
select public.add_athlete_to_team(:'tA1', t.get('ath_staff')::uuid);
select t.expect('gestor coloca atleta no elenco', (select count(*) from public.team_members where team_id = :'tA1') = 3);
select t.expect('gestor remove do elenco', (select count(*) from (select 1 from public.team_members where team_id = :'tA1' and athlete_id = t.get('ath_staff')::uuid) x) = 1);
delete from public.team_members where team_id = :'tA1' and athlete_id = t.get('ath_staff')::uuid;
select t.expect('removido do elenco', (select count(*) from public.team_members where team_id = :'tA1') = 2);
reset role;
select t.as_user(:'u2');
select public.add_athlete_to_team(:'tA3', t.get('ath6')::uuid);
select public.update_team_member(:'tA3', t.get('ath6')::uuid, 'outside', 10::smallint, 'active');
select t.expect('mesma pessoa, outro time: o mesmo numero de camisa pode existir', (select count(*) from public.team_members where athlete_id = t.get('ath6')::uuid and shirt_number = 10) = 2);
select t.expect('posicao e camisa de cada time sao independentes', (select position from public.team_members where athlete_id = t.get('ath6')::uuid and team_id = :'tA3') = 'outside' and (select position from public.team_members where athlete_id = t.get('ath6')::uuid and team_id = :'tA1') = 'setter');
reset role;
select t.as_user(:'u10');
select public.register_athlete(:'orgB', 'Elisa Prado', null, 'female', '2000-04-04');
select t.expect_error('atleta de uma organizacao nao entra em time de outra', format('select public.add_athlete_to_team(%L, %L)', :'tB1', t.get('ath6')), '23514');
reset role;

-- Acesso de jogador liga e desliga o elenco ----------------------------------------------------------------------------------------------
insert into public.team_players (team_id, user_id) values (:'tA2', :'u6');
select t.expect('ganhar acesso a outro time coloca no elenco dele', (select status from public.team_members where athlete_id = t.get('ath6')::uuid and team_id = :'tA2') = 'active');
delete from public.team_players where team_id = :'tA2' and user_id = :'u6';
select t.expect('perder o acesso deixa inativo e guarda o historico', (select status from public.team_members where athlete_id = t.get('ath6')::uuid and team_id = :'tA2') = 'inactive');
insert into public.team_players (team_id, user_id) values (:'tA2', :'u6');
select t.expect('voltar reativa o mesmo perfil', (select status from public.team_members where athlete_id = t.get('ath6')::uuid and team_id = :'tA2') = 'active');

-- Identidade: sexo e nascimento ------------------------------------------------------------------------------------------------------------
select t.as_user(:'u6');
select t.expect_error('a pessoa nao corrige o proprio sexo', format('select public.correct_athlete_identity(%L, %L, %L)', t.get('ath6'), 'male', '2004-05-10'), '42501');
select public.update_athlete_profile(t.get('ath6')::uuid, 'Ana Souza Lima', 'Ana');
select t.expect('a pessoa muda nome e nome de camisa', (select full_name = 'Ana Souza Lima' and nickname = 'Ana' from public.athletes where id = t.get('ath6')::uuid));
select t.expect_error('nao muda o cadastro de outra pessoa', format('select public.update_athlete_profile(%L, %L, %L)', t.get('ath7'), 'Outro Nome', null), '42501');
select t.expect_error('UPDATE direto em athletes negado', format('update public.athletes set sex = %L where id = %L', 'male', t.get('ath6')), '42501');
reset role;
select t.as_user(:'u3');
select t.expect_error('tecnico nao corrige identidade', format('select public.correct_athlete_identity(%L, %L, %L)', t.get('ath6'), 'female', '2004-05-10'), '42501');
reset role;
select t.as_user(:'u4');
select public.correct_athlete_identity(t.get('ath6')::uuid, 'female', '2004-05-11');
select t.expect('gestor corrige a data de nascimento', (select birth_date = date '2004-05-11' from public.athletes where id = t.get('ath6')::uuid));
select t.expect_error('data de nascimento no futuro na correcao', format('select public.correct_athlete_identity(%L, %L, %L)', t.get('ath6'), 'female', (current_date + 5)::text), '22023');
reset role;

-- CPF e telefone -----------------------------------------------------------------------------------------------------------------------------------
select t.as_user(:'u2');
select t.expect_error('admin nao le athlete_private direto', 'select * from public.athlete_private', '42501');
select t.expect_error('admin nao grava athlete_private direto', format('insert into public.athlete_private (athlete_id, organization_id, cpf_ciphertext, cpf_blind_index, key_version) values (%L, %L, %L, %L, 1)', t.get('ath6'), :'orgA', t.ct('ab'), t.bi('cd')), '42501');
reset role;

select t.as_user(:'u6');
select public.set_athlete_private(t.get('ath6')::uuid, t.ct('ab'), t.bi('01'), 1::smallint, '(71) 99999-1234');
select t.expect('a propria pessoa grava o CPF', (select cpf_registered from public.athletes where id = t.get('ath6')::uuid));
reset role;
select t.expect('telefone guardado so com digitos', (select phone from public.athlete_private where athlete_id = t.get('ath6')::uuid) = '71999991234');
select t.expect('o texto cifrado tem 40 bytes e o indice 32', (select octet_length(cpf_ciphertext) = 40 and octet_length(cpf_blind_index) = 32 from public.athlete_private where athlete_id = t.get('ath6')::uuid));

select t.as_user(:'u6');
select t.expect_error('texto cifrado do tamanho de um CPF em claro e recusado', format('select public.set_athlete_private(%L, %L, %L, 1::smallint)', t.get('ath6'), decode('3532393938323234373235', 'hex'), t.bi('01')), '23514');
select t.expect_error('indice cego de tamanho errado', format('select public.set_athlete_private(%L, %L, %L, 1::smallint)', t.get('ath6'), t.ct('ab'), decode('0102', 'hex')), '23514');
select t.expect_error('versao de chave invalida', format('select public.set_athlete_private(%L, %L, %L, 0::smallint)', t.get('ath6'), t.ct('ab'), t.bi('01')), '23514');
select t.expect_error('telefone curto', format('select public.set_athlete_private(%L, %L, %L, 1::smallint, %L)', t.get('ath6'), t.ct('ab'), t.bi('01'), '1234'), '23514');
select t.expect_error('jogador nao grava CPF de outro', format('select public.set_athlete_private(%L, %L, %L, 1::smallint)', t.get('ath7'), t.ct('ab'), t.bi('02')), '42501');
reset role;
select t.as_user(:'u3');
select t.expect_error('tecnico nao grava CPF', format('select public.set_athlete_private(%L, %L, %L, 1::smallint)', t.get('ath7'), t.ct('ab'), t.bi('02')), '42501');
select t.expect_error('tecnico nao le CPF', format('select * from public.read_athlete_private(%L)', t.get('ath6')), '42501');
select t.expect_error('tecnico nao procura CPF', format('select public.find_athlete_by_cpf_index(%L, %L)', :'orgA', t.bi('01')), '42501');
reset role;
select t.as_user(:'u8');
select t.expect_error('sem vinculo nao procura CPF (is_org_manager nunca devolve nulo)', format('select public.find_athlete_by_cpf_index(%L, %L)', :'orgA', t.bi('01')), '42501');
select t.expect('is_org_manager e falso, nao nulo, para quem nao tem papel', private.is_org_manager(:'orgA') is false);
reset role;
select t.as_user(:'u9');
select t.expect_error('gestor de outro time nao le o CPF de quem nao joga no time dele', format('select * from public.read_athlete_private(%L)', t.get('ath7')), '42501');
select t.expect('gestor de um time em que a pessoa tambem joga (volei e futsal) pode acessar o CPF', private.can_access_athlete_private(t.get('ath6')::uuid));
reset role;
select t.as_user(:'u10');
select t.expect_error('admin de outra organizacao nao le CPF', format('select * from public.read_athlete_private(%L)', t.get('ath6')), '42501');
reset role;
select t.as_user(:'u8');
select t.expect_error('sem vinculo nao le CPF', format('select * from public.read_athlete_private(%L)', t.get('ath6')), '42501');
reset role;

select t.as_user(:'u4');
select public.set_athlete_private(t.get('ath7')::uuid, t.ct('ef'), t.bi('02'), 1::smallint);
select public.set_athlete_private(t.get('ath_staff')::uuid, t.ct('12'), t.bi('03'), 1::smallint);
select t.expect('quem cadastrou (e e gestor) grava o CPF antes de ter time', (select cpf_registered from public.athletes where id = t.get('ath_staff')::uuid));
select t.expect('gestor do time grava o CPF', (select cpf_registered from public.athletes where id = t.get('ath7')::uuid));
select t.expect_error('mesmo CPF (indice) para outra pessoa da organizacao', format('select public.set_athlete_private(%L, %L, %L, 1::smallint)', t.get('ath_staff'), t.ct('ab'), t.bi('01')), '23505');
select t.expect('gestor acha duplicado pelo indice cego', public.find_athlete_by_cpf_index(:'orgA', t.bi('01')) = t.get('ath6')::uuid);
select t.expect('indice que nao existe devolve nulo', public.find_athlete_by_cpf_index(:'orgA', t.bi('99')) is null);
select t.expect('gestor le o CPF (cifrado)', (select cpf_ciphertext = t.ct('ab') from public.read_athlete_private(t.get('ath6')::uuid)));
reset role;
select t.as_user(:'u10');
select t.put('athB', (select id::text from public.athletes where organization_id = :'orgB' limit 1));
select public.set_athlete_private(t.get('athB')::uuid, t.ct('ab'), t.bi('01'), 1::smallint);
select t.expect('o mesmo indice em outra organizacao e permitido', true);
reset role;
select t.as_user(:'u2');
select t.expect('admin le o CPF (cifrado)', (select key_version = 1 from public.read_athlete_private(t.get('ath6')::uuid)));
reset role;
select t.as_user(:'u6');
select t.expect('a propria pessoa le o proprio CPF', (select cpf_ciphertext = t.ct('ab') from public.read_athlete_private(t.get('ath6')::uuid)));
reset role;

-- Apagar os dados protegidos -----------------------------------------------------------------------------------------------------------------------------
select t.as_user(:'u4');
select t.expect_error('gestor nao apaga o CPF (so admin ou a pessoa)', format('select public.delete_athlete_private(%L)', t.get('ath7')), '42501');
reset role;
select t.as_user(:'u2');
select public.delete_athlete_private(t.get('ath7')::uuid);
select t.expect('admin apaga o CPF e o sinal volta a falso', not (select cpf_registered from public.athletes where id = t.get('ath7')::uuid));
reset role;
select t.expect('nada sobrou em athlete_private para ele', not exists (select 1 from public.athlete_private where athlete_id = t.get('ath7')::uuid));
select t.as_user(:'u6');
select public.delete_athlete_private(t.get('ath6')::uuid);
select t.expect('a propria pessoa apaga o proprio CPF', not (select cpf_registered from public.athletes where id = t.get('ath6')::uuid));
reset role;

-- Auditoria ------------------------------------------------------------------------------------------------------------------------------------------------------
select t.expect('leituras do CPF foram auditadas, uma por leitura (gestor, admin e a pessoa)', (select count(*) from public.audit_events where action = 'athlete_private.read') = 3);
select t.expect('a auditoria diz quem leu',
  exists (select 1 from public.audit_events where action = 'athlete_private.read' and actor_id = :'u4' and entity_id = t.get('ath6')::uuid)
  and exists (select 1 from public.audit_events where action = 'athlete_private.read' and actor_id = :'u2')
  and exists (select 1 from public.audit_events where action = 'athlete_private.read' and actor_id = :'u6'));
select t.expect('auditou gravar, procurar, apagar, cadastrar, corrigir e perfil do time',
  (select count(distinct action) from public.audit_events where action in
    ('athlete_private.set', 'athlete_private.lookup', 'athlete_private.deleted', 'athlete.registered', 'athlete.identity_corrected', 'athlete.profile_updated', 'team_member.updated', 'team_member.added')) = 8);
select t.expect('leitura negada nao gera auditoria de leitura',
  (select count(*) from public.audit_events where action = 'athlete_private.read' and actor_id in (:'u3', :'u9', :'u8', :'u10')) = 0);
select t.expect('a auditoria nunca guarda texto cifrado, indice, telefone nem nomes',
  not exists (select 1 from public.audit_events where data::text ~* '(abab|0101|7199999|ana souza)'));

-- anon e sem sessao ------------------------------------------------------------------------------------------------------------------------------------------------
set local role anon;
select t.expect_error('anon nao le athletes', 'select 1 from public.athletes', '42501');
select t.expect_error('anon nao le team_members', 'select 1 from public.team_members', '42501');
select t.expect_error('anon nao le athlete_private', 'select 1 from public.athlete_private', '42501');
select t.expect_error('anon nao le CPF', format('select * from public.read_athlete_private(%L)', t.get('ath6')), '42501');
select t.expect_error('anon nao se inscreve', format('select public.register_my_athlete(%L, %L, %L, %L, %L)', :'orgA', 'Anon Silva', null, 'male', '2000-01-01'), '42501');
reset role;
select t.as_user('');
select t.expect_error('sem sessao nao le CPF', format('select * from public.read_athlete_private(%L)', t.get('ath6')), '42501');
select t.expect_error('sem sessao nao procura CPF', format('select public.find_athlete_by_cpf_index(%L, %L)', :'orgA', t.bi('01')), '42501');
reset role;

rollback;
\echo 'TODOS OS TESTES DE ATLETAS PASSARAM'
