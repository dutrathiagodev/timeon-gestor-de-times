import type { Formation, SportDefinition } from "./types";

/** Escalação: chave do slot da formação → id do atleta (ou vazio). */
export type Lineup = Record<string, string | null>;

export type LineupAthlete = { id: string; positionKey?: string | null };

export function emptyLineup(formation: Formation): Lineup {
  return Object.fromEntries(formation.slots.map((slot) => [slot.key, null]));
}

export function filledCount(lineup: Lineup): number {
  return Object.values(lineup).filter(Boolean).length;
}

export function slotOf(lineup: Lineup, athleteId: string): string | null {
  return Object.keys(lineup).find((key) => lineup[key] === athleteId) ?? null;
}

/**
 * Coloca o atleta no slot. Um atleta ocupa um slot só: se já estava em outro,
 * os dois trocam de lugar; se vinha do banco, quem ocupava o slot volta para o banco.
 * Slot que não existe na formação deixa a escalação como está.
 */
export function placeAthlete(lineup: Lineup, slotKey: string, athleteId: string): Lineup {
  if (!(slotKey in lineup)) return lineup;
  const previousSlot = slotOf(lineup, athleteId);
  if (previousSlot === slotKey) return lineup;

  const next = { ...lineup };
  const displaced = lineup[slotKey];
  if (previousSlot) next[previousSlot] = displaced;
  next[slotKey] = athleteId;
  return next;
}

export function removeAthlete(lineup: Lineup, athleteId: string): Lineup {
  const slot = slotOf(lineup, athleteId);
  return slot ? { ...lineup, [slot]: null } : lineup;
}

/**
 * Troca de formação (ex.: 4-3-3 para 4-4-2) mantendo quem já estava em campo:
 * cada atleta vai para um slot livre da mesma posição; quem não encaixa ocupa
 * os slots que sobrarem, e o excedente volta para o banco.
 */
export function reseatLineup(from: Formation, to: Formation, lineup: Lineup): Lineup {
  const next = emptyLineup(to);
  const hintOf = new Map(from.slots.map((slot) => [slot.key, slot.positionHint]));
  const leftover: string[] = [];

  for (const slot of from.slots) {
    const athleteId = lineup[slot.key];
    if (!athleteId) continue;
    const target = to.slots.find(
      (candidate) => !next[candidate.key] && candidate.positionHint === hintOf.get(slot.key),
    );
    if (target) next[target.key] = athleteId;
    else leftover.push(athleteId);
  }
  for (const athleteId of leftover) {
    const free = to.slots.find((candidate) => !next[candidate.key]);
    if (free) next[free.key] = athleteId;
  }
  return next;
}

/**
 * Rotação do vôlei no sentido horário, vista de cima com a rede no topo:
 * quem está em P2 vai para P1, P1→P6, P6→P5, P5→P4, P4→P3, P3→P2.
 * O líbero (L) fica fora da rotação.
 */
const ROTATION_ORDER = ["P1", "P6", "P5", "P4", "P3", "P2"] as const;

export function rotateVolleyball(lineup: Lineup): Lineup {
  const next = { ...lineup };
  ROTATION_ORDER.forEach((slot, index) => {
    const from = ROTATION_ORDER[(index + 5) % 6];
    next[slot] = lineup[from] ?? null;
  });
  return next;
}

/** As seis rotações a partir da inicial; a rotação 1 é a própria escalação inicial. */
export function volleyballRotations(initial: Lineup): Lineup[] {
  const rotations = [initial];
  for (let i = 1; i < 6; i++) rotations.push(rotateVolleyball(rotations[i - 1]));
  return rotations;
}

export type LineupIssue = {
  code: "position_mismatch" | "libero_front_row" | "libero_slot_requires_libero";
  slotKey: string;
  message: string;
};

const VOLLEYBALL_FRONT_ROW = new Set(["P2", "P3", "P4"]);

type IssueOptions = {
  /**
   * Compara a posição do atleta com a indicada no slot. No vôlei só vale para a
   * rotação 1: depois de girar, cada posição passa por todos os slots.
   */
  checkPositionHints?: boolean;
};

/**
 * Alertas da escalação. Nenhum bloqueia: o treinador pode escalar fora da
 * posição de propósito, a tela só avisa. Atleta sem posição cadastrada não gera alerta.
 */
export function lineupIssues(
  sport: Pick<SportDefinition, "key" | "positions">,
  formation: Formation,
  lineup: Lineup,
  athletes: LineupAthlete[],
  { checkPositionHints = true }: IssueOptions = {},
): LineupIssue[] {
  const byId = new Map(athletes.map((athlete) => [athlete.id, athlete]));
  const label = (key?: string | null) =>
    sport.positions.find((position) => position.key === key)?.label ?? "posição desconhecida";
  const issues: LineupIssue[] = [];

  for (const slot of formation.slots) {
    const athlete = byId.get(lineup[slot.key] ?? "");
    const position = athlete?.positionKey;
    if (!athlete || !position) continue;

    if (sport.key === "volleyball") {
      const isLibero = position === "libero";
      if (slot.key === "L" && !isLibero) {
        issues.push({
          code: "libero_slot_requires_libero",
          slotKey: slot.key,
          message: `A vaga de líbero pede um líbero, mas o atleta joga de ${label(position)}.`,
        });
        continue;
      }
      if (isLibero) {
        if (VOLLEYBALL_FRONT_ROW.has(slot.key)) {
          issues.push({
            code: "libero_front_row",
            slotKey: slot.key,
            message: `Líbero não pode jogar na rede (${slot.key}).`,
          });
        }
        continue;
      }
    }

    if (checkPositionHints && slot.positionHint && slot.positionHint !== position) {
      issues.push({
        code: "position_mismatch",
        slotKey: slot.key,
        message: `${slot.label}: o atleta joga de ${label(position)}, não de ${label(slot.positionHint)}.`,
      });
    }
  }
  return issues;
}
