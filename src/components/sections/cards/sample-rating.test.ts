import { describe, expect, it } from "vitest";
import { ratingTier } from "@/components/rating-card/tier";
import { SPORT_KEYS, getSport } from "@/sports/registry";
import { TIER_SAMPLES, sampleRating } from "./sample-rating";

describe("nota de exemplo da galeria", () => {
  it("cada amostra cai na variante certa", () => {
    for (const { tier, overall } of TIER_SAMPLES) expect(ratingTier(overall)).toBe(tier);
  });

  it("mantém as mesmas estatísticas da posição e todas dentro de 40 a 99", () => {
    for (const key of SPORT_KEYS) {
      const sport = getSport(key);
      for (const position of sport.positions) {
        const base = sport.rating({ totals: {}, games: 0, position: position.key });
        for (const { overall } of TIER_SAMPLES) {
          const sample = sampleRating(sport, position.key, overall);
          expect(Object.keys(sample.attributes).sort()).toEqual(Object.keys(base.attributes).sort());
          for (const value of Object.values(sample.attributes)) {
            expect(value).toBeGreaterThanOrEqual(40);
            expect(value).toBeLessThanOrEqual(99);
          }
        }
      }
    }
  });
});
