import { describe, expect, it } from "vitest";
import {
  CUSTOM_FORMATION_KEY,
  type Lineup,
  emptyLineup,
  filledCount,
  lineupIssues,
  moveSlot,
  placeAthlete,
  removeAthlete,
  reseatLineup,
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
  const initial: Lineup = {
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

describe("lineup: alertas", () => {
  const volleyball = getSport("volleyball");
  const v1 = volleyball.formations[0];
  const codes = (issues: { code: string }[]) => issues.map((i) => i.code);

  it("sem alertas quando cada atleta está na posição do slot", () => {
    const lineup = { ...emptyLineup(v1), P1: "s", P2: "o1", L: "l" };
    const athletes = [
      { id: "s", positionKey: "setter" },
      { id: "o1", positionKey: "outside" },
      { id: "l", positionKey: "libero" },
    ];
    expect(lineupIssues(volleyball, v1, lineup, athletes)).toEqual([]);
  });

  it("avisa posição trocada e diz quem joga de quê", () => {
    const lineup = { ...emptyLineup(v1), P1: "x" };
    const [issue] = lineupIssues(volleyball, v1, lineup, [{ id: "x", positionKey: "middle" }]);
    expect(issue.code).toBe("position_mismatch");
    expect(issue.slotKey).toBe("P1");
    expect(issue.message).toContain("Central");
    expect(issue.message).toContain("Levantador");
  });

  it("líbero na rede é alerta próprio, no fundo não", () => {
    const athletes = [{ id: "l", positionKey: "libero" }];
    for (const front of ["P2", "P3", "P4"]) {
      const lineup = { ...emptyLineup(v1), [front]: "l" };
      expect(codes(lineupIssues(volleyball, v1, lineup, athletes))).toEqual(["libero_front_row"]);
    }
    for (const back of ["P1", "P5", "P6", "L"]) {
      const lineup = { ...emptyLineup(v1), [back]: "l" };
      expect(lineupIssues(volleyball, v1, lineup, athletes)).toEqual([]);
    }
  });

  it("não-líbero na vaga do líbero", () => {
    const lineup = { ...emptyLineup(v1), L: "x" };
    const issues = lineupIssues(volleyball, v1, lineup, [{ id: "x", positionKey: "outside" }]);
    expect(codes(issues)).toEqual(["libero_slot_requires_libero"]);
  });

  it("checkPositionHints desligado (rotações 2 a 6) ignora a posição, mas mantém a regra do líbero", () => {
    const lineup = { ...emptyLineup(v1), P1: "x", P2: "l" };
    const athletes = [
      { id: "x", positionKey: "middle" },
      { id: "l", positionKey: "libero" },
    ];
    const issues = lineupIssues(volleyball, v1, lineup, athletes, { checkPositionHints: false });
    expect(codes(issues)).toEqual(["libero_front_row"]);
  });

  it("atleta sem posição, desconhecido ou slot vazio não geram alerta", () => {
    const lineup = { ...emptyLineup(v1), P1: "a", P2: "fantasma" };
    const athletes = [{ id: "a", positionKey: null }, { id: "b" }];
    expect(lineupIssues(volleyball, v1, lineup, athletes)).toEqual([]);
  });

  it("funciona no futebol de campo", () => {
    const field = getSport("football_field");
    const f = field.formations[0];
    const lineup = { ...emptyLineup(f), gk: "g", r3_2: "g2" };
    const athletes = [
      { id: "g", positionKey: "striker" },
      { id: "g2", positionKey: "striker" },
    ];
    const issues = lineupIssues(field, f, lineup, athletes);
    expect(issues.map((i) => i.slotKey)).toEqual(["gk"]);
    expect(issues[0].message).toContain("Centroavante");
  });
});

describe("formações e troca de esquema", () => {
  const futsal = getSport("futsal");
  const field = getSport("football_field");
  const hints = (f: (typeof futsal.formations)[number]) => f.slots.map((slot) => slot.positionHint);

  it("futsal abre em 1-2-1: goleiro, fixo, dois alas e pivô", () => {
    expect(futsal.formations[0].label).toBe("1-2-1");
    expect(hints(futsal.formations[0]).sort()).toEqual(["ala", "ala", "fixo", "goalkeeper", "pivo"]);
  });

  it("futebol abre em 4-3-3 com dois laterais e dois zagueiros", () => {
    const f = field.formations[0];
    expect(f.label).toBe("4-3-3");
    expect(f.slots).toHaveLength(11);
    expect(hints(f).filter((h) => h === "fullback")).toHaveLength(2);
    expect(hints(f).filter((h) => h === "defender")).toHaveLength(2);
    const defense = f.slots.filter((slot) => slot.y === 72);
    expect(defense.map((slot) => slot.positionHint)).toEqual(["fullback", "defender", "defender", "fullback"]);
  });

  it("todo slot tem chave única e posição que existe na modalidade", () => {
    for (const sport of [futsal, field, getSport("football_society")]) {
      for (const f of sport.formations) {
        const slotKeys = f.slots.map((slot) => slot.key);
        expect(new Set(slotKeys).size).toBe(slotKeys.length);
        for (const slot of f.slots) {
          expect(sport.positions.some((p) => p.key === slot.positionHint)).toBe(true);
        }
        expect(f.slots).toHaveLength(sport.playersOnField);
      }
    }
  });

  it("trocar de esquema mantém cada atleta na mesma posição e manda o excedente para o banco", () => {
    const [f433, f442] = field.formations;
    let lineup = emptyLineup(f433);
    f433.slots.forEach((slot, i) => (lineup = placeAthlete(lineup, slot.key, `a${i}`)));
    const next = reseatLineup(f433, f442, lineup);
    expect(filledCount(next)).toBe(11);
    const hintOfAthlete = (formationUsed: typeof f433, l: Lineup, id: string) =>
      formationUsed.slots.find((slot) => slot.key === slotOf(l, id))?.positionHint;
    expect(hintOfAthlete(f442, next, "a1")).toBe("fullback");
    expect(hintOfAthlete(f442, next, "a0")).toBe("goalkeeper");
    const fewer = reseatLineup(f433, futsal.formations[0], lineup);
    expect(filledCount(fewer)).toBe(5);
    expect(slotOf(fewer, "a0")).toBe("gk");
  });
});

describe("esquema personalizado", () => {
  const field = getSport("football_field");
  const base = field.formations[0];

  it("mover uma posição cria o Personalizado e mantém as chaves dos slots", () => {
    const moved = moveSlot(base, "gk", 40, 80);
    expect(moved.key).toBe(CUSTOM_FORMATION_KEY);
    expect(moved.label).toBe("Personalizado");
    expect(moved.slots.map((s) => s.key)).toEqual(base.slots.map((s) => s.key));
    expect(moved.slots.find((s) => s.key === "gk")).toMatchObject({ x: 40, y: 80 });
    expect(base.slots.find((s) => s.key === "gk")).toMatchObject({ x: 50, y: 92 });
  });

  it("não deixa a posição sair do campo", () => {
    const moved = moveSlot(base, "gk", -20, 140);
    expect(moved.slots.find((s) => s.key === "gk")).toMatchObject({ x: 7, y: 93 });
  });

  it("slot que não existe deixa o esquema como está", () => {
    expect(moveSlot(base, "nada", 10, 10)).toBe(base);
  });
});
