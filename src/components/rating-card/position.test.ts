import { describe, expect, it } from "vitest";
import { positionLabel } from "@/components/rating-card/position";
import { getSport } from "@/sports/registry";

describe("positionLabel", () => {
  it("usa o nome da posição do esporte", () => {
    expect(positionLabel(getSport("volleyball"), "outside")).toBe("Ponteiro");
    expect(positionLabel(getSport("basketball"), "center")).toBe("Pivô");
  });

  it("a mesma chave pode ter nomes diferentes por esporte", () => {
    expect(positionLabel(getSport("futsal"), "goalkeeper")).toBe("Goleiro");
    expect(positionLabel(getSport("football_field"), "defender")).toBe("Zagueiro");
  });

  it("posição desconhecida, nula ou de outro esporte vira Atleta", () => {
    expect(positionLabel(getSport("volleyball"), "center")).toBe("Atleta");
    expect(positionLabel(getSport("volleyball"), null)).toBe("Atleta");
    expect(positionLabel(getSport("volleyball"))).toBe("Atleta");
  });
});
