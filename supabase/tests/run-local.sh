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
for f in supabase/migrations/*_foundation_*.sql; do
  echo "migration: $(basename "$f")"
  psql_run < "$f"
done
if ! out=$(psql_run < supabase/tests/foundation_rls.sql 2>&1); then
  echo "$out" | grep -E "FALHOU|ERROR" || echo "$out"
  exit 1
fi
echo "$out" | grep -E "^NOTICE:  ok|TODOS"
