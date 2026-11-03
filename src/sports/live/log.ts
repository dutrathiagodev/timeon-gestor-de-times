import type { SportDefinition } from "../types";
import { computeLive } from "./engine";
import type { LiveEvent, LiveIssue, LiveState } from "./types";

export type AddResult =
  | { ok: true; events: LiveEvent[]; state: LiveState }
  | { ok: false; issues: LiveIssue[] };

/**
 * Acrescenta um lance se ele for válido. Devolve a lista nova e o estado, ou os
 * motivos da recusa sem alterar a lista (a tela mostra o motivo ao técnico).
 */
export function addEvent(
  sport: SportDefinition,
  events: LiveEvent[],
  event: LiveEvent,
): AddResult {
  const before = computeLive(sport, events).issues.length;
  const next = [...events, event];
  const state = computeLive(sport, next);
  if (state.issues.length > before) {
    return { ok: false, issues: state.issues.slice(before) };
  }
  return { ok: true, events: next, state };
}

/** Desfaz o último lance. Lista vazia continua vazia. */
export function undoLast(events: LiveEvent[]): LiveEvent[] {
  return events.slice(0, -1);
}
