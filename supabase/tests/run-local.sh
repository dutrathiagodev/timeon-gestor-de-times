#!/usr/bin/env bash
# Aplica as migrations da fundacao multi-time em um Postgres 17 descartavel
# (Docker) e roda os testes de RLS. Uso: bash supabase/tests/run-local.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
name="timeon-rls-test"
docker rm -f "$name" >/dev/null 2>&1 || true
docker run -d --rm --name "$name" -e POSTGRES_PASSWORD=test postgres:17 >/dev/null
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT
until docker exec "$name" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
sleep 2
psql_run() { docker exec -i "$name" psql -U postgres -v ON_ERROR_STOP=1 -q "$@"; }
psql_run < supabase/tests/harness.sql
for f in $(ls supabase/migrations/*_foundation_*.sql supabase/migrations/*_access_*.sql supabase/migrations/*_athletes_*.sql supabase/migrations/*_games_*.sql | sort); do
  echo "migration: $(basename "$f")"
  psql_run < "$f"
done
for test in foundation_rls access_rls athletes_rls games_rls grants_audit; do
  if ! out=$(psql_run < "supabase/tests/$test.sql" 2>&1); then
    echo "$out" | grep -E "FALHOU|ERROR" || echo "$out"
    exit 1
  fi
  echo "$out" | grep -E "^NOTICE:  ok|TODOS|PASSOU"
done
# O verificador que o dono roda no Supabase de verdade tambem tem de passar aqui.
verify=$(psql_run -A -t -F ' | ' < supabase/verify/after-apply.sql)
echo "$verify" | grep -c "| OK |" | xargs -I{} echo "verificador: {} checagens OK"
if echo "$verify" | grep -q "| FALHOU |"; then
  echo "$verify" | grep "| FALHOU |"
  exit 1
fi

# A migration que cifra telefone e nascimento nao pode apagar dado real: com atleta ja
# cadastrado na versao anterior ela tem de PARAR. Cenario num banco separado.
docker exec "$name" psql -U postgres -q -c "create database guard" >/dev/null
guard_run() { docker exec -i "$name" psql -U postgres -d guard -v ON_ERROR_STOP=1 -q "$@"; }
guard_run < supabase/tests/harness.sql
for f in $(ls supabase/migrations/*_foundation_*.sql supabase/migrations/*_access_*.sql supabase/migrations/*_athletes_*.sql supabase/migrations/*_games_*.sql | sort | grep -v encrypted_fields); do
  guard_run < "$f"
done
guard_run -c "insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000f1');
  insert into public.organizations (id, name, slug) values ('a0000000-0000-0000-0000-00000000000a', 'Org', 'org');
  insert into public.athletes (organization_id, full_name, sex, birth_date) values ('a0000000-0000-0000-0000-00000000000a', 'Dado Real', 'male', '2000-01-01');"
if guard_run < supabase/migrations/20261103140000_athletes_encrypted_fields.sql >/dev/null 2>&1; then
  echo "FALHOU: a migration de cifra rodou com atleta cadastrado e apagaria a data de nascimento"
  exit 1
fi
if [ "$(guard_run -A -t -c "select count(*) from public.athletes where birth_date = '2000-01-01'")" != "1" ]; then
  echo "FALHOU: a migration de cifra alterou os dados mesmo tendo parado"
  exit 1
fi
echo "ok - a migration de cifra para sem apagar quando ja ha atleta cadastrado"

# O pacote que o dono cola no SQL Editor (scripts/build-apply-sql.mjs) e o caminho real de
# aplicacao: tem de funcionar num banco novo, passar no verificador e, se falhar no meio,
# nao deixar NADA aplicado (uma consulta so = uma transacao). psql -1 faz o mesmo.
docker exec "$name" psql -U postgres -q -c "create database bundle" >/dev/null
docker exec "$name" psql -U postgres -q -c "create database bundle_fail" >/dev/null
bundle_run() { docker exec -i "$name" psql -U postgres -d "$1" -v ON_ERROR_STOP=1 -q "${@:2}"; }
bundle_run bundle < supabase/tests/harness.sql
bundle_run bundle_fail < supabase/tests/harness.sql
node scripts/build-apply-sql.mjs --stdout 2>/dev/null | bundle_run bundle -1
bundle_out=$(bundle_run bundle -A -t -F ' | ' < supabase/verify/after-apply.sql)
if echo "$bundle_out" | grep -q "| FALHOU |" || [ "$(echo "$bundle_out" | grep -c '| OK |')" != "15" ]; then
  echo "FALHOU: o pacote de migrations nao passou no verificador"
  echo "$bundle_out" | grep -v "| OK |"
  exit 1
fi
echo "ok - o pacote de migrations aplica num banco novo e passa nas 15 checagens"
if { node scripts/build-apply-sql.mjs --stdout 2>/dev/null; echo "select 1/0;"; } | bundle_run bundle_fail -1 >/dev/null 2>&1; then
  echo "FALHOU: o pacote com erro no fim foi aplicado"
  exit 1
fi
if [ "$(bundle_run bundle_fail -A -t -c "select count(*) from pg_tables where schemaname = 'public' and tablename in ('teams','athletes','team_invites')")" != "0" ]; then
  echo "FALHOU: o pacote com erro no fim deixou tabelas aplicadas pela metade"
  exit 1
fi
echo "ok - se o pacote falhar no meio, nada fica aplicado"

