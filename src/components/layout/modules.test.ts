import { describe, expect, it } from "vitest";
import { MODULES, modulesFor } from "./modules";

const labels = (role: Parameters<typeof modulesFor>[0]) => modulesFor(role).map((item) => item.label);

describe("módulos por papel", () => {
  it("jogador não vê presença, acesso, modalidades nem relatórios", () => {
    const player = labels("player");
    for (const hidden of ["Presença", "Gestão de acesso", "Modalidades", "Relatórios"]) {
      expect(player).not.toContain(hidden);
    }
    expect(player).toContain("Escalação");
  });

  it("técnico vê presença e relatórios, mas não acesso nem modalidades", () => {
    const coach = labels("coach");
    expect(coach).toContain("Presença");
    expect(coach).toContain("Relatórios");
    expect(coach).not.toContain("Gestão de acesso");
    expect(coach).not.toContain("Modalidades");
  });

  it("administração e gestor veem tudo", () => {
    expect(labels("admin")).toHaveLength(MODULES.length);
    expect(labels("manager")).toHaveLength(MODULES.length);
  });

  it("módulo sem endereço é o que ainda não existe, e nenhum nome se repete", () => {
    const names = MODULES.map((item) => item.label);
    expect(new Set(names).size).toBe(names.length);
    expect(MODULES.filter((item) => item.href === null).map((item) => item.label)).toContain("Presença");
  });
});
