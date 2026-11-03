"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { getSport } from "@/sports/registry";
import type { TeamOption } from "@/lib/teams";
import { SportIcon } from "./sport-icon";

const STORAGE_KEY = "timeon.activeTeam";

type ActiveTeamContextType = {
  teams: TeamOption[];
  team: TeamOption | null;
  setTeamId: (id: string) => void;
};

const ActiveTeamContext = createContext<ActiveTeamContextType | undefined>(undefined);

// A escolha fica no navegador. useSyncExternalStore devolve null no servidor e na
// hidratação, então o servidor e o navegador renderizam igual antes de ler o valor.
const listeners = new Set<() => void>();
let fallbackId: string | null = null;

function readStoredId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? fallbackId;
  } catch {
    return fallbackId;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function storeId(id: string) {
  fallbackId = id;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Sem armazenamento (janela privada): a escolha vale só nesta aba.
  }
  listeners.forEach((listener) => listener());
}

export function ActiveTeamProvider({
  teams,
  children,
}: {
  teams: TeamOption[];
  children: ReactNode;
}) {
  const teamId = useSyncExternalStore(subscribe, readStoredId, () => null);
  // Sem escolha guardada (ou com time que não existe mais), vale o primeiro da lista.
  const team = teams.find((item) => item.id === teamId) ?? teams[0] ?? null;

  return (
    <ActiveTeamContext.Provider value={{ teams, team, setTeamId: storeId }}>
      {children}
    </ActiveTeamContext.Provider>
  );
}

export function useActiveTeam() {
  const context = useContext(ActiveTeamContext);
  if (!context) throw new Error("useActiveTeam must be used within ActiveTeamProvider");
  return context;
}

/** Seletor de time: agrupado por modalidade; com um time só, mostra apenas o nome. */
export function TeamSwitcher() {
  const { teams, team, setTeamId } = useActiveTeam();
  if (!team) return null;
  const sport = getSport(team.sportKey);

  return (
    <div className="team-switcher">
      <span className="team-switcher-icon">
        <SportIcon sportKey={team.sportKey} />
      </span>
      <div className="team-switcher-text">
        <small>Time ativo</small>
        {teams.length > 1 ? (
          <select
            aria-label="Time ativo"
            value={team.id}
            onChange={(event) => setTeamId(event.target.value)}
          >
            {Array.from(new Set(teams.map((item) => item.sportKey))).map((key) => (
              <optgroup key={key} label={getSport(key).name}>
                {teams
                  .filter((item) => item.sportKey === key)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {item.category}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        ) : (
          <strong>{team.name}</strong>
        )}
        <small>
          {sport.name} · {team.category}
        </small>
      </div>
    </div>
  );
}
