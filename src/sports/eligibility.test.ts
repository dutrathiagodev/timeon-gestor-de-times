import { describe, expect, it } from "vitest";
import { eligibilityAlerts } from "@/sports/eligibility";

const in2026 = new Date("2026-11-03T12:00:00");
const codes = (...args: Parameters<typeof eligibilityAlerts>) => eligibilityAlerts(...args).map((a) => a.code);

describe("categoria e sexo", () => {
  const adult = 1998;

  it("masculino com feminino e feminino com masculino avisam", () => {
    expect(codes({ category: "male" }, { sex: "female", birthYear: adult }, in2026)).toEqual(["category_mismatch"]);
    expect(codes({ category: "female" }, { sex: "male", birthYear: adult }, in2026)).toEqual(["category_mismatch"]);
  });

  it("sexo igual à categoria não avisa", () => {
    expect(codes({ category: "male" }, { sex: "male", birthYear: adult }, in2026)).toEqual([]);
    expect(codes({ category: "female" }, { sex: "female", birthYear: adult }, in2026)).toEqual([]);
  });

  it("time misto aceita qualquer sexo", () => {
    expect(codes({ category: "mixed" }, { sex: "female", birthYear: adult }, in2026)).toEqual([]);
    expect(codes({ category: "mixed" }, { sex: "male", birthYear: adult }, in2026)).toEqual([]);
  });

  it("a mensagem diz o que aconteceu", () => {
    const [alert] = eligibilityAlerts({ category: "male" }, { sex: "female", birthYear: adult }, in2026);
    expect(alert.message).toContain("feminino");
    expect(alert.message).toContain("masculino");
  });
});

describe("faixa etária (subs)", () => {
  const sub17 = { category: "mixed" as const, ageGroup: "sub17" };

  it("vale a idade que completa no ano de referência (só o ano de nascimento entra)", () => {
    // 2026 - 2009 = 17: ainda é sub-17, qualquer que seja o mês do aniversário
    expect(codes(sub17, { sex: "male", birthYear: 2009 }, in2026)).toEqual([]);
    // 2026 - 2008 = 18: passou
    expect(codes(sub17, { sex: "male", birthYear: 2008 }, in2026)).toEqual(["over_age"]);
  });

  it("mais novo que a faixa não avisa", () => {
    expect(codes(sub17, { sex: "male", birthYear: 2015 }, in2026)).toEqual([]);
  });

  it("muda com o ano de referência", () => {
    const born = { sex: "male" as const, birthYear: 2009 };
    expect(codes(sub17, born, new Date("2026-06-01T12:00:00"))).toEqual([]);
    expect(codes(sub17, born, new Date("2027-06-01T12:00:00"))).toEqual(["over_age"]);
  });

  it("sub de um e de dois dígitos", () => {
    expect(codes({ category: "mixed", ageGroup: "sub9" }, { sex: "male", birthYear: 2016 }, in2026)).toEqual(["over_age"]);
    expect(codes({ category: "mixed", ageGroup: "sub20" }, { sex: "male", birthYear: 2006 }, in2026)).toEqual([]);
  });

  it("a mensagem traz a idade e o limite", () => {
    const [alert] = eligibilityAlerts(sub17, { sex: "male", birthYear: 2000 }, in2026);
    expect(alert.message).toContain("26");
    expect(alert.message).toContain("Sub-17");
  });

  it("faixa vazia, adulto ou que não é sub não confere idade", () => {
    for (const ageGroup of [null, undefined, "", "adulto", "master", "sub", "sub100", "Sub17"]) {
      expect(codes({ category: "mixed", ageGroup }, { sex: "male", birthYear: 1950 }, in2026), String(ageGroup)).toEqual([]);
    }
  });

  it("ano de nascimento inválido avisa, em vez de aprovar ou quebrar", () => {
    for (const birthYear of [1899, 2027, 20.5, Number.NaN, 0, -5]) {
      expect(codes(sub17, { sex: "male", birthYear }, in2026), String(birthYear)).toEqual(["birth_date_invalid"]);
    }
  });

  it("os dois avisos aparecem juntos", () => {
    expect(codes({ category: "female", ageGroup: "sub15" }, { sex: "male", birthYear: 2000 }, in2026)).toEqual([
      "category_mismatch",
      "over_age",
    ]);
  });
});
