import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { decryptField, encryptField, loadPiiKeys } from "@/lib/field-crypto";
import { buildInitialEnv, buildRotationEntry } from "../../scripts/generate-pii-keys.mjs";

function parseEnv(text: string): Record<string, string> {
  return Object.fromEntries(
    text.split("\n").filter((l) => l && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
  );
}

describe("gerador de chaves", () => {
  it("as variáveis geradas são aceitas por loadPiiKeys e funcionam de ponta a ponta", () => {
    const keys = loadPiiKeys(parseEnv(buildInitialEnv()));
    const athlete = "a1111111-1111-1111-1111-111111111111";
    expect(decryptField("cpf", encryptField("cpf", "52998224725", athlete, keys), athlete, keys)).toBe("52998224725");
  });

  it("cada execução gera chaves diferentes e a de cifra difere da do índice", () => {
    const a = parseEnv(buildInitialEnv());
    const b = parseEnv(buildInitialEnv());
    expect(a.PII_HASH_KEY).not.toBe(b.PII_HASH_KEY);
    expect(a.PII_ENCRYPTION_KEYS).not.toBe(b.PII_ENCRYPTION_KEYS);
    expect(a.PII_HASH_KEY).not.toBe(Object.values(JSON.parse(a.PII_ENCRYPTION_KEYS))[0]);
  });

  it("rotação: a entrada nova junta ao JSON antigo continua sendo carregada", () => {
    const env = parseEnv(buildInitialEnv());
    const merged = JSON.stringify({ ...JSON.parse(env.PII_ENCRYPTION_KEYS), ...JSON.parse(`{${buildRotationEntry(2)}}`) });
    const keys = loadPiiKeys({ ...env, PII_ENCRYPTION_KEYS: merged, PII_KEY_VERSION: "2" });
    expect(Object.keys(keys.encryption).sort()).toEqual(["1", "2"]);
  });

  it("recusa versão de rotação inválida", () => {
    for (const bad of [1, 0, 256, 2.5, Number.NaN]) expect(() => buildRotationEntry(bad)).toThrow("versao");
  });

  it("o comando npm sai com as três variáveis e não grava arquivo", () => {
    const out = execFileSync("node", ["scripts/generate-pii-keys.mjs"], { encoding: "utf8" });
    const env = parseEnv(out);
    expect(Object.keys(env).sort()).toEqual(["PII_ENCRYPTION_KEYS", "PII_HASH_KEY", "PII_KEY_VERSION"]);
    expect(env.PII_KEY_VERSION).toBe("1");
  });
});
