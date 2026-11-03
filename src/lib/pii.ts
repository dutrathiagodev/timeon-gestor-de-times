import { decryptField, encryptField, type PiiKeys } from "./field-crypto";

// Telefone e data de nascimento: validados e cifrados no servidor, como o CPF.
// O banco guarda so o texto cifrado e, da data, apenas o ANO em claro (birth_year),
// que basta para a faixa etaria das subs. A data completa so sai por leitura auditada.

/** So os digitos, de 10 a 13 (DDD com ou sem 9 e codigo do pais), ou null. */
export function normalizePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const digits = input.replace(/[^0-9]/g, "");
  return /^\d{10,13}$/.test(digits) ? digits : null;
}

/** Exibicao: so os quatro ultimos digitos. */
export function maskPhone(phone: string): string {
  const digits = normalizePhone(phone);
  return digits ? `(**) *****-${digits.slice(-4)}` : "(**) *****-****";
}

/** `AAAA-MM-DD` de uma data real, de 1900 ate hoje, ou null. */
export function normalizeBirthDate(input: unknown, today: Date = new Date()): string | null {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const [year, month, day] = input.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  if (year < 1900) return null;
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return date.getTime() <= todayUtc ? input : null;
}

export function birthYearOf(birthDate: string): number {
  const normalized = normalizeBirthDate(birthDate);
  if (!normalized) throw new Error("invalid birth date");
  return Number(normalized.slice(0, 4));
}

export function encryptPhone(phone: string, athleteId: string, keys: PiiKeys): Buffer {
  const digits = normalizePhone(phone);
  if (!digits) throw new Error("invalid phone");
  return encryptField("phone", digits, athleteId, keys);
}

export function decryptPhone(blob: Buffer, athleteId: string, keys: PiiKeys): string {
  return decryptField("phone", blob, athleteId, keys);
}

export function encryptBirthDate(birthDate: string, athleteId: string, keys: PiiKeys, today?: Date): Buffer {
  const normalized = normalizeBirthDate(birthDate, today);
  if (!normalized) throw new Error("invalid birth date");
  return encryptField("birth_date", normalized, athleteId, keys);
}

export function decryptBirthDate(blob: Buffer, athleteId: string, keys: PiiKeys): string {
  return decryptField("birth_date", blob, athleteId, keys);
}
