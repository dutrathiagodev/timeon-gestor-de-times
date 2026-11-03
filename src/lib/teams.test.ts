import { describe, expect, it } from "vitest";
import {
  canCreateTeam,
  canManageAccess,
  groupTeamsBySport,
  teamsOfOrganization,
  type TeamOption,
} from "@/lib/teams";

const team = (id: string, organizationId: string, sportKey: TeamOption["sportKey"]): TeamOption => ({
  id,
  organizationId,
  name: id,
  sportKey,
  category: "Principal",
});

describe("times e organizações", () => {
  it("só administração, gestor e técnico criam time", () => {
    expect(canCreateTeam("admin")).toBe(true);
    expect(canCreateTeam("manager")).toBe(true);
    expect(canCreateTeam("coach")).toBe(true);
    expect(canCreateTeam("player")).toBe(false);
  });

  it("só administração e gestor dão acesso a outras pessoas", () => {
    expect(canManageAccess("admin")).toBe(true);
    expect(canManageAccess("manager")).toBe(true);
    expect(canManageAccess("coach")).toBe(false);
    expect(canManageAccess("player")).toBe(false);
  });

  it("lista só os times da organização escolhida", () => {
    const teams = [team("a", "o1", "futsal"), team("b", "o2", "futsal"), team("c", "o1", "volleyball")];
    expect(teamsOfOrganization(teams, "o1").map((t) => t.id)).toEqual(["a", "c"]);
    expect(teamsOfOrganization(teams, "o3")).toEqual([]);
  });

  it("agrupa por modalidade na ordem em que aparecem", () => {
    const teams = [team("a", "o", "futsal"), team("b", "o", "volleyball"), team("c", "o", "futsal")];
    const groups = groupTeamsBySport(teams);
    expect(groups.map((g) => g.sportKey)).toEqual(["futsal", "volleyball"]);
    expect(groups[0].teams.map((t) => t.id)).toEqual(["a", "c"]);
  });
});
