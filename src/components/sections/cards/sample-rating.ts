import { clampRating } from "@/sports/rating/shared";
import type { RatingResult, SportDefinition } from "@/sports/types";

/** Nota de exemplo de cada variante, no meio da faixa. */
export const TIER_SAMPLES = [
  { tier: "elite", overall: 95 },
  { tier: "gold", overall: 85 },
  { tier: "silver", overall: 75 },
  { tier: "bronze", overall: 60 },
] as const;

/**
 * Nota inventada para mostrar a carta: parte da base da posição e desloca todas as
 * estatísticas até a nota geral chegar no alvo. Serve só para a galeria.
 */
export function sampleRating(
  sport: SportDefinition,
  position: string,
  targetOverall: number,
): RatingResult {
  const base = sport.rating({ totals: {}, games: 0, position });
  const delta = targetOverall - base.overall;
  return {
    overall: targetOverall,
    attributes: Object.fromEntries(
      Object.entries(base.attributes).map(([key, value]) => [key, clampRating(value + delta)]),
    ),
  };
}
