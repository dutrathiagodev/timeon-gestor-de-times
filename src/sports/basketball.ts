import { periodsScore } from "./score";
import type { SportDefinition } from "./types";

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
  formations: [
    {
      key: "titular",
      label: "Titular 5",
      slots: [
        { key: "PG", label: "Armador", x: 50, y: 75, positionHint: "point_guard" },
        { key: "SG", label: "Ala-armador", x: 85, y: 60, positionHint: "shooting_guard" },
        { key: "SF", label: "Ala", x: 15, y: 60, positionHint: "small_forward" },
        { key: "PF", label: "Ala-pivô", x: 70, y: 30, positionHint: "power_forward" },
        { key: "C", label: "Pivô", x: 35, y: 25, positionHint: "center" },
      ],
    },
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
  dashboardCards: ["next_event", "win_rate", "team_overall", "points_per_game"],
};
