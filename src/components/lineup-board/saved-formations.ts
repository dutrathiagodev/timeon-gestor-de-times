"use client";

import { useSyncExternalStore } from "react";
import type { Formation, SportKey } from "@/sports/types";

/**
 * Esquemas personalizados salvos neste navegador, por modalidade.
 * Ainda não vão para o banco: quando houver tabela de escalação, passam a ser do time.
 */
const PREFIX = "timeon.formations.";
const listeners = new Set<() => void>();
const memory: Record<string, string> = {};
const EMPTY: Formation[] = [];
const cache = new Map<string, { raw: string; value: Formation[] }>();

function read(sportKey: SportKey): Formation[] {
  let raw = memory[sportKey] ?? "";
  try {
    raw = window.localStorage.getItem(PREFIX + sportKey) ?? raw;
  } catch {
    // sem armazenamento: usa a memória da aba
  }
  if (!raw) return EMPTY;
  const hit = cache.get(sportKey);
  if (hit && hit.raw === raw) return hit.value;
  let value: Formation[] = EMPTY;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) value = parsed.filter(isFormation);
  } catch {
    value = EMPTY;
  }
  cache.set(sportKey, { raw, value });
  return value;
}

function isFormation(value: unknown): value is Formation {
  const f = value as Formation;
  return (
    typeof f?.key === "string" &&
    typeof f?.label === "string" &&
    Array.isArray(f?.slots) &&
    f.slots.every((s) => typeof s.key === "string" && Number.isFinite(s.x) && Number.isFinite(s.y))
  );
}

function write(sportKey: SportKey, list: Formation[]) {
  const raw = JSON.stringify(list);
  memory[sportKey] = raw;
  try {
    window.localStorage.setItem(PREFIX + sportKey, raw);
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

export function useSavedFormations(sportKey: SportKey) {
  const saved = useSyncExternalStore(subscribe, () => read(sportKey), () => EMPTY);

  function save(formation: Formation, name: string): Formation {
    const label = name.trim().slice(0, 40) || "Personalizado";
    const created: Formation = { ...formation, key: `saved:${Date.now().toString(36)}`, label };
    write(sportKey, [...read(sportKey), created]);
    return created;
  }

  function remove(key: string) {
    write(
      sportKey,
      read(sportKey).filter((formation) => formation.key !== key),
    );
  }

  return { saved, save, remove };
}
