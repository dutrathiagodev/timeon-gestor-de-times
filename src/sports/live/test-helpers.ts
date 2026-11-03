import type { LiveEvent } from "./types";

let counter = 0;

/** Atalho para montar lances nos testes. */
export function ev(action: string, athleteId?: string | null, assistAthleteId?: string | null): LiveEvent {
  counter += 1;
  return { id: `e${counter}`, action, athleteId, assistAthleteId };
}

export function repeat(count: number, make: () => LiveEvent): LiveEvent[] {
  return Array.from({ length: count }, make);
}
