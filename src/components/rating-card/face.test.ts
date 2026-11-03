import { describe, expect, it } from "vitest";
import { MAX_FACE_STATS, faceStats } from "@/components/rating-card/face";
import { SPORT_KEYS, getSport } from "@/sports/registry";

const shorts = (sportKey: Parameters<typeof getSport>[0], position: string) => {
  const sport = getSport(sportKey);
  const rating = sport.rating({ totals: {}, games: 0, position });
  return faceStats(sport, rating, position).map((stat) => stat.short);
};

describe("estatísticas da face do card", () => {
  it("toda posição de todo esporte mostra exatamente seis, sem repetir sigla", () => {
    for (const key of SPORT_KEYS) {
      for (const position of getSport(key).positions) {
        const list = shorts(key, position.key);
        expect(list.length, `${key}/${position.key}`).toBeGreaterThanOrEqual(6);
        expect(list.length, `${key}/${position.key}`).toBeLessThanOrEqual(MAX_FACE_STATS);
        expect(new Set(list).size, `${key}/${position.key}`).toBe(list.length);
      }
    }
  });

  it("todas as posições têm seis estatísticas", () => {
    for (const key of SPORT_KEYS) {
      for (const position of getSport(key).positions) {
        expect(shorts(key, position.key), `${key}/${position.key}`).toHaveLength(6);
      }
    }
  });

  it("goleiro de qualquer esporte começa por GOL e não mostra ataque nem drible", () => {
    for (const key of ["futsal", "football_society", "football_field", "handball"] as const) {
      const list = shorts(key, "goalkeeper");
      expect(list[0]).toBe("GOL");
      for (const attack of ["FIN", "DRI", "ARR", "VEL"]) expect(list, key).not.toContain(attack);
    }
  });

  it("líbero não tem saque, ataque nem bloqueio", () => {
    const list = shorts("volleyball", "libero");
    for (const hidden of ["SAQ", "ATQ", "BLQ"]) expect(list).not.toContain(hidden);
  });

  it("posições diferentes mostram estatísticas diferentes", () => {
    expect(shorts("football_field", "defender")).not.toEqual(shorts("football_field", "striker"));
    expect(shorts("basketball", "point_guard")).not.toEqual(shorts("basketball", "center"));
    expect(shorts("handball", "wing")).not.toEqual(shorts("handball", "pivot"));
  });

  it("estatística que a nota calcula acompanha a nota; as demais crescem junto com ela", () => {
    const sport = getSport("football_field");
    const base = sport.rating({ totals: {}, games: 0, position: "striker" });
    const hot = sport.rating({ totals: { goals: 6, shots_on: 10 }, games: 3, position: "striker" });
    const baseStats = Object.fromEntries(faceStats(sport, base, "striker").map((s) => [s.short, s.value]));
    const hotStats = Object.fromEntries(faceStats(sport, hot, "striker").map((s) => [s.short, s.value]));
    expect(hotStats.FIN).toBe(hot.attributes.finishing);
    expect(hotStats.MOV).toBeGreaterThan(baseStats.MOV);
  });

  it("valores sempre entre 40 e 99", () => {
    for (const key of SPORT_KEYS) {
      const sport = getSport(key);
      for (const position of sport.positions) {
        for (const overall of [40, 62, 99]) {
          const rating = { overall, attributes: sport.rating({ totals: {}, games: 0, position: position.key }).attributes };
          for (const stat of faceStats(sport, rating, position.key)) {
            expect(stat.value).toBeGreaterThanOrEqual(40);
            expect(stat.value).toBeLessThanOrEqual(99);
          }
        }
      }
    }
  });

  it("posição desconhecida cai nas estatísticas da nota, no máximo seis", () => {
    const sport = getSport("basketball");
    const rating = sport.rating({ totals: {}, games: 0, position: null });
    const list = faceStats(sport, rating, null);
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(MAX_FACE_STATS);
  });
});
