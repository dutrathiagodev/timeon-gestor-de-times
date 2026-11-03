import type { RatingAttribute, RatingInput, RatingResult } from "../types";
import { type Profile, clampRating, total, weightedOverall } from "./shared";

export const VOLLEYBALL_ATTRIBUTES: RatingAttribute[] = [
  { key: "attack", label: "Ataque", short: "ATQ" },
  { key: "pass", label: "Passe", short: "PAS" },
  { key: "serve", label: "Saque", short: "SAQ" },
  { key: "set", label: "Toque", short: "TOQ" },
  { key: "block", label: "Bloqueio", short: "BLQ" },
  { key: "reading", label: "Noção de jogo", short: "NOC" },
  { key: "jump", label: "Pulo", short: "PUL" },
];

const BASE: Record<string, Profile> = {
  setter: { pass: 74, set: 84, serve: 68, attack: 67, block: 62, reading: 77, jump: 69 },
  libero: { pass: 86, set: 72, serve: 60, attack: 48, block: 45, reading: 82, jump: 60 },
  middle: { pass: 58, set: 63, serve: 66, attack: 78, block: 85, reading: 72, jump: 84 },
  opposite: { pass: 60, set: 62, serve: 72, attack: 87, block: 75, reading: 68, jump: 82 },
  outside: { pass: 74, set: 69, serve: 74, attack: 80, block: 70, reading: 73, jump: 79 },
};
const DEFAULT: Profile = {
  pass: 70, set: 70, serve: 70, attack: 70, block: 70, reading: 70, jump: 70,
};

/** Bom menos ruim; o meio-termo não pesa. */
function balance(t: Record<string, number>, good: string[], bad: string[]) {
  const sum = (keys: string[]) => keys.reduce((acc, key) => acc + total(t, key), 0);
  return sum(good) - sum(bad);
}

/**
 * Mesma regra do painel de vôlei de hoje (`getPlayerRatings`): base da posição
 * mais saldo dos fundamentos, sem normalizar por jogo.
 */
export function volleyballRating({ totals: t, position }: RatingInput): RatingResult {
  const base = (position && BASE[position]) || DEFAULT;
  const attributes = {
    pass: clampRating(base.pass + total(t, "pass_a") - total(t, "pass_c") * 3),
    set: clampRating(base.set + balance(t, ["set_good"], ["set_bad"])),
    serve: clampRating(base.serve + balance(t, ["serve_ace", "serve_good"], ["serve_error"])),
    attack: clampRating(base.attack + balance(t, ["attack_kill"], ["attack_error"])),
    block: clampRating(base.block + balance(t, ["block_point"], ["block_error"])),
    reading: clampRating(base.reading + balance(t, ["reading_good"], ["reading_bad"])),
    jump: clampRating(base.jump + balance(t, ["jump_good"], ["jump_bad"])),
  };
  const weights = Object.fromEntries(Object.keys(attributes).map((key) => [key, 1]));
  return { overall: weightedOverall(attributes, weights), attributes };
}
