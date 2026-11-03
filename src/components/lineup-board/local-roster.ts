"use client";

import { useSyncExternalStore } from "react";
import type { BoardAthlete } from "./lineup-board";

/**
 * Elenco de cada time neste navegador. Enquanto as telas não leem o banco novo, é aqui que
 * o técnico cadastra os atletas de cada modalidade; depois passa a ser o elenco do banco.
 */
const PREFIX = "timeon.roster.";
const listeners = new Set<() => void>();
const memory: Record<string, string> = {};
const EMPTY: BoardAthlete[] = [];
const cache = new Map<string, { raw: string; value: BoardAthlete[] }>();

function isAthlete(value: unknown): value is BoardAthlete {
  const a = value as BoardAthlete;
  return typeof a?.id === "string" && typeof a?.name === "string";
}

function read(teamId: string): BoardAthlete[] {
  let raw = memory[teamId] ?? "";
  try {
    raw = window.localStorage.getItem(PREFIX + teamId) ?? raw;
  } catch {
    // sem armazenamento: usa a memória da aba
  }
  if (!raw) return EMPTY;
  const hit = cache.get(teamId);
  if (hit && hit.raw === raw) return hit.value;
  let value = EMPTY;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) value = parsed.filter(isAthlete);
  } catch {
    value = EMPTY;
  }
  cache.set(teamId, { raw, value });
  return value;
}

function write(teamId: string, list: BoardAthlete[]) {
  const raw = JSON.stringify(list);
  memory[teamId] = raw;
  try {
    window.localStorage.setItem(PREFIX + teamId, raw);
  } catch {
    // sem armazenamento: fica só nesta aba
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useLocalRoster(teamId: string) {
  const roster = useSyncExternalStore(subscribe, () => read(teamId), () => EMPTY);
  return {
    roster,
    add: (athlete: BoardAthlete) => write(teamId, [...read(teamId), athlete]),
    remove: (id: string) =>
      write(
        teamId,
        read(teamId).filter((athlete) => athlete.id !== id),
      ),
  };
}

/** Identificador novo para um atleta do elenco local. */
export function newRosterId(teamId: string): string {
  return `${teamId}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
