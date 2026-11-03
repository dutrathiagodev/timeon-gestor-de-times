import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_FROM, buildBundle, listMigrations } from "../../scripts/build-apply-sql.mjs";

const dir = "supabase/migrations";

describe("pacote de migrations", () => {
  it("lista só as novas (a partir da fundação), em ordem, sem as antigas", () => {
    const names = listMigrations(dir);
    expect(names[0]).toBe("20261101120000_foundation_sports.sql");
    expect(names).toEqual([...names].sort());
    expect(names.every((n: string) => n.slice(0, 14) >= DEFAULT_FROM)).toBe(true);
    expect(names.some((n: string) => n.includes("init_jogadores") || n.includes("lock_down_rls"))).toBe(false);
  });

  it("não perde nenhuma migration nova (compara com a pasta)", () => {
    const onDisk = readdirSync(dir).filter((n) => /^\d{14}_.+\.sql$/.test(n) && n.slice(0, 14) >= DEFAULT_FROM).sort();
    expect(listMigrations(dir)).toEqual(onDisk);
  });

  it("o SQL traz cada migration inteira, na ordem, com um marcador antes de cada uma", () => {
    const { names, sql } = buildBundle(dir);
    let last = -1;
    for (const name of names) {
      const at = sql.indexOf(`-- >>>>>>>>>> migration ${name}`);
      expect(at, name).toBeGreaterThan(last);
      last = at;
    }
    expect(sql).toContain("create function public.create_team(");
    expect(sql).toContain("athlete_private");
  });

  it("não tem comando do psql (\\set, \\i...) nem BEGIN/COMMIT, que o SQL Editor não entende como o psql", () => {
    const { sql } = buildBundle(dir);
    expect(sql.split("\n").filter((l: string) => l.startsWith("\\"))).toEqual([]);
    expect(sql).not.toMatch(/^\s*(begin|commit)\s*;/im);
  });

  it("o cabeçalho manda conferir o projeto e dizer que é tudo ou nada", () => {
    const { sql } = buildBundle(dir);
    expect(sql.split("\n").slice(0, 5).join("\n")).toMatch(/NOME e o REF/);
    expect(sql.split("\n").slice(0, 5).join("\n")).toMatch(/nada e aplicado/);
  });

  it("--from muda o ponto de partida, e um ponto sem migrations avisa em vez de gerar vazio", () => {
    expect(listMigrations(dir, "20261103140000")).toEqual(["20261103140000_athletes_encrypted_fields.sql"]);
    expect(() => buildBundle(dir, "29999999999999")).toThrow("nenhuma migration");
  });
});
