import type { OrgRole } from "@/lib/teams";

export const ROLE_LABEL: Record<OrgRole, string> = {
  admin: "Administração",
  manager: "Gestor",
  coach: "Técnico",
  player: "Jogador",
};
