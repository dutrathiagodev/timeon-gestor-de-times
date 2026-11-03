#!/usr/bin/env node
// Gera as chaves de cifra dos dados pessoais (CPF, telefone, data de nascimento).
// Rode no SEU terminal, copie a saida direto para o cofre de senhas e para a Vercel
// (Settings > Environment Variables), e nao cole em chat, commit, issue nem log.
// Este script nao grava nada em disco.
//
//   npm run keys:generate            primeira vez: gera as tres variaveis
//   npm run keys:generate -- --rotate 2   gera so a chave nova da versao 2 (veja o roteiro)
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const b64 = (bytes) => randomBytes(bytes).toString("base64");

/** Texto das variaveis de ambiente para a primeira configuracao. */
export function buildInitialEnv(random = b64) {
  return [
    `PII_ENCRYPTION_KEYS=${JSON.stringify({ 1: random(32) })}`,
    "PII_KEY_VERSION=1",
    `PII_HASH_KEY=${random(32)}`,
  ].join("\n");
}

/** Chave nova para uma rotacao: acrescente ao JSON existente e so depois mude PII_KEY_VERSION. */
export function buildRotationEntry(version, random = b64) {
  if (!Number.isInteger(version) || version < 2 || version > 255) {
    throw new Error("a versao da rotacao deve ser um inteiro de 2 a 255");
  }
  return `"${version}":"${random(32)}"`;
}

function main(argv) {
  const rotateAt = argv.indexOf("--rotate");
  if (rotateAt !== -1) {
    const version = Number(argv[rotateAt + 1]);
    console.log("# Acrescente esta entrada ao JSON de PII_ENCRYPTION_KEYS (mantenha as antigas):");
    console.log(buildRotationEntry(version));
    console.log(`# Depois de implantar, mude PII_KEY_VERSION para ${version}.`);
    console.log("# NAO troque PII_HASH_KEY: isso invalida todos os indices de CPF.");
    return;
  }
  console.log("# Copie para o cofre de senhas E para a Vercel. Perder PII_ENCRYPTION_KEYS = perder os CPFs.");
  console.log(buildInitialEnv());
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
