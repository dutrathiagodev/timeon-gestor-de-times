import type { RatingAttribute, RatingInput, RatingResult } from "../types";
import { type Profile, clampRating, perGame, pick, weightedOverall } from "./shared";

export const HANDBALL_ATTRIBUTES: RatingAttribute[] = [
  { key: "shooting", label: "Arremesso", short: "ARR" },
  { key: "assisting", label: "Assistência", short: "ASS" },
  { key: "defense", label: "Defesa", short: "DEF" },
  { key: "physical", label: "Físico", short: "FIS" },
  { key: "goalkeeping", label: "Goleiro", short: "GOL" },
];

const profile = (
  shooting: number,
  assisting: number,
  defense: number,
  physical: number,
  goalkeeping = 40,
): Profile => ({ shooting, assisting, defense, physical, goalkeeping });

const BASE: Record<string, Profile> = {
  goalkeeper: profile(40, 50, 60, 68, 78),
  wing: profile(72, 60, 58, 68),
  playmaker: profile(76, 74, 62, 70),
  center_back: profile(74, 80, 64, 70),
  pivot: profile(74, 56, 72, 80),
};
const DEFAULT = profile(68, 66, 64, 70, 68);

const FIELD_KEYS = ["shooting", "assisting", "defense", "physical"];
const GOALKEEPER_WEIGHTS = { goalkeeping: 3, defense: 1, physical: 1 };

/** Base da posição mais gols, assistências, defesas e disciplina por jogo. */
export function handballRating({ totals: t, games, position }: RatingInput): RatingResult {
  const base = (position && BASE[position]) || DEFAULT;
  const pg = (key: string) => perGame(t, key, games);

  const all = {
    shooting: clampRating(
      base.shooting + 3 * pg("goals") - 1.5 * Math.max(0, pg("shots") - pg("goals")),
    ),
    assisting: clampRating(base.assisting + 4 * pg("assists")),
    defense: clampRating(
      base.defense - 8 * pg("suspensions_2min") - 6 * pg("yellow") - 15 * pg("red"),
    ),
    physical: clampRating(base.physical),
    goalkeeping: clampRating(base.goalkeeping + 1.2 * pg("saves")),
  };

  if (position === "goalkeeper") {
    const attributes = pick(all, ["goalkeeping", "assisting", "defense", "physical"]);
    return { overall: weightedOverall(attributes, GOALKEEPER_WEIGHTS), attributes };
  }
  const attributes = pick(all, FIELD_KEYS);
  const weights = Object.fromEntries(FIELD_KEYS.map((key) => [key, 1]));
  return { overall: weightedOverall(attributes, weights), attributes };
}
