import { describe, expect, it } from "vitest";
import { ratingTier } from "@/components/rating-card/tier";

describe("ratingTier", () => {
  it.each([
    [99, "elite"],
    [90, "elite"],
    [89, "gold"],
    [80, "gold"],
    [79, "silver"],
    [70, "silver"],
    [69, "bronze"],
    [40, "bronze"],
  ])("nota %i é %s", (overall, tier) => {
    expect(ratingTier(overall)).toBe(tier);
  });
});
