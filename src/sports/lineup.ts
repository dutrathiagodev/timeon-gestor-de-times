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
