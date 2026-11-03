#!/usr/bin/env node
// Junta as migrations novas, na ordem, em UM arquivo SQL para colar no SQL Editor do
// Supabase. Util quando o projeto nao tem historico de migrations do CLI (o schema
// supabase_migrations nao existe): as migrations antigas ja estao no banco e o
// `supabase db push` tentaria refaze-las. Uma consulta so = uma transacao: se qualquer
// parte falhar, NADA e aplicado.
//
//   node scripts/build-apply-sql.mjs --out apply.sql
//   node scripts/build-apply-sql.mjs --stdout          (imprime o SQL; o resumo vai para stderr)
//   node scripts/build-apply-sql.mjs --from 20261101120000 --out apply.sql
//
// So le arquivos do repositorio e escreve o arquivo pedido. Nao fala com banco nenhum.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/** Primeira migration que o banco do TimeOn ainda nao tem (a fundacao multi-time). */
export const DEFAULT_FROM = "20261101120000";

export function listMigrations(dir, from = DEFAULT_FROM) {
  return readdirSync(dir)
    .filter((name) => /^\d{14}_.+\.sql$/.test(name))
    .filter((name) => name.slice(0, 14) >= from)
    .sort();
}

export function buildBundle(dir, from = DEFAULT_FROM) {
  const names = listMigrations(dir, from);
  if (names.length === 0) throw new Error(`nenhuma migration a partir de ${from}`);
  const parts = [
    "-- TimeOn: migrations novas em ordem, para colar no SQL Editor do Supabase.",
    `-- Contem ${names.length} migrations (de ${names[0].slice(0, 14)} a ${names.at(-1).slice(0, 14)}).`,
    "-- Uma consulta so = uma transacao: se algo falhar, nada e aplicado.",
    "-- Confira o NOME e o REF do projeto no painel antes de rodar. Depois rode supabase/verify/after-apply.sql.",
    "",
  ];
  for (const name of names) {
    const sql = readFileSync(join(dir, name), "utf8").trimEnd();
    parts.push(`-- >>>>>>>>>> migration ${name}`, sql, "");
  }
  return { names, sql: parts.join("\n") };
}

function main(argv) {
  const arg = (flag) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  const out = arg("--out");
  const toStdout = argv.includes("--stdout");
  if (!out && !toStdout) {
    console.error("uso: node scripts/build-apply-sql.mjs --out apply.sql [--from 20261101120000]");
    process.exit(1);
  }
  const dir = fileURLToPath(new URL("../supabase/migrations", import.meta.url));
  const { names, sql } = buildBundle(dir, arg("--from") ?? DEFAULT_FROM);
  if (toStdout) process.stdout.write(sql);
  else writeFileSync(out, sql);
  console.error(`${names.length} migrations ${toStdout ? "geradas" : `escritas em ${out}`} (${Math.round(sql.length / 1024)} KB):`);
  for (const name of names) console.error(`  ${name}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
