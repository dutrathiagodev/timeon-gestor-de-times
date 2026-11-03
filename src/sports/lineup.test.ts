import { describe, expect, it } from "vitest";
import {
  emptyLineup,
  filledCount,
  placeAthlete,
  removeAthlete,
  rotateVolleyball,
  slotOf,
  volleyballRotations,
} from "@/sports/lineup";
import { getSport } from "@/sports/registry";

const formation = getSport("futsal").formations[0];
const keys = formation.slots.map((slot) => slot.key);

describe("lineup: colocar e remover", () => {
  it("começa vazia, com todos os slots da formação", () => {
    const lineup = emptyLineup(formation);
    expect(Object.keys(lineup)).toEqual(keys);
    expect(filledCount(lineup)).toBe(0);
  });

  it("coloca um atleta do banco em slot vazio", () => {
    const lineup = placeAthlete(emptyLineup(formation), keys[0], "a");
    expect(lineup[keys[0]]).toBe("a");
    expect(filledCount(lineup)).toBe(1);
    expect(slotOf(lineup, "a")).toBe(keys[0]);
  });

  it("atleta do banco sobre slot ocupado desloca quem estava (volta ao banco)", () => {
    let lineup = placeAthlete(emptyLineup(formation), keys[0], "a");
    lineup = placeAthlete(lineup, keys[0], "b");
    expect(lineup[keys[0]]).toBe("b");
    expect(slotOf(lineup, "a")).toBeNull();
    expect(filledCount(lineup)).toBe(1);
  });

  it("atleta que já estava em campo troca de lugar com o ocupante", () => {
    let lineup = placeAthlete(emptyLineup(formation), keys[0], "a");
    lineup = placeAthlete(lineup, keys[1], "b");
    lineup = placeAthlete(lineup, keys[1], "a");
    expect(lineup[keys[1]]).toBe("a");
    expect(lineup[keys[0]]).toBe("b");
  });

  it("mover para um slot vazio libera o slot de origem", () => {
    let lineup = placeAthlete(emptyLineup(formation), keys[0], "a");
    lineup = placeAthlete(lineup, keys[2], "a");
    expect(lineup[keys[0]]).toBeNull();
    expect(lineup[keys[2]]).toBe("a");
    expect(filledCount(lineup)).toBe(1);
  });

  it("nunca repete o mesmo atleta em dois slots", () => {
    let lineup = emptyLineup(formation);
    for (const key of keys) lineup = placeAthlete(lineup, key, "a");
    expect(Object.values(lineup).filter((id) => id === "a")).toHaveLength(1);
  });

  it("colocar no mesmo slot é no-op e devolve o mesmo objeto", () => {
    const lineup = placeAthlete(emptyLineup(formation), keys[0], "a");
    expect(placeAthlete(lineup, keys[0], "a")).toBe(lineup);
  });

  it("slot inexistente não altera a escalação", () => {
    const lineup = emptyLineup(formation);
    expect(placeAthlete(lineup, "nao-existe", "a")).toBe(lineup);
  });

  it("não muda a escalação original", () => {
    const lineup = emptyLineup(formation);
    placeAthlete(lineup, keys[0], "a");
    expect(filledCount(lineup)).toBe(0);
  });

  it("remove o atleta e ignora quem não está em campo", () => {
    const lineup = placeAthlete(emptyLineup(formation), keys[0], "a");
    expect(removeAthlete(lineup, "a")[keys[0]]).toBeNull();
    expect(removeAthlete(lineup, "z")).toBe(lineup);
  });
});

describe("lineup: rotações do vôlei", () => {
  const volleyball = getSport("volleyball");
  const initial = {
    ...emptyLineup(volleyball.formations[0]),
    P1: "setter",
    P2: "outside1",
    P3: "middle1",
    P4: "opposite",
    P5: "outside2",
    P6: "middle2",
    L: "libero",
  };

  it("quem está em P2 passa para P1, e P1 vai para P6", () => {
    const next = rotateVolleyball(initial);
    expect(next.P1).toBe("outside1");
    expect(next.P6).toBe("setter");
    expect(next.P5).toBe("middle2");
    expect(next.P4).toBe("outside2");
    expect(next.P3).toBe("opposite");
    expect(next.P2).toBe("middle1");
  });

  it("o líbero não rotaciona", () => {
    expect(rotateVolleyball(initial).L).toBe("libero");
  });

  it("seis rotações voltam à escalação inicial", () => {
    let lineup = initial;
    for (let i = 0; i < 6; i++) lineup = rotateVolleyball(lineup);
    expect(lineup).toEqual(initial);
  });

  it("volleyballRotations devolve 6 escalações distintas, a primeira é a inicial", () => {
    const rotations = volleyballRotations(initial);
    expect(rotations).toHaveLength(6);
    expect(rotations[0]).toBe(initial);
    expect(new Set(rotations.map((r) => JSON.stringify(r))).size).toBe(6);
  });

  it("o levantador percorre todas as posições ao longo das rotações", () => {
    const places = volleyballRotations(initial).map((r) => slotOf(r, "setter"));
    expect(places).toEqual(["P1", "P6", "P5", "P4", "P3", "P2"]);
  });

  it("slot vazio gira como vazio", () => {
    const withGap = { ...initial, P2: null };
    expect(rotateVolleyball(withGap).P1).toBeNull();
  });
});
