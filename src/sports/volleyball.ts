import { setsScore } from "./score";
import type {
  Formation,
  FormationSlot,
  SportDefinition,
  StatDefinition,
  StatPolarity,
} from "./types";

/**
 * Quadra vista de cima, rede no topo: linha da frente P4 P3 P2, fundo P5 P6 P1.
 * O líbero (L) fica fora do desenho da rotação e entra no lugar de um central.
 */
const COURT: Record<string, { x: number; y: number }> = {
  P4: { x: 17, y: 25 },
  P3: { x: 50, y: 25 },
  P2: { x: 83, y: 25 },
  P5: { x: 17, y: 75 },
  P6: { x: 50, y: 75 },
  P1: { x: 83, y: 75 },
  L: { x: 95, y: 95 },
};

const POSITION_LABELS: Record<string, string> = {
  setter: "Levantador",
  opposite: "Oposto",
  outside: "Ponteiro",
  middle: "Central",
  libero: "Líbero",
};

function formation(
  key: string,
  hints: Record<"P1" | "P2" | "P3" | "P4" | "P5" | "P6", string>,
): Formation {
  const slots: FormationSlot[] = (Object.keys(hints) as (keyof typeof hints)[]).map((slot) => ({
    key: slot,
    label: `${slot} · ${POSITION_LABELS[hints[slot]]}`,
    ...COURT[slot],
    positionHint: hints[slot],
  }));
  slots.push({
    key: "L",
    label: POSITION_LABELS.libero,
    ...COURT.L,
    positionHint: "libero",
  });
  return { key, label: key, slots };
}

const GOOD_OK_BAD: StatPolarity[] = ["positive", "neutral", "negative"];

function triple(
  group: string,
  prefix: string,
  suffixes: [string, string, string],
  labels: [string, string, string],
): StatDefinition[] {
  return suffixes.map((suffix, i) => ({
    key: `${prefix}_${suffix}`,
    label: labels[i],
    group,
    polarity: GOOD_OK_BAD[i],
  }));
}

const BASE_STATS: StatDefinition[] = [
  ...triple("Passe", "pass", ["a", "b", "c"], ["Passe A", "Passe B", "Passe C"]),
  ...triple("Levantamento", "set", ["good", "ok", "bad"], ["Toque bom", "Toque médio", "Toque ruim"]),
  ...triple("Saque", "serve", ["ace", "good", "error"], ["Ace", "Saque bom", "Erro de saque"]),
  ...triple("Ataque", "attack", ["kill", "ok", "error"], ["Ponto de ataque", "Ataque médio", "Erro de ataque"]),
  ...triple("Bloqueio", "block", ["point", "ok", "error"], ["Ponto de bloqueio", "Bloqueio médio", "Erro de bloqueio"]),
  { key: "dig", label: "Defesas", group: "Defesa", polarity: "positive" },
  ...triple("Noção de jogo", "reading", ["good", "ok", "bad"], ["Noção boa", "Noção média", "Noção ruim"]),
  ...triple("Pulo", "jump", ["good", "ok", "bad"], ["Pulo bom", "Pulo médio", "Pulo ruim"]),
];

const LEADER_STATS = ["attack_kill", "serve_ace", "block_point", "dig"];

const STATS: StatDefinition[] = BASE_STATS.map((stat) =>
  LEADER_STATS.includes(stat.key) ? { ...stat, leader: true } : stat,
);

export const volleyball: SportDefinition = {
  key: "volleyball",
  family: "volleyball",
  name: "Vôlei",
  playersOnField: 6,
  maxBench: 6,
  positions: [
    { key: "setter", label: POSITION_LABELS.setter, short: "LEV" },
    { key: "opposite", label: POSITION_LABELS.opposite, short: "OPO" },
    { key: "outside", label: POSITION_LABELS.outside, short: "PON" },
    { key: "middle", label: POSITION_LABELS.middle, short: "CEN" },
    { key: "libero", label: POSITION_LABELS.libero, short: "LIB" },
  ],
  formations: [
    formation("5-1", {
      P1: "setter",
      P2: "outside",
      P3: "middle",
      P4: "opposite",
      P5: "outside",
      P6: "middle",
    }),
    formation("6-2", {
      P1: "setter",
      P2: "outside",
      P3: "middle",
      P4: "setter",
      P5: "outside",
      P6: "middle",
    }),
    formation("4-2", {
      P1: "opposite",
      P2: "outside",
      P3: "setter",
      P4: "opposite",
      P5: "outside",
      P6: "setter",
    }),
  ],
  score: setsScore(5),
  stats: STATS,
  dashboardCards: ["next_event", "win_rate", "team_overall", "set_balance"],
};
