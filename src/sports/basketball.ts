import { BASKETBALL_ATTRIBUTES, basketballRating } from "./rating/basketball";
import { periodsScore } from "./score";
import type { Formation, SportDefinition } from "./types";

const SLOT_POSITION = {
  PG: { label: "Armador", hint: "point_guard" },
  SG: { label: "Ala-armador", hint: "shooting_guard" },
  SF: { label: "Ala", hint: "small_forward" },
  PF: { label: "Ala-pivô", hint: "power_forward" },
  C: { label: "Pivô", hint: "center" },
} as const;

type SlotKey = keyof typeof SLOT_POSITION;

function alignment(key: string, at: Record<SlotKey, [number, number]>): Formation {
  return {
    key,
    label: key,
    slots: (Object.keys(at) as SlotKey[]).map((slot) => ({
      key: slot,
      label: SLOT_POSITION[slot].label,
      x: at[slot][0],
      y: at[slot][1],
      positionHint: SLOT_POSITION[slot].hint,
    })),
  };
}

export const basketball: SportDefinition = {
  key: "basketball",
  family: "basketball",
  name: "Basquete",
  playersOnField: 5,
  maxBench: 7,
  positions: [
    { key: "point_guard", label: "Armador", short: "PG" },
    { key: "shooting_guard", label: "Ala-armador", short: "SG" },
    { key: "small_forward", label: "Ala", short: "SF" },
    { key: "power_forward", label: "Ala-pivô", short: "PF" },
    { key: "center", label: "Pivô", short: "C" },
  ],
  // Alinhamentos de ataque mais usados; a cesta adversária fica no alto do desenho.
  formations: [
    alignment("1-2-2", { PG: [50, 78], SG: [83, 58], SF: [17, 58], PF: [70, 26], C: [30, 26] }),
    alignment("2-1-2", { PG: [32, 80], SG: [68, 80], C: [50, 50], SF: [17, 24], PF: [83, 24] }),
    alignment("1-3-1", { PG: [50, 84], SG: [14, 52], C: [50, 50], SF: [86, 52], PF: [50, 18] }),
    alignment("Horns", { PG: [50, 82], SG: [12, 30], SF: [88, 30], PF: [32, 54], C: [68, 54] }),
    alignment("4 abertos", { PG: [30, 78], SG: [70, 78], SF: [12, 36], PF: [88, 36], C: [50, 18] }),
  ],
  score: periodsScore({ periods: 4, maxExtraPeriods: 4, allowDraw: false }),
  stats: [
    { key: "fg2_made", label: "Arremessos de 2 certos", group: "Arremessos", polarity: "positive", pairKey: "fg2_att" },
    { key: "fg2_att", label: "Arremessos de 2 tentados", group: "Arremessos", polarity: "neutral", pairKey: "fg2_made" },
    { key: "fg3_made", label: "Arremessos de 3 certos", group: "Arremessos", polarity: "positive", pairKey: "fg3_att" },
    { key: "fg3_att", label: "Arremessos de 3 tentados", group: "Arremessos", polarity: "neutral", pairKey: "fg3_made" },
    { key: "ft_made", label: "Lances livres certos", group: "Arremessos", polarity: "positive", pairKey: "ft_att" },
    { key: "ft_att", label: "Lances livres tentados", group: "Arremessos", polarity: "neutral", pairKey: "ft_made" },
    { key: "reb_off", label: "Rebotes ofensivos", group: "Rebotes", polarity: "positive", leader: true },
    { key: "reb_def", label: "Rebotes defensivos", group: "Rebotes", polarity: "positive", leader: true },
    { key: "assists", label: "Assistências", group: "Jogo", polarity: "positive", leader: true },
    { key: "steals", label: "Roubos de bola", group: "Defesa", polarity: "positive", leader: true },
    { key: "blocks", label: "Tocos", group: "Defesa", polarity: "positive" },
    { key: "turnovers", label: "Erros", group: "Jogo", polarity: "negative" },
    { key: "fouls", label: "Faltas", group: "Disciplina", polarity: "negative" },
  ],
  ratingAttributes: BASKETBALL_ATTRIBUTES,
  rating: basketballRating,
  dashboardCards: ["next_event", "win_rate", "team_overall", "points_per_game"],
};
