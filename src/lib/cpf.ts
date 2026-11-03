import { blindIndex, decryptField, encryptField, type PiiKeys } from "./field-crypto";

// CPF so existe em claro em memoria, no servidor. No banco ficam o texto cifrado
// (AES-256-GCM, via field-crypto) e um indice cego (HMAC-SHA-256). Nenhuma funcao daqui
// devolve ou escreve o CPF em mensagem de erro, log ou URL.

/** So os 11 digitos, ou null se o formato ou os digitos verificadores nao fecham. */
export function normalizeCpf(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const digits = input.replace(/[.\-\s]/g, "");
  if (!/^\d{11}$/.test(digits)) return null;
  if (/^(\d)\1{10}$/.test(digits)) return null;

  const check = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(digits[i]) * (length + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  if (check(9) !== Number(digits[9]) || check(10) !== Number(digits[10])) return null;
  return digits;
}

export function isValidCpf(input: unknown): boolean {
  return normalizeCpf(input) !== null;
}

/** Exibicao: `***.***.123-**`. So os tres digitos do meio ficam visiveis. */
export function maskCpf(cpf: string): string {
  const digits = normalizeCpf(cpf);
  if (!digits) return "***.***.***-**";
  return `***.***.${digits.slice(6, 9)}-**`;
}

/** Cifra o CPF (so os 11 digitos) preso ao atleta e ao campo. Recusa CPF invalido. */
export function encryptCpf(cpf: string, athleteId: string, keys: PiiKeys): Buffer {
  const digits = normalizeCpf(cpf);
  if (!digits) throw new Error("invalid cpf");
  return encryptField("cpf", digits, athleteId, keys);
}

export function decryptCpf(blob: Buffer, athleteId: string, keys: PiiKeys): string {
  return decryptField("cpf", blob, athleteId, keys);
}

/** Indice cego do CPF por organizacao: acha duplicado sem decifrar. */
export function cpfBlindIndex(cpf: string, organizationId: string, keys: PiiKeys): Buffer {
  const digits = normalizeCpf(cpf);
  if (!digits) throw new Error("invalid cpf");
  return blindIndex("cpf", digits, organizationId, keys);
}
