import type { Issue, Period } from "../types";

export type Side = "us" | "them";

/** Um toque do técnico no jogo. A ordem da lista é a ordem dos lances. */
export type LiveEvent = {
  id: string;
  /** Chave de `liveActions(sport)`, ou `end_period` e `finish`. */
  action: string;
  athleteId?: string | null;
  /** Quem deu a assistência, quando o lance aceita assistência. */
  assistAthleteId?: string | null;
};

export type LiveActionDef = {
  key: string;
  label: string;
  group: string;
  /** Pontos que o lance dá, e para quem. Sem `points`, só conta na estatística. */
  points?: { side: Side; value: number };
  /** O lance é do adversário (não tem atleta nosso, salvo goleiro quando indicado). */
  opponent?: boolean;
  athlete: "required" | "optional" | "none";
  /** Estatísticas creditadas ao atleta. */
  credits: string[];
  /** Aceita `assistAthleteId` e credita `assists` a ele. */
  assist?: boolean;
};

export type LiveAlert = {
  code: string;
  message: string;
  athleteId?: string;
  side?: Side;
};

export type LiveIssue = Issue & {
  /** Posição (a partir de 1) do lance recusado na lista. */
  eventIndex: number;
};

export type LiveState = {
  /** Períodos já fechados: sets no vôlei, tempos ou quartos nos demais. */
  periods: Period[];
  /** Período em andamento. */
  current: Period;
  /** Número (a partir de 1) do período em andamento. */
  currentNumber: number;
  /** Placar do jogo: sets ganhos no vôlei, soma dos períodos nos demais. */
  score: { us: number; them: number };
  finished: boolean;
  winner: Side | "draw" | null;
  /** Atleta → estatística → total. */
  stats: Record<string, Record<string, number>>;
  /** Lances recusados e por quê; recusado não altera nada. */
  issues: LiveIssue[];
  /** Avisos da regra da modalidade; nunca bloqueiam. */
  alerts: LiveAlert[];
};
