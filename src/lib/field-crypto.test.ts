import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  blindIndex,
  decryptField,
  encryptField,
  loadPiiKeys,
  type FieldKind,
  type PiiKeys,
} from "@/lib/field-crypto";

const ATHLETE = "a1111111-1111-1111-1111-111111111111";
const OTHER = "c3333333-3333-3333-3333-333333333333";
const ORG = "b2222222-2222-2222-2222-222222222222";

const keys = (version = 1): PiiKeys => ({
  currentVersion: version,
  encryption: { 1: randomBytes(32), 2: randomBytes(32) },
  hashKey: randomBytes(32),
});

describe("cifra de campos", () => {
  it.each(["cpf", "phone", "birth_date"] as FieldKind[])("%s: cifra e decifra de volta", (kind) => {
    const k = keys();
    expect(decryptField(kind, encryptField(kind, "valor de teste", ATHLETE, k), ATHLETE, k)).toBe("valor de teste");
  });

  it("o texto cifrado de um campo não decifra como outro campo, nem para o mesmo atleta", () => {
    const k = keys();
    const phone = encryptField("phone", "71999991234", ATHLETE, k);
    expect(() => decryptField("cpf", phone, ATHLETE, k)).toThrow("decryption failed");
    expect(() => decryptField("birth_date", phone, ATHLETE, k)).toThrow("decryption failed");
    expect(decryptField("phone", phone, ATHLETE, k)).toBe("71999991234");
  });

  it("não decifra na linha de outro atleta", () => {
    const k = keys();
    const blob = encryptField("birth_date", "2004-05-10", ATHLETE, k);
    expect(() => decryptField("birth_date", blob, OTHER, k)).toThrow("decryption failed");
  });

  it("cada cifra é diferente (IV aleatório) e o valor não aparece no texto cifrado", () => {
    const k = keys();
    const a = encryptField("phone", "71999991234", ATHLETE, k);
    const b = encryptField("phone", "71999991234", ATHLETE, k);
    expect(a.equals(b)).toBe(false);
    expect(a.includes(Buffer.from("71999991234"))).toBe(false);
  });

  it("tamanho do texto cifrado: 29 bytes fixos mais o valor", () => {
    const k = keys();
    expect(encryptField("cpf", "52998224725", ATHLETE, k).length).toBe(40);
    expect(encryptField("birth_date", "2004-05-10", ATHLETE, k).length).toBe(39);
    expect(encryptField("phone", "7199999123", ATHLETE, k).length).toBe(39);
    expect(encryptField("phone", "5571999991234", ATHLETE, k).length).toBe(42);
  });

  it("qualquer byte alterado derruba a decifragem", () => {
    const k = keys();
    const blob = encryptField("phone", "71999991234", ATHLETE, k);
    for (let i = 0; i < blob.length; i++) {
      const copy = Buffer.from(blob);
      copy[i] ^= 0x01;
      expect(() => decryptField("phone", copy, ATHLETE, k), `byte ${i}`).toThrow("decryption failed");
    }
  });

  it("blob curto, vazio ou de versão desconhecida falha com a mesma mensagem", () => {
    const k = keys();
    for (const blob of [Buffer.alloc(0), Buffer.alloc(10), Buffer.alloc(40)]) {
      expect(() => decryptField("cpf", blob, ATHLETE, k)).toThrow("decryption failed");
    }
    const real = encryptField("cpf", "52998224725", ATHLETE, k);
    const unknown = Buffer.from(real);
    unknown[0] = 9;
    expect(() => decryptField("cpf", unknown, ATHLETE, k)).toThrow("decryption failed");
  });

  it("chave errada não decifra e a mensagem não revela o valor", () => {
    const blob = encryptField("cpf", "52998224725", ATHLETE, keys());
    try {
      decryptField("cpf", blob, ATHLETE, keys());
      throw new Error("deveria falhar");
    } catch (error) {
      expect((error as Error).message).toBe("decryption failed");
    }
  });

  it("rotação: valor cifrado na versão 1 ainda decifra quando a atual é a 2", () => {
    const base = keys(1);
    const old = encryptField("phone", "71999991234", ATHLETE, base);
    const rotated: PiiKeys = { ...base, currentVersion: 2 };
    expect(old[0]).toBe(1);
    expect(decryptField("phone", old, ATHLETE, rotated)).toBe("71999991234");
    expect(encryptField("phone", "71999991234", ATHLETE, rotated)[0]).toBe(2);
  });
});

describe("índice cego", () => {
  const k = keys();

  it("é estável e tem 32 bytes", () => {
    const a = blindIndex("cpf", "52998224725", ORG, k);
    expect(a.equals(blindIndex("cpf", "52998224725", ORG, k))).toBe(true);
    expect(a.length).toBe(32);
    expect(a.includes(Buffer.from("52998224725"))).toBe(false);
  });

  it("muda com o valor, o tipo do campo, a organização e a chave", () => {
    const base = blindIndex("cpf", "52998224725", ORG, k);
    expect(base.equals(blindIndex("cpf", "11144477735", ORG, k))).toBe(false);
    expect(base.equals(blindIndex("phone", "52998224725", ORG, k))).toBe(false);
    expect(base.equals(blindIndex("cpf", "52998224725", "d4444444-4444-4444-4444-444444444444", k))).toBe(false);
    expect(base.equals(blindIndex("cpf", "52998224725", ORG, keys()))).toBe(false);
  });
});

describe("loadPiiKeys", () => {
  const b64 = (n: number) => randomBytes(n).toString("base64");
  const good = () => ({
    PII_ENCRYPTION_KEYS: JSON.stringify({ "1": b64(32), "2": b64(32) }),
    PII_KEY_VERSION: "2",
    PII_HASH_KEY: b64(32),
  });

  it("lê as chaves e a versão atual", () => {
    const loaded = loadPiiKeys(good());
    expect(loaded.currentVersion).toBe(2);
    expect(Object.keys(loaded.encryption).sort()).toEqual(["1", "2"]);
    expect(loaded.encryption[1].length).toBe(32);
  });

  it("funciona de ponta a ponta com chaves lidas do ambiente", () => {
    const loaded = loadPiiKeys(good());
    expect(decryptField("cpf", encryptField("cpf", "52998224725", ATHLETE, loaded), ATHLETE, loaded)).toBe("52998224725");
  });

  it("falha sem as variáveis, com JSON ruim, chave curta ou longa, ou versão que não existe", () => {
    expect(() => loadPiiKeys({})).toThrow("must be set");
    expect(() => loadPiiKeys({ ...good(), PII_ENCRYPTION_KEYS: "{nope" })).toThrow("valid JSON");
    expect(() => loadPiiKeys({ ...good(), PII_ENCRYPTION_KEYS: "[]" })).toThrow("JSON object");
    expect(() => loadPiiKeys({ ...good(), PII_ENCRYPTION_KEYS: JSON.stringify({ "1": b64(16) }), PII_KEY_VERSION: "1" })).toThrow("at least 32");
    expect(() => loadPiiKeys({ ...good(), PII_ENCRYPTION_KEYS: JSON.stringify({ "1": b64(48) }), PII_KEY_VERSION: "1" })).toThrow("exactly 32");
    expect(() => loadPiiKeys({ ...good(), PII_KEY_VERSION: "7" })).toThrow("PII_KEY_VERSION");
    expect(() => loadPiiKeys({ ...good(), PII_KEY_VERSION: "x" })).toThrow("PII_KEY_VERSION");
    expect(() => loadPiiKeys({ ...good(), PII_HASH_KEY: b64(8) })).toThrow("at least 32");
    expect(() => loadPiiKeys({ ...good(), PII_ENCRYPTION_KEYS: JSON.stringify({ "0": b64(32) }), PII_KEY_VERSION: "0" })).toThrow("invalid entry");
  });

  it("a mensagem de erro nunca traz o valor da chave", () => {
    const secret = b64(16);
    try {
      loadPiiKeys({ ...good(), PII_ENCRYPTION_KEYS: JSON.stringify({ "1": secret }), PII_KEY_VERSION: "1" });
    } catch (error) {
      expect((error as Error).message).not.toContain(secret);
    }
  });
});
