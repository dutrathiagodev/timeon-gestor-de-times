import type { RatingAttribute, RatingInput, RatingResult } from "../types";
import { type Profile, clampRating, perGame, pick, weightedOverall } from "./shared";

export const FOOTBALL_ATTRIBUTES: RatingAttribute[] = [
  { key: "finishing", label: "Finalização", short: "FIN" },
  { key: "passing", label: "Passe", short: "PAS" },
  { key: "dribbling", label: "Drible", short: "DRI" },
  { key: "defense", label: "Defesa", short: "DEF" },
  { key: "physical", label: "Físico", short: "FIS" },
  { key: "goalkeeping", label: "Goleiro", short: "GOL" },
];

const profile = (
  finishing: number,
  passing: number,
  dribbling: number,
  defense: number,
  physical: number,
  goalkeeping = 40,
): Profile => ({ finishing, passing, dribbling, defense, physical, goalkeeping });

/** Cobre as posições de futsal, society e campo. */
const BASE: Record<string, Profile> = {
  goalkeeper: profile(40, 55, 40, 60, 68, 76),
  fixo: profile(55, 68, 60, 78, 72),
  ala: profile(70, 72, 76, 62, 70),
  pivo: profile(78, 62, 66, 55, 74),
  defender: profile(48, 62, 55, 80, 76),
  fullback: profile(55, 68, 68, 72, 74),
  defensive_mid: profile(52, 72, 62, 76, 76),
  midfielder: profile(66, 76, 72, 62, 70),
  winger: profile(72, 68, 80, 52, 72),
  attacker: profile(78, 64, 74, 50, 70),
  striker: profile(80, 62, 72, 48, 72),
};
const DEFAULT = profile(70, 70, 70, 70, 70, 70);

const FIELD_KEYS = ["finishing", "passing", "dribbling", "defense", "physical"];
const GOALKEEPER_WEIGHTS = { goalkeeping: 3, passing: 1, defense: 1, physical: 1 };

/**
 * Base da posição mais desempenho por jogo. Drible e físico não têm
 * estatística de jogo: ficam na base da posição até existir ajuste do treinador.
 */
export function footballRating({ totals: t, games, position }: RatingInput): RatingResult {
  const base = (position && BASE[position]) || DEFAULT;
  const pg = (key: string) => perGame(t, key, games);

  const all = {
    finishing: clampRating(base.finishing + 10 * pg("goals") + 3 * pg("shots_on")),
    passing: clampRating(base.passing + 8 * pg("assists") + 0.5 * pg("passes_completed")),
    dribbling: clampRating(base.dribbling),
    defense: clampRating(
      base.defense + 5 * pg("tackles") - 3 * pg("fouls") - 8 * pg("yellow") - 20 * pg("red"),
    ),
    physical: clampRating(base.physical),
    goalkeeping: clampRating(
      base.goalkeeping + 3 * pg("saves") - 6 * pg("goals_conceded"),
    ),
  };

  if (position === "goalkeeper") {
    const attributes = pick(all, ["goalkeeping", "passing", "defense", "physical"]);
    return { overall: weightedOverall(attributes, GOALKEEPER_WEIGHTS), attributes };
  }
  const attributes = pick(all, FIELD_KEYS);
  const weights = Object.fromEntries(FIELD_KEYS.map((key) => [key, 1]));
  return { overall: weightedOverall(attributes, weights), attributes };
}
