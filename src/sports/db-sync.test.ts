import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SPORT_KEYS } from "@/sports/registry";

const read = (name: string) => readFileSync(`supabase/migrations/${name}`, "utf8");

/** Chaves que ficam na tabela sports depois das migrations: inserts menos deletes. */
function sportKeysFromMigrations(): string[] {
  const keys = new Set<string>();
  const files = [
    "20261101120000_foundation_sports.sql",
    "20261102120000_access_sports_keys.sql",
  ];
  for (const file of files) {
    const sql = read(file);
    for (const insert of sql.matchAll(/insert into public\.sports \(key, name\) values([\s\S]*?)(?:on conflict|;)/g)) {
      for (const row of insert[1].matchAll(/\('([a-z0-9_]+)'\s*,/g)) keys.add(row[1]);
    }
    for (const del of sql.matchAll(/delete from public\.sports where key in \(([^)]*)\)/g)) {
      for (const key of del[1].matchAll(/'([a-z0-9_]+)'/g)) keys.delete(key[1]);
    }
  }
  return [...keys].sort();
}

describe("esportes do banco e do código", () => {
  it("as migrations deixam na tabela sports exatamente as chaves de src/sports", () => {
    expect(sportKeysFromMigrations()).toEqual([...SPORT_KEYS].sort());
  });
});
