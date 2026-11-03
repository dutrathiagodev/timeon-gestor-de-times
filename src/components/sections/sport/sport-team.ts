"use client";

import { useActiveContext } from "@/components/layout/active-context";
import { canCreateTeam } from "@/lib/teams";

/** Time ativo e se o papel pode editar o elenco (administração, gestor e técnico). */
export function useSportTeam() {
  const { team, role } = useActiveContext();
  return { team, canEdit: canCreateTeam(role) };
}
