import { HANDBALL_ATTRIBUTES, handballRating } from "./rating/handball";
import { periodsScore } from "./score";
import type { SportDefinition } from "./types";

export const handball: SportDefinition = {
  key: "handball",
  family: "handball",
  name: "Handebol",
  playersOnField: 7,
  maxBench: 7,
  positions: [
    { key: "goalkeeper", label: "Goleiro", short: "GOL" },
    { key: "wing", label: "Ponta", short: "PON" },
    { key: "playmaker", label: "Armador", short: "ARM" },
    { key: "center_back", label: "Central", short: "CEN" },
    { key: "pivot", label: "Pivô", short: "PIV" },
  ],
  formations: [
    {
      key: "6-0",
      label: "6-0",
      slots: [
        { key: "gk", label: "Goleiro", x: 50, y: 92, positionHint: "goalkeeper" },
        { key: "lw", label: "Ponta esquerda", x: 8, y: 55, positionHint: "wing" },
        { key: "lb", label: "Armador esquerdo", x: 28, y: 40, positionHint: "playmaker" },
        { key: "cb", label: "Central", x: 50, y: 35, positionHint: "center_back" },
        { key: "rb", label: "Armador direito", x: 72, y: 40, positionHint: "playmaker" },
        { key: "rw", label: "Ponta direita", x: 92, y: 55, positionHint: "wing" },
        { key: "pv", label: "Pivô", x: 50, y: 15, positionHint: "pivot" },
      ],
    },
  ],
  score: periodsScore({ periods: 2, maxExtraPeriods: 2, allowDraw: true }),
  stats: [
    { key: "goals", label: "Gols", group: "Ataque", polarity: "positive", leader: true, pairKey: "shots" },
    { key: "shots", label: "Arremessos", group: "Ataque", polarity: "neutral", pairKey: "goals" },
    { key: "assists", label: "Assistências", group: "Ataque", polarity: "positive", leader: true },
    { key: "saves", label: "Defesas", group: "Goleiro", polarity: "positive", leader: true },
    { key: "suspensions_2min", label: "Exclusões de 2 min", group: "Disciplina", polarity: "negative" },
    { key: "yellow", label: "Cartões amarelos", group: "Disciplina", polarity: "negative" },
    { key: "red", label: "Cartões vermelhos", group: "Disciplina", polarity: "negative" },
  ],
  ratingAttributes: HANDBALL_ATTRIBUTES,
  rating: handballRating,
  dashboardCards: ["next_event", "win_rate", "team_overall", "goal_balance"],
};
