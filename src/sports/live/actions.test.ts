import { describe, expect, it } from "vitest";
import { liveActions } from "@/sports/live/actions";
import { getSport, sports } from "@/sports/registry";

describe.each(Object.values(sports))("lances de $name", (sport) => {
  const actions = liveActions(sport);

  it("tem chaves únicas", () => {
    const keys = actions.map((a) => a.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("só credita estatísticas que existem no esporte", () => {
    const known = new Set(sport.stats.map((s) => s.key));
    for (const action of actions) {
      for (const key of action.credits) expect(known.has(key), `${action.key} → ${key}`).toBe(true);
    }
  });

  it("toda estatística do esporte é alcançável por algum lance (exceto minutos jogados)", () => {
    const reachable = new Set(actions.flatMap((a) => a.credits));
    reachable.add("assists"); // creditada pela assistência de um lance de ponto
    const assistable = actions.some((a) => a.assist);
    for (const stat of sport.stats) {
      if (stat.key === "minutes_played") continue;
      if (stat.key === "assists" && !assistable) continue;
      expect(reachable.has(stat.key), stat.key).toBe(true);
    }
  });

  it("pontos têm valor positivo e lance do adversário nunca dá ponto a nós", () => {
    for (const action of actions) {
      if (action.points) expect(action.points.value).toBeGreaterThan(0);
      if (action.opponent && action.points) expect(action.points.side).toBe("them");
    }
  });

  it("assistência só existe em lance que dá ponto nosso", () => {
    for (const action of actions.filter((a) => a.assist)) {
      expect(action.points?.side).toBe("us");
    }
  });
});

describe("regra de pontuação por modalidade", () => {
  const value = (sportKey: Parameters<typeof getSport>[0], action: string) =>
    liveActions(getSport(sportKey)).find((a) => a.key === action)?.points;

  it("vôlei: rally de 1 ponto; erro nosso dá o ponto ao adversário", () => {
    expect(value("volleyball", "attack_kill")).toEqual({ side: "us", value: 1 });
    expect(value("volleyball", "serve_error")).toEqual({ side: "them", value: 1 });
    expect(value("volleyball", "our_error")).toEqual({ side: "them", value: 1 });
    expect(value("volleyball", "dig")).toBeUndefined();
  });

  it("basquete: cesta de 2, de 3 e lance livre de 1", () => {
    expect(value("basketball", "fg2_made")?.value).toBe(2);
    expect(value("basketball", "fg3_made")?.value).toBe(3);
    expect(value("basketball", "ft_made")?.value).toBe(1);
    expect(value("basketball", "fg3_miss")).toBeUndefined();
  });

  it("futebol e handebol: gol vale 1", () => {
    for (const key of ["futsal", "football_society", "football_field", "handball"] as const) {
      expect(value(key, "goal")).toEqual({ side: "us", value: 1 });
    }
  });

  it("só o futsal tem a falta do adversário", () => {
    const has = (key: Parameters<typeof getSport>[0]) =>
      liveActions(getSport(key)).some((a) => a.key === "opponent_foul");
    expect(has("futsal")).toBe(true);
    expect(has("football_field")).toBe(false);
  });

  it("assistência de basquete não vira contador solto (evita contar duas vezes)", () => {
    expect(liveActions(getSport("basketball")).some((a) => a.key === "assists")).toBe(false);
  });
});
