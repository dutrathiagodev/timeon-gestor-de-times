export type RatingTier = "elite" | "gold" | "silver" | "bronze";

/** Faixa visual da nota. Os cortes seguem o card de vôlei de hoje (90, 80 e 70). */
export function ratingTier(overall: number): RatingTier {
  if (overall >= 90) return "elite";
  if (overall >= 80) return "gold";
  if (overall >= 70) return "silver";
  return "bronze";
}
