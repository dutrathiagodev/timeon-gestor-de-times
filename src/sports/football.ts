import { FOOTBALL_ATTRIBUTES, footballRating } from "./rating/football";
import { periodsScore } from "./score";
import type {
  Formation,
  Position,
  SportDefinition,
  SportKey,
  StatDefinition,
} from "./types";

/** Uma linha da formação, da esquerda para a direita, uma posição por atleta. */
type Row = string[];

const repeat = (count: number, positionKey: string): Row => Array<string>(count).fill(positionKey);

function positionLabel(positions: Position[], key: string) {
  return positions.find((p) => p.key === key)?.label ?? key;
}

/**
 * Monta a formação a partir das linhas, da defesa ao ataque.
 * Goleiro fixo no fundo; cada linha distribui os atletas igualmente na largura.
 * Posição que se repete na formação (ex.: dois zagueiros) recebe número.
 */
function formation(
  key: string,
  positions: Position[],
  rows: Row[],
): Formation {
  const slots: Formation["slots"] = [
    { key: "gk", label: positionLabel(positions, "goalkeeper"), x: 50, y: 92, positionHint: "goalkeeper" },
  ];
  const total: Record<string, number> = {};
  rows.flat().forEach((positionKey) => (total[positionKey] = (total[positionKey] ?? 0) + 1));
  const seen: Record<string, number> = {};
  rows.forEach((row, r) => {
    const y = rows.length === 1 ? 50 : Math.round(72 - (r * 54) / (rows.length - 1));
    row.forEach((positionKey, i) => {
      seen[positionKey] = (seen[positionKey] ?? 0) + 1;
      const base = positionLabel(positions, positionKey);
      slots.push({
        key: `r${r + 1}_${i + 1}`,
        label: total[positionKey] > 1 ? `${base} ${seen[positionKey]}` : base,
        x: Math.round(((i + 1) * 100) / (row.length + 1)),
        y,
        positionHint: positionKey,
      });
    });
  });
  return { key, label: key, slots };
}

const GOALKEEPER: Position = { key: "goalkeeper", label: "Goleiro", short: "GOL" };

const SHARED_STATS: StatDefinition[] = [
  { key: "goals", label: "Gols", group: "Ataque", polarity: "positive", leader: true },
  { key: "assists", label: "Assistências", group: "Ataque", polarity: "positive", leader: true },
  { key: "shots_on", label: "Finalizações no alvo", group: "Ataque", polarity: "positive" },
  { key: "shots_off", label: "Finalizações para fora", group: "Ataque", polarity: "neutral" },
  { key: "tackles", label: "Desarmes", group: "Defesa", polarity: "positive" },
  { key: "fouls", label: "Faltas", group: "Disciplina", polarity: "negative" },
  { key: "yellow", label: "Cartões amarelos", group: "Disciplina", polarity: "negative" },
  { key: "red", label: "Cartões vermelhos", group: "Disciplina", polarity: "negative" },
  { key: "saves", label: "Defesas", group: "Goleiro", polarity: "positive", leader: true },
  { key: "goals_conceded", label: "Gols sofridos", group: "Goleiro", polarity: "negative" },
];

const MINUTES: StatDefinition = {
  key: "minutes_played",
  label: "Minutos jogados",
  group: "Participação",
  polarity: "neutral",
};

const FIELD_ONLY: StatDefinition[] = [
  { key: "passes_completed", label: "Passes certos", group: "Ataque", polarity: "positive" },
  { key: "offsides", label: "Impedimentos", group: "Disciplina", polarity: "negative" },
];

type FootballConfig = {
  key: Extract<SportKey, "futsal" | "football_society" | "football_field">;
  name: string;
  playersOnField: number;
  maxBench: number;
  positions: Position[];
  formations: [string, Row[]][];
  stats: StatDefinition[];
};

function footballSport(config: FootballConfig): SportDefinition {
  return {
    key: config.key,
    family: "football",
    name: config.name,
    playersOnField: config.playersOnField,
    maxBench: config.maxBench,
    positions: config.positions,
    formations: config.formations.map(([key, rows]) => formation(key, config.positions, rows)),
    score: periodsScore({ periods: 2, maxExtraPeriods: 2, allowDraw: true }),
    stats: config.stats,
    ratingAttributes: FOOTBALL_ATTRIBUTES,
    rating: footballRating,
    dashboardCards: ["next_event", "win_rate", "team_overall", "goal_balance"],
  };
}

export const futsal = footballSport({
  key: "futsal",
  name: "Futsal",
  playersOnField: 5,
  maxBench: 9,
  positions: [
    GOALKEEPER,
    { key: "fixo", label: "Fixo", short: "FIX" },
    { key: "ala", label: "Ala", short: "ALA" },
    { key: "pivo", label: "Pivô", short: "PIV" },
  ],
  formations: [
    ["1-2-1", [["fixo"], ["ala", "ala"], ["pivo"]]],
    ["2-2", [repeat(2, "fixo"), repeat(2, "ala")]],
    ["4-0", [repeat(4, "ala")]],
  ],
  stats: SHARED_STATS,
});

const OUTFIELD_POSITIONS: Position[] = [
  GOALKEEPER,
  { key: "defender", label: "Zagueiro", short: "ZAG" },
  { key: "fullback", label: "Lateral", short: "LAT" },
  { key: "midfielder", label: "Meio-campista", short: "MEI" },
  { key: "attacker", label: "Atacante", short: "ATA" },
];

export const footballSociety = footballSport({
  key: "football_society",
  name: "Fut7 / Society",
  playersOnField: 7,
  maxBench: 7,
  positions: OUTFIELD_POSITIONS,
  formations: [
    ["2-3-1", [repeat(2, "defender"), repeat(3, "midfielder"), ["attacker"]]],
    ["3-2-1", [repeat(3, "defender"), repeat(2, "midfielder"), ["attacker"]]],
    ["2-2-2", [repeat(2, "defender"), repeat(2, "midfielder"), repeat(2, "attacker")]],
  ],
  stats: [...SHARED_STATS, MINUTES],
});

/** Defesa de quatro: laterais nas pontas e dois zagueiros no meio. */
const BACK_FOUR: Row = ["fullback", "defender", "defender", "fullback"];

export const footballField = footballSport({
  key: "football_field",
  name: "Futebol de campo",
  playersOnField: 11,
  maxBench: 9,
  positions: [
    GOALKEEPER,
    { key: "defender", label: "Zagueiro", short: "ZAG" },
    { key: "fullback", label: "Lateral", short: "LAT" },
    { key: "defensive_mid", label: "Volante", short: "VOL" },
    { key: "midfielder", label: "Meia", short: "MEI" },
    { key: "winger", label: "Ponta", short: "PON" },
    { key: "striker", label: "Centroavante", short: "CEN" },
  ],
  formations: [
    ["4-3-3", [BACK_FOUR, repeat(3, "midfielder"), ["winger", "striker", "winger"]]],
    ["4-4-2", [BACK_FOUR, repeat(4, "midfielder"), repeat(2, "striker")]],
    ["3-5-2", [repeat(3, "defender"), repeat(5, "midfielder"), repeat(2, "striker")]],
    ["4-2-3-1", [BACK_FOUR, repeat(2, "defensive_mid"), repeat(3, "midfielder"), ["striker"]]],
  ],
  stats: [...SHARED_STATS, MINUTES, ...FIELD_ONLY],
});
