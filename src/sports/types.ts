export type SportKey =
  | "volleyball"
  | "futsal"
  | "football_society"
  | "football_field"
  | "basketball"
  | "handball";

export type SportFamily = "volleyball" | "football" | "basketball" | "handball";

/** Um período do jogo: set no vôlei, tempo no futebol/handebol, quarto no basquete. */
export type Period = { us: number; them: number };

export type Issue = { code: string; message: string; period?: number };

export type Position = { key: string; label: string; short: string };

export type FormationSlot = {
  key: string;
  label: string;
  /** 0–100, da esquerda para a direita. */
  x: number;
  /** 0–100, de cima (ataque) para baixo (própria defesa/fundo). */
  y: number;
  positionHint?: string;
};

export type Formation = { key: string; label: string; slots: FormationSlot[] };

export type StatPolarity = "positive" | "neutral" | "negative";

export type StatDefinition = {
  key: string;
  label: string;
  group: string;
  polarity: StatPolarity;
  /** Estatística par (ex.: acertos ↔ tentativas), para exibir aproveitamento. */
  pairKey?: string;
  /** Aparece em rankings e destaques. */
  leader?: boolean;
};

export type DashboardCardKey =
  | "next_event"
  | "win_rate"
  | "team_overall"
  | "set_balance"
  | "goal_balance"
  | "points_per_game";

export type ScoreRules = {
  model: "sets" | "periods";
  /** Períodos regulamentares (sets: máximo de sets da partida). */
  periods: number;
  /** Períodos extras permitidos (prorrogação); 0 quando não existe. */
  maxExtraPeriods: number;
  /** Valida o placar de uma partida encerrada. Lista vazia = válido. */
  validate(periods: Period[]): Issue[];
  /** Placar final: sets ganhos (vôlei) ou soma dos períodos. */
  final(periods: Period[]): { us: number; them: number };
};

export type RatingAttribute = { key: string; label: string; short: string };

export type RatingInput = {
  /** Soma das estatísticas do atleta (chaves de `SportDefinition.stats`). */
  totals: Record<string, number>;
  /** Jogos em que a soma foi feita; 0 devolve a nota base da posição. */
  games: number;
  position?: string | null;
};

export type RatingResult = {
  /** Nota de 40 a 99. */
  overall: number;
  /** Cada atributo na mesma escala, só os que valem para a posição. */
  attributes: Record<string, number>;
};

export interface SportDefinition {
  key: SportKey;
  family: SportFamily;
  name: string;
  /** Atletas em quadra/campo, sem contar o líbero do vôlei. */
  playersOnField: number;
  maxBench: number;
  positions: Position[];
  formations: Formation[];
  score: ScoreRules;
  stats: StatDefinition[];
  /** Todos os atributos que o card de OVR do esporte pode mostrar. */
  ratingAttributes: RatingAttribute[];
  rating(input: RatingInput): RatingResult;
  dashboardCards: DashboardCardKey[];
}
