import type { SportDefinition } from "../types";
import type { LiveActionDef } from "./types";

/** Lances que não são estatística de atleta: encerram período ou o jogo. */
export const END_PERIOD = "end_period";
export const FINISH = "finish";

const us = (value: number) => ({ side: "us" as const, value });
const them = (value: number) => ({ side: "them" as const, value });

/** Lance do adversário que dá ponto a ele, sem atleta nosso. */
const opponentPoint = (key: string, label: string, value: number): LiveActionDef => ({
  key,
  label,
  group: "Adversário",
  points: them(value),
  opponent: true,
  athlete: "none",
  credits: [],
});

const VOLLEYBALL: LiveActionDef[] = [
  { key: "attack_kill", label: "Ponto de ataque", group: "Pontos", points: us(1), athlete: "required", credits: ["attack_kill"] },
  { key: "serve_ace", label: "Ace", group: "Pontos", points: us(1), athlete: "required", credits: ["serve_ace"] },
  { key: "block_point", label: "Ponto de bloqueio", group: "Pontos", points: us(1), athlete: "required", credits: ["block_point"] },
  { key: "opponent_error", label: "Erro do adversário", group: "Pontos", points: us(1), athlete: "none", credits: [] },
  { key: "attack_error", label: "Erro de ataque", group: "Erros", points: them(1), athlete: "required", credits: ["attack_error"] },
  { key: "serve_error", label: "Erro de saque", group: "Erros", points: them(1), athlete: "required", credits: ["serve_error"] },
  { key: "block_error", label: "Erro de bloqueio", group: "Erros", points: them(1), athlete: "required", credits: ["block_error"] },
  { key: "our_error", label: "Erro nosso", group: "Erros", points: them(1), athlete: "none", credits: [] },
  opponentPoint("opponent_point", "Ponto do adversário", 1),
];

const BASKETBALL: LiveActionDef[] = [
  { key: "fg2_made", label: "Cesta de 2", group: "Pontos", points: us(2), athlete: "required", credits: ["fg2_made", "fg2_att"], assist: true },
  { key: "fg2_miss", label: "Arremesso de 2 errado", group: "Arremessos", athlete: "required", credits: ["fg2_att"] },
  { key: "fg3_made", label: "Cesta de 3", group: "Pontos", points: us(3), athlete: "required", credits: ["fg3_made", "fg3_att"], assist: true },
  { key: "fg3_miss", label: "Arremesso de 3 errado", group: "Arremessos", athlete: "required", credits: ["fg3_att"] },
  { key: "ft_made", label: "Lance livre certo", group: "Pontos", points: us(1), athlete: "required", credits: ["ft_made", "ft_att"] },
  { key: "ft_miss", label: "Lance livre errado", group: "Arremessos", athlete: "required", credits: ["ft_att"] },
  opponentPoint("opponent_fg2", "Cesta de 2 do adversário", 2),
  opponentPoint("opponent_fg3", "Cesta de 3 do adversário", 3),
  opponentPoint("opponent_ft", "Lance livre do adversário", 1),
];

const FOOTBALL: LiveActionDef[] = [
  { key: "goal", label: "Gol", group: "Pontos", points: us(1), athlete: "required", credits: ["goals", "shots_on"], assist: true },
  // O atleta, quando indicado, é o goleiro em campo e recebe o gol sofrido.
  { ...opponentPoint("opponent_goal", "Gol do adversário", 1), athlete: "optional", credits: ["goals_conceded"] },
];

const HANDBALL: LiveActionDef[] = [
  { key: "goal", label: "Gol", group: "Pontos", points: us(1), athlete: "required", credits: ["goals", "shots"], assist: true },
  { key: "shot_miss", label: "Arremesso sem gol", group: "Ataque", athlete: "required", credits: ["shots"] },
  opponentPoint("opponent_goal", "Gol do adversário", 1),
];

/** Estatísticas que um lance de ponto já credita (ou que dependem de outro lance): não viram contador solto. */
const NOT_COUNTERS: Record<SportDefinition["family"], string[]> = {
  volleyball: ["attack_kill", "serve_ace", "block_point", "attack_error", "serve_error", "block_error"],
  basketball: ["fg2_made", "fg2_att", "fg3_made", "fg3_att", "ft_made", "ft_att", "assists"],
  football: ["goals", "assists", "goals_conceded", "shots_on", "minutes_played"],
  handball: ["goals", "shots", "assists"],
};

const SCORING: Record<SportDefinition["family"], LiveActionDef[]> = {
  volleyball: VOLLEYBALL,
  basketball: BASKETBALL,
  football: FOOTBALL,
  handball: HANDBALL,
};

/** Futsal conta as faltas dos dois times (5 por tempo), então o adversário também tem lance de falta. */
const FUTSAL_EXTRA: LiveActionDef[] = [
  { key: "opponent_foul", label: "Falta do adversário", group: "Adversário", opponent: true, athlete: "none", credits: [] },
];

const cache = new WeakMap<object, LiveActionDef[]>();

/**
 * Lances disponíveis no esporte: os que dão ponto (regra da modalidade) mais
 * um contador para cada estatística que não é creditada por um lance de ponto.
 */
export function liveActions(sport: SportDefinition): LiveActionDef[] {
  const cached = cache.get(sport);
  if (cached) return cached;

  const scoring = SCORING[sport.family];
  const skip = new Set(NOT_COUNTERS[sport.family]);
  const counters: LiveActionDef[] = sport.stats
    .filter((stat) => !skip.has(stat.key))
    .map((stat) => ({
      key: stat.key,
      label: stat.label,
      group: stat.group,
      athlete: "required",
      credits: [stat.key],
    }));
  const extra = sport.key === "futsal" ? FUTSAL_EXTRA : [];

  const actions = [...scoring, ...counters, ...extra];
  cache.set(sport, actions);
  return actions;
}

export function findAction(sport: SportDefinition, key: string): LiveActionDef | undefined {
  return liveActions(sport).find((action) => action.key === key);
}
