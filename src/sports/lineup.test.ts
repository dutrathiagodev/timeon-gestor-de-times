import { describe, expect, it } from "vitest";
import {
  emptyLineup,
  filledCount,
  placeAthlete,
  removeAthlete,
  slotOf,
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
