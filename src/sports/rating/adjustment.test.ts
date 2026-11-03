import { describe, expect, it } from "vitest";
import { MAX_ADJUSTMENT, applyAdjustment, parseAdjustment } from "@/sports/rating/adjustment";
import { sports } from "@/sports/registry";

const codes = (input: unknown) => {
  const result = parseAdjustment(input);
  return result.ok ? [] : result.issues.map((issue) => issue.code);
};

describe("parseAdjustment", () => {
  it("aceita os limites e normaliza o motivo", () => {
    expect(parseAdjustment({ value: 5, reason: "  evolução   no treino " })).toEqual({
      ok: true,
      value: 5,
      reason: "evolução no treino",
    });
    expect(parseAdjustment({ value: -MAX_ADJUSTMENT, reason: "faltou aos treinos" }).ok).toBe(true);
  });

  it("zero é válido, mas continua exigindo motivo", () => {
    expect(parseAdjustment({ value: 0, reason: "voltou ao normal" }).ok).toBe(true);
    expect(codes({ value: 0, reason: "" })).toEqual(["reason_too_short"]);
  });

  it("-0 vira 0", () => {
    const result = parseAdjustment({ value: -0, reason: "sem ajuste" });
    expect(result.ok && Object.is(result.value, 0)).toBe(true);
  });

  it("recusa valor fora de -5..5", () => {
    expect(codes({ value: 6, reason: "motivo ok" })).toEqual(["value_out_of_range"]);
    expect(codes({ value: -6, reason: "motivo ok" })).toEqual(["value_out_of_range"]);
  });

  it("recusa valor que não é inteiro numérico", () => {
    for (const value of ["3", 2.5, Number.NaN, Infinity, null, undefined, true, [3]]) {
      expect(codes({ value, reason: "motivo ok" })).toEqual(["value_invalid"]);
    }
  });

  it("recusa motivo curto, longo ou que não é texto", () => {
    expect(codes({ value: 1, reason: "ok" })).toEqual(["reason_too_short"]);
    expect(codes({ value: 1, reason: "   a   " })).toEqual(["reason_too_short"]);
    expect(codes({ value: 1, reason: "x".repeat(201) })).toEqual(["reason_too_long"]);
    expect(parseAdjustment({ value: 1, reason: "x".repeat(200) }).ok).toBe(true);
    for (const reason of [undefined, null, 42, {}]) {
      expect(codes({ value: 1, reason })).toEqual(["reason_invalid"]);
    }
  });

  it("recusa caracteres de controle no motivo, mas aceita quebra de linha", () => {
    expect(codes({ value: 1, reason: "motivo\u0000ruim" })).toEqual(["reason_invalid"]);
    expect(parseAdjustment({ value: 1, reason: "linha 1\nlinha 2" })).toMatchObject({
      ok: true,
      reason: "linha 1 linha 2",
    });
  });

  it("junta todos os problemas de uma vez", () => {
    expect(codes({ value: 9, reason: "" })).toEqual(["value_out_of_range", "reason_too_short"]);
  });

  it("corpo ausente ou que não é objeto não quebra", () => {
    for (const input of [undefined, null, "texto", 7, []]) {
      expect(codes(input)).toEqual(["value_invalid", "reason_invalid"]);
    }
  });
});

describe("applyAdjustment", () => {
  const base = { overall: 80, attributes: { attack: 85, pass: 75 } };

  it("soma o ajuste e informa o valor aplicado", () => {
    expect(applyAdjustment(base, 3)).toEqual({ ...base, overall: 83, adjustment: 3 });
    expect(applyAdjustment(base, -5)).toMatchObject({ overall: 75, adjustment: -5 });
  });

  it("não mexe nos atributos nem altera o original", () => {
    const result = applyAdjustment(base, 4);
    expect(result.attributes).toBe(base.attributes);
    expect(base.overall).toBe(80);
  });

  it("respeita o teto 99 e o piso 40", () => {
    expect(applyAdjustment({ overall: 98, attributes: {} }, 5).overall).toBe(99);
    expect(applyAdjustment({ overall: 42, attributes: {} }, -5).overall).toBe(40);
  });

  it("contém valores fora do intervalo vindos do banco", () => {
    expect(applyAdjustment(base, 50)).toMatchObject({ overall: 85, adjustment: 5 });
    expect(applyAdjustment(base, -50)).toMatchObject({ overall: 75, adjustment: -5 });
  });

  it("valor inválido vira zero e decimal arredonda", () => {
    expect(applyAdjustment(base, Number.NaN)).toMatchObject({ overall: 80, adjustment: 0 });
    expect(applyAdjustment(base, Infinity)).toMatchObject({ overall: 80, adjustment: 0 });
    expect(applyAdjustment(base, 2.6)).toMatchObject({ overall: 83, adjustment: 3 });
  });

  it("-0 não vaza para o resultado", () => {
    expect(Object.is(applyAdjustment(base, -0).adjustment, 0)).toBe(true);
  });

  it("funciona com a nota real de cada esporte", () => {
    for (const sport of Object.values(sports)) {
      const rating = sport.rating({ totals: {}, games: 0, position: sport.positions[0].key });
      const up = applyAdjustment(rating, 5);
      expect(up.overall).toBeLessThanOrEqual(99);
      expect(up.overall).toBeGreaterThanOrEqual(rating.overall);
    }
  });
});
