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
  // Ataque (3-3 e 2-4, com o gol adversário no alto) e defesa (6-0 e 5-1, junto do próprio gol).
  formations: [
    {
      key: "3-3",
      label: "3-3 ataque",
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
    {
      key: "2-4",
      label: "2-4 ataque",
      slots: [
        { key: "gk", label: "Goleiro", x: 50, y: 92, positionHint: "goalkeeper" },
        { key: "lw", label: "Ponta esquerda", x: 8, y: 55, positionHint: "wing" },
        { key: "lb", label: "Armador esquerdo", x: 30, y: 44, positionHint: "playmaker" },
        { key: "rb", label: "Armador direito", x: 70, y: 44, positionHint: "playmaker" },
        { key: "rw", label: "Ponta direita", x: 92, y: 55, positionHint: "wing" },
        { key: "pv1", label: "Pivô 1", x: 34, y: 16, positionHint: "pivot" },
        { key: "pv2", label: "Pivô 2", x: 66, y: 16, positionHint: "pivot" },
      ],
    },
    {
      key: "6-0",
      label: "6-0 defesa",
      slots: [
        { key: "gk", label: "Goleiro", x: 50, y: 92, positionHint: "goalkeeper" },
        { key: "d1", label: "Ponta esquerda", x: 9, y: 70, positionHint: "wing" },
        { key: "d2", label: "Lateral esquerdo", x: 25.5, y: 72, positionHint: "playmaker" },
        { key: "d3", label: "Central esquerdo", x: 42, y: 73, positionHint: "center_back" },
        { key: "d4", label: "Central direito", x: 58, y: 73, positionHint: "pivot" },
        { key: "d5", label: "Lateral direito", x: 74.5, y: 72, positionHint: "playmaker" },
        { key: "d6", label: "Ponta direita", x: 91, y: 70, positionHint: "wing" },
      ],
    },
    {
      key: "5-1",
      label: "5-1 defesa",
      slots: [
        { key: "gk", label: "Goleiro", x: 50, y: 92, positionHint: "goalkeeper" },
        { key: "d1", label: "Ponta esquerda", x: 10, y: 70, positionHint: "wing" },
        { key: "d2", label: "Lateral esquerdo", x: 30, y: 73, positionHint: "playmaker" },
        { key: "d3", label: "Central", x: 50, y: 74, positionHint: "pivot" },
        { key: "d4", label: "Lateral direito", x: 70, y: 73, positionHint: "playmaker" },
        { key: "d5", label: "Ponta direita", x: 90, y: 70, positionHint: "wing" },
        { key: "av", label: "Avançado", x: 50, y: 50, positionHint: "center_back" },
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
