import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { PiiKeys } from "@/lib/field-crypto";
import {
  birthYearOf,
  decryptBirthDate,
  decryptPhone,
  encryptBirthDate,
  encryptPhone,
  maskPhone,
  normalizeBirthDate,
  normalizePhone,
} from "@/lib/pii";

const ATHLETE = "a1111111-1111-1111-1111-111111111111";
const keys: PiiKeys = { currentVersion: 1, encryption: { 1: randomBytes(32) }, hashKey: randomBytes(32) };
const today = new Date("2026-11-03T12:00:00");

describe("telefone", () => {
  it("fica só com os dígitos, de 10 a 13", () => {
    expect(normalizePhone("(71) 99999-1234")).toBe("71999991234");
    expect(normalizePhone("+55 71 99999-1234")).toBe("5571999991234");
    expect(normalizePhone("7133334444")).toBe("7133334444");
  });

  it("recusa curto, longo, vazio e o que não é texto", () => {
    for (const bad of ["", "1234", "123456789", "12345678901234", "abc", null, undefined, 71999991234, {}]) {
      expect(normalizePhone(bad), String(bad)).toBeNull();
    }
  });

  it("máscara mostra só os quatro últimos", () => {
    expect(maskPhone("(71) 99999-1234")).toBe("(**) *****-1234");
    expect(maskPhone("x")).toBe("(**) *****-****");
    expect(maskPhone("71999991234")).not.toContain("7199");
  });

  it("cifra e decifra, e recusa telefone inválido sem repeti-lo", () => {
    const blob = encryptPhone("(71) 99999-1234", ATHLETE, keys);
    expect(decryptPhone(blob, ATHLETE, keys)).toBe("71999991234");
    expect(() => encryptPhone("1234", ATHLETE, keys)).toThrow("invalid phone");
  });
});

describe("data de nascimento", () => {
  it("aceita data real entre 1900 e hoje", () => {
    expect(normalizeBirthDate("2004-05-10", today)).toBe("2004-05-10");
    expect(normalizeBirthDate("1900-01-01", today)).toBe("1900-01-01");
    expect(normalizeBirthDate("2026-11-03", today)).toBe("2026-11-03");
    expect(normalizeBirthDate("2024-02-29", today)).toBe("2024-02-29");
  });

  it("recusa futuro, antes de 1900, formato errado e dia que não existe", () => {
    for (const bad of ["2026-11-04", "2027-01-01", "1899-12-31", "10/05/2004", "2004-5-10", "2004-13-01", "2023-02-29", "2004-04-31", "", null, undefined, 20040510]) {
      expect(normalizeBirthDate(bad, today), String(bad)).toBeNull();
    }
  });

  it("o ano em claro vem da própria data", () => {
    expect(birthYearOf("2004-05-10")).toBe(2004);
    expect(() => birthYearOf("2004-13-10")).toThrow("invalid birth date");
  });

  it("cifra e decifra, e recusa data inválida", () => {
    const blob = encryptBirthDate("2004-05-10", ATHLETE, keys, today);
    expect(decryptBirthDate(blob, ATHLETE, keys)).toBe("2004-05-10");
    expect(blob.length).toBe(39);
    expect(() => encryptBirthDate("2099-01-01", ATHLETE, keys, today)).toThrow("invalid birth date");
  });

  it("o texto cifrado não revela a data nem o ano", () => {
    const blob = encryptBirthDate("2004-05-10", ATHLETE, keys, today);
    expect(blob.includes(Buffer.from("2004"))).toBe(false);
    expect(blob.includes(Buffer.from("2004-05-10"))).toBe(false);
  });
});
