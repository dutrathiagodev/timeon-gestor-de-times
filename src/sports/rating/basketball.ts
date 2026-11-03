import type { RatingAttribute, RatingInput, RatingResult } from "../types";
import { type Profile, clampRating, perGame, weightedOverall } from "./shared";

export const BASKETBALL_ATTRIBUTES: RatingAttribute[] = [
  { key: "shooting", label: "Arremesso", short: "ARR" },
  { key: "three", label: "Três pontos", short: "3PT" },
  { key: "rebounding", label: "Rebote", short: "REB" },
  { key: "assisting", label: "Assistência", short: "AST" },
  { key: "defense", label: "Defesa", short: "DEF" },
  { key: "physical", label: "Físico", short: "FIS" },
];

const profile = (
  shooting: number,
  three: number,
  rebounding: number,
  assisting: number,
  defense: number,
  physical: number,
): Profile => ({ shooting, three, rebounding, assisting, defense, physical });

const BASE: Record<string, Profile> = {
  point_guard: profile(70, 72, 52, 80, 66, 66),
  shooting_guard: profile(74, 78, 52, 66, 66, 68),
  small_forward: profile(72, 70, 62, 62, 70, 72),
  power_forward: profile(70, 58, 78, 54, 70, 78),
  center: profile(66, 48, 84, 52, 76, 82),
};
const DEFAULT = profile(68, 62, 66, 62, 68, 70);

/** Base da posição mais acertos, erros e ações de jogo por partida. */
export function basketballRating({ totals: t, games, position }: RatingInput): RatingResult {
  const base = (position && BASE[position]) || DEFAULT;
  const pg = (key: string) => perGame(t, key, games);
  const missed = (made: string, att: string) => Math.max(0, pg(att) - pg(made));

  const attributes = {
    shooting: clampRating(
      base.shooting +
        1.5 * pg("fg2_made") -
        1 * missed("fg2_made", "fg2_att") +
        0.5 * pg("ft_made") -
        0.5 * missed("ft_made", "ft_att"),
    ),
    three: clampRating(
      base.three + 3 * pg("fg3_made") - 1.5 * missed("fg3_made", "fg3_att"),
    ),
    rebounding: clampRating(base.rebounding + 2 * (pg("reb_off") + pg("reb_def"))),
    assisting: clampRating(base.assisting + 3 * pg("assists") - 2 * pg("turnovers")),
    defense: clampRating(
      base.defense + 4 * pg("steals") + 4 * pg("blocks") - 2 * pg("fouls"),
    ),
    physical: clampRating(base.physical),
  };
  const weights = Object.fromEntries(Object.keys(attributes).map((key) => [key, 1]));
  return { overall: weightedOverall(attributes, weights), attributes };
}
