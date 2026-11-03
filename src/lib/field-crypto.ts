import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

// Cifra de campos pessoais (CPF, telefone, data de nascimento). Roda so no servidor:
// o dado em claro existe apenas em memoria. No banco vai o texto cifrado (AES-256-GCM)
// e, para o CPF, um indice cego (HMAC-SHA-256). Nenhuma funcao daqui repete o valor
// em claro em mensagem de erro.

const VERSION_BYTES = 1;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

/** O tipo do campo entra como dado autenticado: o texto cifrado de um campo nao decifra como outro. */
export type FieldKind = "cpf" | "phone" | "birth_date";

export type PiiKeys = {
  /** Versao usada para cifrar valores novos. */
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
 * PII_ENCRYPTION_KEYS = JSON {"1":"<base64 de 32 bytes>"}; PII_KEY_VERSION = "1";
 * PII_HASH_KEY = <base64 de pelo menos 32 bytes>. Gere com `npm run keys:generate`.
 */
export function loadPiiKeys(env: Record<string, string | undefined> = process.env): PiiKeys {
  const rawKeys = env.PII_ENCRYPTION_KEYS;
  const rawVersion = env.PII_KEY_VERSION;
  const rawHash = env.PII_HASH_KEY;
  if (!rawKeys || !rawVersion || !rawHash) {
    throw new Error("PII_ENCRYPTION_KEYS, PII_KEY_VERSION and PII_HASH_KEY must be set");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawKeys);
  } catch {
    throw new Error("PII_ENCRYPTION_KEYS must be valid JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("PII_ENCRYPTION_KEYS must be a JSON object of version to key");
  }

  const encryption: Record<number, Buffer> = {};
  for (const [version, value] of Object.entries(parsed as Record<string, unknown>)) {
    const n = Number(version);
    if (!Number.isInteger(n) || n < 1 || n > 255 || typeof value !== "string") {
      throw new Error("PII_ENCRYPTION_KEYS has an invalid entry");
    }
    const key = decodeKey(value, `PII_ENCRYPTION_KEYS[${version}]`, KEY_BYTES);
    if (key.length !== KEY_BYTES) {
      throw new Error(`PII_ENCRYPTION_KEYS[${version}] must be exactly ${KEY_BYTES} bytes`);
    }
    encryption[n] = key;
  }

  const currentVersion = Number(rawVersion);
  if (!Number.isInteger(currentVersion) || !(currentVersion in encryption)) {
    throw new Error("PII_KEY_VERSION must name a key present in PII_ENCRYPTION_KEYS");
  }
  return { currentVersion, encryption, hashKey: decodeKey(rawHash, "PII_HASH_KEY", KEY_BYTES) };
}

const aad = (kind: FieldKind, athleteId: string) => Buffer.from(`${kind}:${athleteId}`, "utf8");

/**
 * Cifra um campo. Formato: [versao:1][iv:12][tag:16][texto cifrado]. O tipo do campo
 * e o id do atleta entram como dado autenticado: o texto cifrado nao decifra se for
 * copiado para a linha de outro atleta nem para a coluna de outro campo.
 */
export function encryptField(kind: FieldKind, plaintext: string, athleteId: string, keys: PiiKeys): Buffer {
  const key = keys.encryption[keys.currentVersion];
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(aad(kind, athleteId));
  const body = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([Buffer.from([keys.currentVersion]), iv, cipher.getAuthTag(), body]);
}

export function decryptField(kind: FieldKind, blob: Buffer, athleteId: string, keys: PiiKeys): string {
  if (blob.length <= VERSION_BYTES + IV_BYTES + TAG_BYTES) throw new Error("decryption failed");
  const key = keys.encryption[blob[0]];
  if (!key) throw new Error("decryption failed");
  const iv = blob.subarray(VERSION_BYTES, VERSION_BYTES + IV_BYTES);
  const tag = blob.subarray(VERSION_BYTES + IV_BYTES, VERSION_BYTES + IV_BYTES + TAG_BYTES);
  const body = blob.subarray(VERSION_BYTES + IV_BYTES + TAG_BYTES);
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAAD(aad(kind, athleteId));
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
  } catch {
    // Mensagem unica: nao diz se foi chave, id, campo ou adulteracao.
    throw new Error("decryption failed");
  }
}

/**
 * Indice cego: HMAC do valor com o tipo do campo e o id da organizacao. Serve para
 * achar duplicado sem decifrar nada. A mesma pessoa em duas organizacoes tem indices diferentes.
 */
export function blindIndex(kind: FieldKind, value: string, organizationId: string, keys: PiiKeys): Buffer {
  return createHmac("sha256", keys.hashKey).update(`${kind}:${organizationId}:${value}`).digest();
}
