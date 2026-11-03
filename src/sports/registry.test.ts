import { describe, expect, it } from "vitest";
import { SPORT_KEYS, getSport, isSportKey, sports } from "@/sports/registry";

describe("registro de esportes", () => {
  it("expõe os seis esportes do plano", () => {
    expect(SPORT_KEYS.sort()).toEqual(
      ["basketball", "football_field", "football_society", "futsal", "handball", "volleyball"],
    );
  });

  it("isSportKey só aceita chaves do registro", () => {
    expect(isSportKey("futsal")).toBe(true);
    expect(isSportKey("toString")).toBe(false);
    expect(isSportKey("tenis")).toBe(false);
    expect(isSportKey(undefined)).toBe(false);
  });

  it("futsal, society e campo compartilham a família football", () => {
    expect(getSport("futsal").family).toBe("football");
    expect(getSport("football_society").family).toBe("football");
    expect(getSport("football_field").family).toBe("football");
  });

  describe.each(Object.values(sports))("$name", (sport) => {
    it("chave do módulo bate com a do registro", () => {
      expect(sports[sport.key]).toBe(sport);
    });

    it("não repete posições nem estatísticas", () => {
      const positions = sport.positions.map((p) => p.key);
      const stats = sport.stats.map((s) => s.key);
      expect(new Set(positions).size).toBe(positions.length);
      expect(new Set(stats).size).toBe(stats.length);
    });

    it("estatísticas par apontam uma para a outra", () => {
      for (const stat of sport.stats.filter((s) => s.pairKey)) {
        const pair = sport.stats.find((s) => s.key === stat.pairKey);
        expect(pair?.pairKey).toBe(stat.key);
      }
    });

    it("formações têm slots únicos, dentro do campo e com posição válida", () => {
      const positions = new Set(sport.positions.map((p) => p.key));
      expect(sport.formations.length).toBeGreaterThan(0);
      for (const formation of sport.formations) {
        const keys = formation.slots.map((s) => s.key);
        expect(new Set(keys).size).toBe(keys.length);
        for (const slot of formation.slots) {
          expect(slot.x).toBeGreaterThanOrEqual(0);
          expect(slot.x).toBeLessThanOrEqual(100);
          expect(slot.y).toBeGreaterThanOrEqual(0);
          expect(slot.y).toBeLessThanOrEqual(100);
          if (slot.positionHint) expect(positions.has(slot.positionHint)).toBe(true);
        }
      }
    });

    it("slots ficam a 7% ou mais da borda, para o botão do atleta não vazar do campo", () => {
      for (const formation of sport.formations) {
        for (const slot of formation.slots) {
          for (const value of [slot.x, slot.y]) {
            expect(value).toBeGreaterThanOrEqual(7);
            expect(value).toBeLessThanOrEqual(93);
          }
        }
      }
    });

    it("nenhum par de slots se sobrepõe num campo de celular (335 px de largura)", () => {
      // Proporções do CSS em globals.css: vôlei 5:4, demais 4:5. Botão = 14% da largura, entre 46 e 68 px.
      const width = 335;
      const height = sport.family === "volleyball" ? (width * 4) / 5 : (width * 5) / 4;
      const token = Math.min(68, Math.max(46, width * 0.14));
      for (const formation of sport.formations) {
        const points = formation.slots.map((slot) => ({
          key: slot.key,
          x: (slot.x / 100) * width,
          y: (slot.y / 100) * height,
        }));
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            const distance = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
            expect(
              distance,
              `${formation.key}: ${points[i].key} e ${points[j].key}`,
            ).toBeGreaterThanOrEqual(token);
          }
        }
      }
    });

    it("cada formação escala exatamente os atletas em jogo (líbero à parte)", () => {
      for (const formation of sport.formations) {
        const onField = formation.slots.filter((s) => s.positionHint !== "libero");
        expect(onField).toHaveLength(sport.playersOnField);
      }
    });

    it("formações do mesmo esporte são distintas (desenho ou posições)", () => {
      const shapes = sport.formations.map((f) =>
        f.slots.map((s) => `${s.x},${s.y},${s.positionHint}`).join("|"),
      );
      expect(new Set(shapes).size).toBe(shapes.length);
    });
  });

  it("futebol de campo tem 4 formações com 11 em campo", () => {
    const field = getSport("football_field");
    expect(field.formations.map((f) => f.key)).toEqual(["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"]);
  });

  it("vôlei tem as rotações P1–P6 e o líbero", () => {
    const keys = getSport("volleyball").formations[0].slots.map((s) => s.key);
    expect(keys).toEqual(["P1", "P2", "P3", "P4", "P5", "P6", "L"]);
  });
});

describe("placar de vôlei", () => {
  const { score } = getSport("volleyball");
  const set = (us: number, them: number) => ({ us, them });

  it("aceita 3x0 e soma sets ganhos", () => {
    const sets = [set(25, 20), set(25, 23), set(25, 10)];
    expect(score.validate(sets)).toEqual([]);
    expect(score.final(sets)).toEqual({ us: 3, them: 0 });
  });

  it("aceita set decidido na vantagem (26x24) e tie-break de 15", () => {
    const sets = [set(26, 24), set(20, 25), set(25, 27), set(25, 22), set(15, 13)];
    expect(score.validate(sets)).toEqual([]);
    expect(score.final(sets)).toEqual({ us: 3, them: 2 });
  });

  it("rejeita 25x24 e 27x24 (sem 2 de diferença)", () => {
    for (const bad of [set(25, 24), set(27, 24)]) {
      const issues = score.validate([bad, set(25, 10), set(25, 10)]);
      expect(issues.map((i) => i.code)).toContain("set_invalid");
    }
  });

  it("tie-break vai a 15, não a 25", () => {
    const sets = [set(25, 20), set(20, 25), set(25, 20), set(20, 25), set(25, 20)];
    expect(score.validate(sets).map((i) => i.code)).toContain("set_invalid");
  });

  it("rejeita set depois da partida decidida e partida sem vencedor", () => {
    const extra = [set(25, 20), set(25, 20), set(25, 20), set(25, 20)];
    expect(score.validate(extra).map((i) => i.code)).toContain("after_decided");
    expect(score.validate([set(25, 20), set(25, 20)]).map((i) => i.code)).toEqual([
      "match_undecided",
    ]);
  });

  it("rejeita valores negativos ou fracionados", () => {
    expect(score.validate([set(-1, 25)])[0].code).toBe("invalid_value");
    expect(score.validate([set(25.5, 20)])[0].code).toBe("invalid_value");
  });
});

describe("placar por períodos", () => {
  it("futsal soma os dois tempos e aceita empate", () => {
    const { score } = getSport("futsal");
    const halves = [{ us: 2, them: 1 }, { us: 0, them: 1 }];
    expect(score.validate(halves)).toEqual([]);
    expect(score.final(halves)).toEqual({ us: 2, them: 2 });
  });

  it("exige todos os períodos regulamentares", () => {
    const { score } = getSport("handball");
    expect(score.validate([{ us: 10, them: 8 }]).map((i) => i.code)).toEqual(["periods_missing"]);
  });

  it("basquete não termina empatado e limita as prorrogações", () => {
    const { score } = getSport("basketball");
    const quarters = [
      { us: 20, them: 18 },
      { us: 15, them: 17 },
      { us: 18, them: 18 },
      { us: 20, them: 20 },
    ];
    expect(score.validate(quarters.map((q) => ({ ...q })))[0]?.code).toBe("draw_not_allowed");
    expect(score.validate([...quarters, { us: 8, them: 6 }])).toEqual([]);
    const tooMany = [...quarters, ...Array.from({ length: 5 }, () => ({ us: 1, them: 0 }))];
    expect(score.validate(tooMany).map((i) => i.code)).toContain("periods_exceeded");
  });
});
