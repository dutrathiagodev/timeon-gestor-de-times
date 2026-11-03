export const MIN_RATING = 40;
export const MAX_RATING = 99;

/** Valores por atributo, na escala da nota (40–99). */
export type Profile = Record<string, number>;

export function clampRating(value: number) {
  return Math.min(Math.max(Math.round(value), MIN_RATING), MAX_RATING);
}

export function total(totals: Record<string, number>, key: string) {
  const value = totals[key];
  return Number.isFinite(value) ? value : 0;
}

export function perGame(totals: Record<string, number>, key: string, games: number) {
  return games > 0 ? total(totals, key) / games : 0;
}

/** Média ponderada dos atributos, na mesma escala da nota. */
export function weightedOverall(
  attributes: Record<string, number>,
  weights: Record<string, number>,
) {
  let sum = 0;
  let weightSum = 0;
  for (const [key, weight] of Object.entries(weights)) {
    sum += (attributes[key] ?? 0) * weight;
    weightSum += weight;
  }
  return weightSum ? clampRating(sum / weightSum) : MIN_RATING;
}

export function pick<T extends Record<string, number>>(source: T, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, source[key]])) as Record<string, number>;
}
