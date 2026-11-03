import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  cpfBlindIndex,
  decryptCpf,
  encryptCpf,
  isValidCpf,
  maskCpf,
  normalizeCpf,
} from "@/lib/cpf";
import type { PiiKeys } from "@/lib/field-crypto";

const VALID = "529.982.247-25";
const VALID_DIGITS = "52998224725";
const ATHLETE = "a1111111-1111-1111-1111-111111111111";
const ORG = "b2222222-2222-2222-2222-222222222222";

const keys = (version = 1): PiiKeys => ({
  currentVersion: version,
  encryption: { 1: randomBytes(32), 2: randomBytes(32) },
  hashKey: randomBytes(32),
});

describe("normalizeCpf", () => {
  it("aceita com e sem pontuação e devolve só os dígitos", () => {
    expect(normalizeCpf(VALID)).toBe(VALID_DIGITS);
    expect(normalizeCpf(VALID_DIGITS)).toBe(VALID_DIGITS);
    expect(normalizeCpf(" 529 982 247 25 ")).toBe(VALID_DIGITS);
    expect(normalizeCpf("111.444.777-35")).toBe("11144477735");
  });

  it("recusa dígito verificador errado", () => {
    expect(normalizeCpf("529.982.247-26")).toBeNull();
    expect(normalizeCpf("529.982.247-15")).toBeNull();
    expect(normalizeCpf("12345678900")).toBeNull();
  });

  it("recusa os 11 dígitos iguais, que fecham a conta mas não existem", () => {
    for (let d = 0; d <= 9; d++) expect(normalizeCpf(String(d).repeat(11))).toBeNull();
  });

  it("recusa tamanho errado, letras e tipos que não são texto", () => {
    for (const bad of ["", "123", "5299822472", "529982247255", "5299822472a", "abc", null, undefined, 52998224725, {}, []]) {
      expect(normalizeCpf(bad), String(bad)).toBeNull();
      expect(isValidCpf(bad)).toBe(false);
    }
  });

  it("isValidCpf concorda com normalizeCpf", () => {
    expect(isValidCpf(VALID)).toBe(true);
  });
});

describe("maskCpf", () => {
  it("mostra só os três dígitos do meio", () => {
    expect(maskCpf(VALID)).toBe("***.***.247-**");
    expect(maskCpf(VALID_DIGITS)).toBe("***.***.247-**");
  });

  it("CPF inválido vira máscara total, sem vazar o que veio", () => {
    expect(maskCpf("123")).toBe("***.***.***-**");
    expect(maskCpf("")).toBe("***.***.***-**");
  });

  it("nunca contém o CPF inteiro", () => {
    expect(maskCpf(VALID)).not.toContain("5299");
    expect(maskCpf(VALID)).not.toContain("25");
  });
});

describe("cifra", () => {
  it("cifra e decifra de volta", () => {
    const k = keys();
    expect(decryptCpf(encryptCpf(VALID, ATHLETE, k), ATHLETE, k)).toBe(VALID_DIGITS);
  });

  it("o texto cifrado não contém o CPF, nem formatado nem só dígitos", () => {
    const blob = encryptCpf(VALID, ATHLETE, keys());
    expect(blob.includes(Buffer.from(VALID_DIGITS))).toBe(false);
    expect(blob.includes(Buffer.from(VALID))).toBe(false);
    expect(blob.length).toBe(1 + 12 + 16 + 11);
  });

  it("cada cifra é diferente (IV aleatório), mas as duas decifram", () => {
    const k = keys();
    const a = encryptCpf(VALID, ATHLETE, k);
    const b = encryptCpf(VALID, ATHLETE, k);
    expect(a.equals(b)).toBe(false);
    expect(decryptCpf(a, ATHLETE, k)).toBe(decryptCpf(b, ATHLETE, k));
  });

  it("o texto cifrado de um atleta não decifra na linha de outro", () => {
    const k = keys();
    const blob = encryptCpf(VALID, ATHLETE, k);
    expect(() => decryptCpf(blob, "c3333333-3333-3333-3333-333333333333", k)).toThrow("decryption failed");
  });

  it("qualquer byte alterado derruba a decifragem", () => {
    const k = keys();
    const blob = encryptCpf(VALID, ATHLETE, k);
    for (let i = 0; i < blob.length; i++) {
      const copy = Buffer.from(blob);
      copy[i] ^= 0x01;
      expect(() => decryptCpf(copy, ATHLETE, k), `byte ${i}`).toThrow("decryption failed");
    }
  });

  it("blob curto, vazio ou de versão desconhecida falha com a mesma mensagem", () => {
    const k = keys();
    for (const blob of [Buffer.alloc(0), Buffer.alloc(10), Buffer.alloc(40)]) {
      expect(() => decryptCpf(blob, ATHLETE, k)).toThrow("decryption failed");
    }
    const real = encryptCpf(VALID, ATHLETE, k);
    const unknownVersion = Buffer.from(real);
    unknownVersion[0] = 9;
    expect(() => decryptCpf(unknownVersion, ATHLETE, k)).toThrow("decryption failed");
  });

  it("chave errada não decifra, e a mensagem de erro não tem o CPF", () => {
    const blob = encryptCpf(VALID, ATHLETE, keys());
    try {
      decryptCpf(blob, ATHLETE, keys());
      throw new Error("deveria falhar");
    } catch (error) {
      expect((error as Error).message).toBe("decryption failed");
      expect((error as Error).message).not.toContain(VALID_DIGITS);
    }
  });

  it("rotação: CPF cifrado com a versão 1 ainda decifra quando a atual é a 2", () => {
    const base = keys(1);
    const old = encryptCpf(VALID, ATHLETE, base);
    const rotated: PiiKeys = { ...base, currentVersion: 2 };
    expect(old[0]).toBe(1);
    expect(decryptCpf(old, ATHLETE, rotated)).toBe(VALID_DIGITS);
    expect(encryptCpf(VALID, ATHLETE, rotated)[0]).toBe(2);
  });

  it("recusa cifrar CPF inválido sem repeti-lo na mensagem", () => {
    expect(() => encryptCpf("123.456.789-00", ATHLETE, keys())).toThrow("invalid cpf");
  });
});

describe("índice cego", () => {
  const k = keys();

  it("é o mesmo para o mesmo CPF, com qualquer formatação", () => {
    expect(cpfBlindIndex(VALID, ORG, k).equals(cpfBlindIndex(VALID_DIGITS, ORG, k))).toBe(true);
  });

  it("muda com o CPF, com a organização e com a chave", () => {
    const base = cpfBlindIndex(VALID, ORG, k);
    expect(base.equals(cpfBlindIndex("111.444.777-35", ORG, k))).toBe(false);
    expect(base.equals(cpfBlindIndex(VALID, "d4444444-4444-4444-4444-444444444444", k))).toBe(false);
    expect(base.equals(cpfBlindIndex(VALID, ORG, keys()))).toBe(false);
  });

  it("tem 32 bytes e não contém o CPF", () => {
    const index = cpfBlindIndex(VALID, ORG, k);
    expect(index.length).toBe(32);
    expect(index.includes(Buffer.from(VALID_DIGITS))).toBe(false);
  });

  it("recusa CPF inválido", () => {
    expect(() => cpfBlindIndex("123", ORG, k)).toThrow("invalid cpf");
  });
});
