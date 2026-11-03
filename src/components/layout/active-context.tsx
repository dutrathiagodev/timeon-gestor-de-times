"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { getSport } from "@/sports/registry";
import {
  groupTeamsBySport,
  teamsOfOrganization,
  type OrganizationOption,
  type OrgRole,
  type TeamOption,
} from "@/lib/teams";

const ORG_KEY = "timeon.activeOrganization";
const TEAM_KEY = "timeon.activeTeam";

type ActiveContextType = {
  organizations: OrganizationOption[];
  organization: OrganizationOption | null;
  /** Times da organização ativa. */
  teams: TeamOption[];
  team: TeamOption | null;
  role: OrgRole;
  setOrganizationId: (id: string) => void;
  setTeamId: (id: string) => void;
};

const ActiveContext = createContext<ActiveContextType | undefined>(undefined);

// A escolha fica no navegador. useSyncExternalStore devolve null no servidor e na
// hidratação, então o servidor e o navegador renderizam igual antes de ler o valor.
const listeners = new Set<() => void>();
const fallback: Record<string, string | null> = {};

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? fallback[key] ?? null;
  } catch {
    return fallback[key] ?? null;
  }
}

function write(key: string, value: string | null) {
  fallback[key] = value;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Sem armazenamento (janela privada): a escolha vale só nesta aba.
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

function notify() {
  listeners.forEach((listener) => listener());
}

export function ActiveContextProvider({
  organizations,
  teams: allTeams,
  role,
  children,
}: {
  organizations: OrganizationOption[];
  teams: TeamOption[];
  role: OrgRole;
  children: ReactNode;
}) {
  const orgId = useSyncExternalStore(subscribe, () => read(ORG_KEY), () => null);
  const teamId = useSyncExternalStore(subscribe, () => read(TEAM_KEY), () => null);

  // Sem escolha guardada (ou com algo que não existe mais), vale o primeiro da lista.
  const organization = organizations.find((item) => item.id === orgId) ?? organizations[0] ?? null;
  const teams = organization ? teamsOfOrganization(allTeams, organization.id) : [];
  const team = teams.find((item) => item.id === teamId) ?? teams[0] ?? null;

  function setOrganizationId(id: string) {
    write(ORG_KEY, id);
    write(TEAM_KEY, null);
    notify();
  }

  function setTeamId(id: string) {
    write(TEAM_KEY, id);
    notify();
  }

  return (
    <ActiveContext.Provider
      value={{ organizations, organization, teams, team, role, setOrganizationId, setTeamId }}
    >
      {children}
    </ActiveContext.Provider>
  );
}

export function useActiveContext() {
  const context = useContext(ActiveContext);
  if (!context) throw new Error("useActiveContext must be used within ActiveContextProvider");
  return context;
}

type SwitcherProps = { className?: string; id?: string };

/** Troca de organização; com uma só, mostra apenas o nome. */
export function OrganizationSwitcher({ className = "", id = "org-switcher" }: SwitcherProps) {
  const { organizations, organization, setOrganizationId } = useActiveContext();
  if (!organization) return null;

  return (
    <div className={`context-switcher ${className}`}>
      <label htmlFor={id}>Organização</label>
      {organizations.length > 1 ? (
        <select id={id} value={organization.id} onChange={(e) => setOrganizationId(e.target.value)}>
          {organizations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      ) : (
        <strong id={id}>{organization.name}</strong>
      )}
    </div>
  );
}

/** Troca de time da organização ativa, agrupado por modalidade. */
export function TeamSwitcher({ className = "", id = "team-switcher" }: SwitcherProps) {
  const { teams, team, setTeamId } = useActiveContext();
  if (!team) return null;

  return (
    <div className={`context-switcher ${className}`}>
      <label htmlFor={id}>Time</label>
      {teams.length > 1 ? (
        <select id={id} value={team.id} onChange={(e) => setTeamId(e.target.value)}>
          {groupTeamsBySport(teams).map((group) => (
            <optgroup key={group.sportKey} label={getSport(group.sportKey).name}>
              {group.teams.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.category}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      ) : (
        <strong id={id}>
          {team.name} · {getSport(team.sportKey).name}
        </strong>
      )}
    </div>
  );
}
