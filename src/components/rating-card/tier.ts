export type RatingTier = "elite" | "gold" | "silver" | "bronze";

/** Nome de cada variante do card. "elite" é a variante especial (laranja). */
export const TIER_LABEL: Record<RatingTier, string> = {
  elite: "Especial",
  gold: "Ouro",
  silver: "Prata",
  bronze: "Bronze",
};

/**
 * Faixa visual da nota: especial 90 ou mais, ouro 80 a 89, prata 70 a 79 e bronze abaixo
 * de 70 (iniciantes). Os cortes seguem o card de vôlei de hoje.
 */
export function ratingTier(overall: number): RatingTier {
  if (overall >= 90) return "elite";
  if (overall >= 80) return "gold";
  if (overall >= 70) return "silver";
  return "bronze";
}
