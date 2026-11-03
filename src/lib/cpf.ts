import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

// CPF so existe em claro em memoria, no servidor. No banco ficam o texto cifrado
// (AES-256-GCM) e um indice cego (HMAC-SHA-256). Nenhuma funcao daqui devolve ou
// escreve o CPF em mensagem de erro, log ou URL.

const VERSION_BYTES = 1;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

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

export type CpfKeys = {
  /** Versao usada para cifrar novos CPFs. */
  currentVersion: number;
  /** Todas as versoes que ainda precisam decifrar, para permitir rotacao. */
  encryption: Record<number, Buffer>;
  /** Chave do indice cego; trocar exige recalcular todos os indices. */
  hashKey: Buffer;
};

function decodeKey(value: string, name: string, minBytes: number): Buffer {
  const key = Buffer.from(value, "base64");
  if (key.length < minBytes) throw new Error(`${name} must be at least ${minBytes} bytes (base64)`);
  return key;
}

/**
 * Le as chaves do ambiente do servidor. Nunca ficam no repositorio nem no navegador.
 * CPF_ENCRYPTION_KEYS = JSON {"1":"<base64 de 32 bytes>"}; CPF_KEY_VERSION = "1";
 * CPF_HASH_KEY = <base64 de pelo menos 32 bytes>.
 */
export function loadCpfKeys(env: Record<string, string | undefined> = process.env): CpfKeys {
  const rawKeys = env.CPF_ENCRYPTION_KEYS;
  const rawVersion = env.CPF_KEY_VERSION;
  const rawHash = env.CPF_HASH_KEY;
  if (!rawKeys || !rawVersion || !rawHash) {
    throw new Error("CPF_ENCRYPTION_KEYS, CPF_KEY_VERSION and CPF_HASH_KEY must be set");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawKeys);
  } catch {
    throw new Error("CPF_ENCRYPTION_KEYS must be valid JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("CPF_ENCRYPTION_KEYS must be a JSON object of version to key");
  }

  const encryption: Record<number, Buffer> = {};
  for (const [version, value] of Object.entries(parsed as Record<string, unknown>)) {
    const n = Number(version);
    if (!Number.isInteger(n) || n < 1 || n > 255 || typeof value !== "string") {
      throw new Error("CPF_ENCRYPTION_KEYS has an invalid entry");
    }
    const key = decodeKey(value, `CPF_ENCRYPTION_KEYS[${version}]`, KEY_BYTES);
    if (key.length !== KEY_BYTES) throw new Error(`CPF_ENCRYPTION_KEYS[${version}] must be exactly ${KEY_BYTES} bytes`);
    encryption[n] = key;
  }

  const currentVersion = Number(rawVersion);
  if (!Number.isInteger(currentVersion) || !(currentVersion in encryption)) {
    throw new Error("CPF_KEY_VERSION must name a key present in CPF_ENCRYPTION_KEYS");
  }
  return { currentVersion, encryption, hashKey: decodeKey(rawHash, "CPF_HASH_KEY", KEY_BYTES) };
}

/**
 * Cifra o CPF. Formato: [versao:1][iv:12][tag:16][texto cifrado]. O id do atleta
 * entra como dado autenticado: o texto cifrado de um atleta nao decifra se for
 * copiado para a linha de outro.
 */
export function encryptCpf(cpf: string, athleteId: string, keys: CpfKeys): Buffer {
  const digits = normalizeCpf(cpf);
  if (!digits) throw new Error("invalid cpf");
  const key = keys.encryption[keys.currentVersion];
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(athleteId, "utf8"));
  const body = Buffer.concat([cipher.update(digits, "utf8"), cipher.final()]);
  return Buffer.concat([Buffer.from([keys.currentVersion]), iv, cipher.getAuthTag(), body]);
}

export function decryptCpf(blob: Buffer, athleteId: string, keys: CpfKeys): string {
  if (blob.length <= VERSION_BYTES + IV_BYTES + TAG_BYTES) throw new Error("cpf decryption failed");
  const version = blob[0];
  const key = keys.encryption[version];
  if (!key) throw new Error("cpf decryption failed");
  const iv = blob.subarray(VERSION_BYTES, VERSION_BYTES + IV_BYTES);
  const tag = blob.subarray(VERSION_BYTES + IV_BYTES, VERSION_BYTES + IV_BYTES + TAG_BYTES);
  const body = blob.subarray(VERSION_BYTES + IV_BYTES + TAG_BYTES);
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAAD(Buffer.from(athleteId, "utf8"));
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
  } catch {
    // Mensagem unica: nao diz se foi chave, id ou adulteracao.
    throw new Error("cpf decryption failed");
  }
}

/**
 * Indice cego: HMAC do CPF com o id da organizacao. Serve para achar duplicado
 * sem decifrar nada. A mesma pessoa em duas organizacoes tem indices diferentes.
 */
export function cpfBlindIndex(cpf: string, organizationId: string, keys: CpfKeys): Buffer {
  const digits = normalizeCpf(cpf);
  if (!digits) throw new Error("invalid cpf");
  return createHmac("sha256", keys.hashKey).update(`${organizationId}:${digits}`).digest();
}
