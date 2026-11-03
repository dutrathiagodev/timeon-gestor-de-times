import { describe, expect, it } from "vitest";
import { getSport } from "@/sports/registry";
import { MAX_ROSTER, buildAthlete, validateNewAthlete } from "./roster-rules";

const futsal = getSport("futsal");
const roster = [{ id: "a", name: "Ana", positionKey: "ala", shirtNumber: 10 }];
const ok = { name: "Bia Lima", positionKey: "pivo", shirtNumber: "9" };

describe("atleta novo no time", () => {
  it("aceita nome, posição do esporte e camisa livre", () => {
    expect(validateNewAthlete(futsal, roster, ok)).toBeNull();
  });

  it("a posição tem de ser do esporte do time", () => {
    expect(validateNewAthlete(futsal, roster, { ...ok, positionKey: "libero" })).toMatch(/posição/);
    expect(validateNewAthlete(getSport("volleyball"), roster, { ...ok, positionKey: "libero" })).toBeNull();
  });

  it("recusa nome curto ou longo demais", () => {
    expect(validateNewAthlete(futsal, roster, { ...ok, name: " A " })).toMatch(/nome/i);
    expect(validateNewAthlete(futsal, roster, { ...ok, name: "x".repeat(61) })).toMatch(/60/);
  });

  it("camisa repetida no time é recusada; camisa vazia vale", () => {
    expect(validateNewAthlete(futsal, roster, { ...ok, shirtNumber: "10" })).toMatch(/camisa 10/);
    expect(validateNewAthlete(futsal, roster, { ...ok, shirtNumber: "" })).toBeNull();
  });

  it("camisa fora de 0 a 99 ou quebrada é recusada", () => {
    for (const shirt of ["100", "-1", "1.5", "abc"]) {
      expect(validateNewAthlete(futsal, roster, { ...ok, shirtNumber: shirt }), shirt).toMatch(/0 a 99/);
    }
  });

  it("elenco cheio não aceita mais", () => {
    const full = Array.from({ length: MAX_ROSTER }, (_, i) => ({ id: String(i), name: "N", shirtNumber: null }));
    expect(validateNewAthlete(futsal, full, ok)).toMatch(/máximo/);
  });

  it("monta o atleta com o nome limpo", () => {
    expect(buildAthlete({ ...ok, name: "  Bia   Lima " }, "id1")).toEqual({
      id: "id1",
      name: "Bia Lima",
      positionKey: "pivo",
      shirtNumber: 9,
    });
    expect(buildAthlete({ ...ok, shirtNumber: "" }, "id2").shirtNumber).toBeNull();
  });
});
