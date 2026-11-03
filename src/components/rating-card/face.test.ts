import { describe, expect, it } from "vitest";
import { faceAttributes, MAX_FACE_STATS } from "@/components/rating-card/face";
import { SPORT_KEYS, getSport } from "@/sports/registry";

const shorts = (sportKey: Parameters<typeof getSport>[0], position: string) => {
  const sport = getSport(sportKey);
  const rating = sport.rating({ totals: {}, games: 0, position });
  return faceAttributes(sport, rating, position).map((attribute) => attribute.short);
};

describe("estatísticas da face do card", () => {
  it("nenhuma posição de nenhum esporte passa de seis estatísticas nem fica sem nenhuma", () => {
    for (const key of SPORT_KEYS) {
      const sport = getSport(key);
      for (const position of sport.positions) {
        const count = shorts(key, position.key).length;
        expect(count, `${key}/${position.key}`).toBeGreaterThan(0);
        expect(count, `${key}/${position.key}`).toBeLessThanOrEqual(MAX_FACE_STATS);
      }
    }
  });

  it("goleiro de qualquer esporte não mostra ataque nem drible", () => {
    for (const key of ["futsal", "football_society", "football_field", "handball"] as const) {
      const list = shorts(key, "goalkeeper");
      expect(list[0]).toBe("GOL");
      for (const attack of ["FIN", "DRI", "ARR"]) expect(list, key).not.toContain(attack);
    }
  });

  it("líbero não tem saque, ataque nem bloqueio", () => {
    const list = shorts("volleyball", "libero");
    for (const hidden of ["SAQ", "ATQ", "BLQ"]) expect(list).not.toContain(hidden);
  });

  it("sem posição conhecida mostra o começo da lista do esporte", () => {
    const sport = getSport("basketball");
    const rating = sport.rating({ totals: {}, games: 0, position: null });
    expect(faceAttributes(sport, rating, null).length).toBeLessThanOrEqual(MAX_FACE_STATS);
  });
});
