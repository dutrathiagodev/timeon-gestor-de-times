import type { SportKey } from "@/sports/types";

export type OrgRole = "admin" | "manager" | "coach" | "player";

export type OrganizationOption = {
  id: string;
  name: string;
};

export type TeamOption = {
  id: string;
  organizationId: string;
  name: string;
  sportKey: SportKey;
  category: string;
  ageGroup?: string;
};

/**
 * Organizações do usuário. Hoje só existe a do modelo antigo (vôlei); quando as telas
 * passarem a ler o banco novo (cards 00042 e 00043), estas funções devolvem os dados reais.
 */
export function getOrganizationOptions(): OrganizationOption[] {
  return [{ id: "falcons", name: "Falcons" }];
}

export function getTeamOptions(): TeamOption[] {
  return [
    { id: "volei", organizationId: "falcons", name: "Vôlei", sportKey: "volleyball", category: "Principal" },
  ];
}

/** Papel do usuário na organização ativa; até o login ler o banco novo, vale o de administração. */
export function getUserRole(): OrgRole {
  return "admin";
}

/** Só administração, gestor e técnico criam time (decisão do dono, 2026-11-02). */
export function canCreateTeam(role: OrgRole): boolean {
  return role === "admin" || role === "manager" || role === "coach";
}

/** Quem dá acesso a outras pessoas: administração e gestor. */
export function canManageAccess(role: OrgRole): boolean {
  return role === "admin" || role === "manager";
}

export function teamsOfOrganization(teams: TeamOption[], organizationId: string): TeamOption[] {
  return teams.filter((team) => team.organizationId === organizationId);
}

/** Times agrupados por modalidade, na ordem em que cada modalidade aparece primeiro. */
export function groupTeamsBySport(teams: TeamOption[]): { sportKey: SportKey; teams: TeamOption[] }[] {
  const groups = new Map<SportKey, TeamOption[]>();
  for (const team of teams) groups.set(team.sportKey, [...(groups.get(team.sportKey) ?? []), team]);
  return [...groups].map(([sportKey, list]) => ({ sportKey, teams: list }));
}
