import { describe, expect, it } from "vitest";
import { getPlayerRatings, type PerformanceRecord } from "@/lib/volleyball";
import { getSport, sports } from "@/sports/registry";

const OLD_POSITIONS = {
  LEVANTADOR: "setter",
  LIBERO: "libero",
  CENTRAL: "middle",
  OPOSTO: "opposite",
  PONTEIRO: "outside",
} as const;

/** Mesmos campos da tabela `estatisticas_individuais`, nas chaves novas. */
const FIELD_MAP: Record<string, string> = {
  passe_a: "pass_a",
  passe_b: "pass_b",
  passe_c: "pass_c",
  toque_bom: "set_good",
  toque_medio: "set_ok",
  toque_ruim: "set_bad",
  saque_ace: "serve_ace",
  saque_bom: "serve_good",
  saque_erro: "serve_error",
  ataque_ponto: "attack_kill",
  ataque_medio: "attack_ok",
  ataque_erro: "attack_error",
  bloqueio_ponto: "block_point",
  bloqueio_medio: "block_ok",
  bloqueio_erro: "block_error",
  nocao_boa: "reading_good",
  nocao_media: "reading_ok",
  nocao_ruim: "reading_bad",
  pulo_bom: "jump_good",
  pulo_medio: "jump_ok",
  pulo_ruim: "jump_bad",
};

const ATTRIBUTE_MAP = {
  passe: "pass",
  toque: "set",
  saque: "serve",
  ataque: "attack",
  bloqueio: "block",
  nocao: "reading",
  pulo: "jump",
} as const;

const record = (values: Record<string, number>): PerformanceRecord => ({
  id: "r",
  evento_id: "e",
  jogador_id: "j",
  ...values,
});

describe("OVR do vôlei = nota de hoje", () => {
  const cases: Record<string, PerformanceRecord[]> = {
    "sem jogos": [],
    "jogo bom": [
      record({ passe_a: 12, passe_c: 1, toque_bom: 8, toque_ruim: 1, saque_ace: 3, saque_bom: 5, saque_erro: 2 }),
      record({ ataque_ponto: 9, ataque_erro: 2, bloqueio_ponto: 4, bloqueio_erro: 1, pulo_bom: 3 }),
    ],
    "jogo ruim": [
      record({ passe_a: 1, passe_c: 14, saque_erro: 9, ataque_erro: 12, nocao_ruim: 7, pulo_ruim: 6 }),
    ],
    "extremos": [record({ passe_a: 500, ataque_ponto: 500, bloqueio_erro: 500, saque_erro: 500 })],
  };

  for (const [oldKey, newKey] of Object.entries(OLD_POSITIONS)) {
    for (const [name, records] of Object.entries(cases)) {
      it(`${oldKey}, ${name}`, () => {
        const old = getPlayerRatings({ posicao: oldKey }, records);
        const totals: Record<string, number> = {};
        for (const rec of records) {
          for (const [from, to] of Object.entries(FIELD_MAP)) {
            const value = (rec as Record<string, unknown>)[from];
            if (typeof value === "number") totals[to] = (totals[to] ?? 0) + value;
          }
        }
        const now = getSport("volleyball").rating({
          totals,
          games: records.length,
          position: newKey,
        });
        expect(now.overall).toBe(old.overall);
        for (const [from, to] of Object.entries(ATTRIBUTE_MAP)) {
          expect(now.attributes[to]).toBe(old[from as keyof typeof ATTRIBUTE_MAP]);
        }
      });
    }
  }
});

describe("OVR de futebol", () => {
  const futsal = getSport("futsal");

  it("sem jogos devolve a base da posição", () => {
    const pivo = futsal.rating({ totals: {}, games: 0, position: "pivo" });
    expect(pivo.attributes).toEqual({
      finishing: 78,
      passing: 62,
      dribbling: 66,
      defense: 55,
      physical: 74,
    });
    expect(pivo.overall).toBe(67);
  });

  it("gols por jogo sobem a finalização", () => {
    const base = futsal.rating({ totals: {}, games: 0, position: "pivo" });
    const scorer = futsal.rating({ totals: { goals: 6, shots_on: 10 }, games: 3, position: "pivo" });
    // 78 + 10*2 + 3*(10/3) = 108 → teto 99
    expect(scorer.attributes.finishing).toBe(99);
    expect(scorer.overall).toBeGreaterThan(base.overall);
  });

  it("cartões e faltas derrubam a defesa, mas nunca abaixo de 40", () => {
    const dirty = futsal.rating({
      totals: { fouls: 30, yellow: 10, red: 10 },
      games: 2,
      position: "fixo",
    });
    expect(dirty.attributes.defense).toBe(40);
  });

  it("goleiro tem GOL e não tem finalização nem drible", () => {
    const gk = getSport("football_field").rating({
      totals: { saves: 12, goals_conceded: 2 },
      games: 2,
      position: "goalkeeper",
    });
    expect(Object.keys(gk.attributes).sort()).toEqual(["defense", "goalkeeping", "passing", "physical"]);
    // 76 + 3*6 - 6*1 = 88
    expect(gk.attributes.goalkeeping).toBe(88);
  });

  it("futsal, society e campo usam a mesma fórmula", () => {
    const input = { totals: { goals: 2, assists: 1 }, games: 2, position: "midfielder" };
    expect(getSport("football_society").rating(input)).toEqual(getSport("football_field").rating(input));
  });
});

describe("OVR de basquete", () => {
  const { rating } = getSport("basketball");

  it("base de pivô vem do rebote", () => {
    const center = rating({ totals: {}, games: 0, position: "center" });
    expect(center.attributes.rebounding).toBe(84);
    expect(center.attributes.three).toBe(48);
  });

  it("três certos sobem o arremesso de 3; errados descem", () => {
    const hot = rating({ totals: { fg3_made: 4, fg3_att: 6 }, games: 1, position: "shooting_guard" });
    const cold = rating({ totals: { fg3_made: 0, fg3_att: 8 }, games: 1, position: "shooting_guard" });
    // 78 + 3*4 - 1.5*2 = 87 ; 78 - 1.5*8 = 66
    expect(hot.attributes.three).toBe(87);
    expect(cold.attributes.three).toBe(66);
  });

  it("erros de bola e faltas pesam", () => {
    const sloppy = rating({ totals: { assists: 2, turnovers: 6, fouls: 5, steals: 1 }, games: 1, position: "point_guard" });
    // ast: 80 + 6 - 12 = 74 ; def: 66 + 4 - 10 = 60
    expect(sloppy.attributes.assisting).toBe(74);
    expect(sloppy.attributes.defense).toBe(60);
  });
});

describe("OVR de handebol", () => {
  const { rating } = getSport("handball");

  it("goleiro pondera defesas em três vezes", () => {
    const gk = rating({ totals: { saves: 20 }, games: 2, position: "goalkeeper" });
    // gol 78 + 12 = 90 ; (90*3 + 60 + 68) / 5 = 79.6 → 80
    expect(gk.attributes.goalkeeping).toBe(90);
    expect(gk.overall).toBe(80);
  });

  it("arremessos perdidos descontam o artilheiro", () => {
    const efficient = rating({ totals: { goals: 6, shots: 6 }, games: 1, position: "playmaker" });
    const wasteful = rating({ totals: { goals: 6, shots: 14 }, games: 1, position: "playmaker" });
    expect(efficient.attributes.shooting).toBe(94);
    expect(wasteful.attributes.shooting).toBe(82);
  });

  it("exclusão e cartão vermelho caem na defesa", () => {
    const r = rating({ totals: { suspensions_2min: 2, red: 1 }, games: 1, position: "pivot" });
    // 72 - 16 - 15 = 41
    expect(r.attributes.defense).toBe(41);
  });
});

describe("contrato comum", () => {
  it.each(Object.values(sports))("$name: nota sempre entre 40 e 99, mesmo com dados absurdos", (sport) => {
    const huge = Object.fromEntries(sport.stats.map((s) => [s.key, 10_000]));
    const bad = Object.fromEntries(sport.stats.map((s) => [s.key, s.polarity === "negative" ? 10_000 : 0]));
    for (const position of [...sport.positions.map((p) => p.key), null, "inexistente"]) {
      for (const totals of [{}, huge, bad]) {
        for (const games of [0, 1, 7]) {
          const { overall, attributes } = sport.rating({ totals, games, position });
          for (const value of [overall, ...Object.values(attributes)]) {
            expect(Number.isInteger(value)).toBe(true);
            expect(value).toBeGreaterThanOrEqual(40);
            expect(value).toBeLessThanOrEqual(99);
          }
        }
      }
    }
  });

  it.each(Object.values(sports))("$name: atributos devolvidos existem em ratingAttributes", (sport) => {
    const known = new Set(sport.ratingAttributes.map((a) => a.key));
    for (const position of sport.positions) {
      const { attributes } = sport.rating({ totals: {}, games: 0, position: position.key });
      for (const key of Object.keys(attributes)) expect(known.has(key)).toBe(true);
    }
  });

  it("estatística ausente, NaN ou posição desconhecida não quebram", () => {
    const r = getSport("basketball").rating({ totals: { assists: Number.NaN }, games: 3, position: "x" });
    expect(Number.isInteger(r.overall)).toBe(true);
  });
});
