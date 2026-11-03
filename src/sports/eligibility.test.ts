import { describe, expect, it } from "vitest";
import { eligibilityAlerts } from "@/sports/eligibility";

const in2026 = new Date("2026-11-03T12:00:00");
const codes = (...args: Parameters<typeof eligibilityAlerts>) => eligibilityAlerts(...args).map((a) => a.code);

describe("categoria e sexo", () => {
  const adult = "1998-05-10";

  it("masculino com feminino e feminino com masculino avisam", () => {
    expect(codes({ category: "male" }, { sex: "female", birthDate: adult }, in2026)).toEqual(["category_mismatch"]);
    expect(codes({ category: "female" }, { sex: "male", birthDate: adult }, in2026)).toEqual(["category_mismatch"]);
  });

  it("sexo igual à categoria não avisa", () => {
    expect(codes({ category: "male" }, { sex: "male", birthDate: adult }, in2026)).toEqual([]);
    expect(codes({ category: "female" }, { sex: "female", birthDate: adult }, in2026)).toEqual([]);
  });

  it("time misto aceita qualquer sexo", () => {
    expect(codes({ category: "mixed" }, { sex: "female", birthDate: adult }, in2026)).toEqual([]);
    expect(codes({ category: "mixed" }, { sex: "male", birthDate: adult }, in2026)).toEqual([]);
  });

  it("a mensagem diz o que aconteceu", () => {
    const [alert] = eligibilityAlerts({ category: "male" }, { sex: "female", birthDate: adult }, in2026);
    expect(alert.message).toContain("feminino");
    expect(alert.message).toContain("masculino");
  });
});

describe("faixa etária (subs)", () => {
  const sub17 = { category: "mixed" as const, ageGroup: "sub17" };

  it("vale a idade que completa no ano, não a de hoje", () => {
    // 2026 - 2009 = 17: ainda é sub-17, mesmo que o aniversário seja em dezembro
    expect(codes(sub17, { sex: "male", birthDate: "2009-12-31" }, in2026)).toEqual([]);
    expect(codes(sub17, { sex: "male", birthDate: "2009-01-01" }, in2026)).toEqual([]);
    // 2026 - 2008 = 18: passou
    expect(codes(sub17, { sex: "male", birthDate: "2008-12-31" }, in2026)).toEqual(["over_age"]);
    expect(codes(sub17, { sex: "male", birthDate: "2008-01-01" }, in2026)).toEqual(["over_age"]);
  });

  it("mais novo que a faixa não avisa", () => {
    expect(codes(sub17, { sex: "male", birthDate: "2015-03-03" }, in2026)).toEqual([]);
  });

  it("muda com o ano de referência", () => {
    const born = { sex: "male" as const, birthDate: "2009-06-01" };
    expect(codes(sub17, born, new Date("2026-06-01T12:00:00"))).toEqual([]);
    expect(codes(sub17, born, new Date("2027-06-01T12:00:00"))).toEqual(["over_age"]);
  });

  it("sub de um e de dois dígitos", () => {
    expect(codes({ category: "mixed", ageGroup: "sub9" }, { sex: "male", birthDate: "2016-01-01" }, in2026)).toEqual(["over_age"]);
    expect(codes({ category: "mixed", ageGroup: "sub20" }, { sex: "male", birthDate: "2006-01-01" }, in2026)).toEqual([]);
  });

  it("a mensagem traz a idade e o limite", () => {
    const [alert] = eligibilityAlerts(sub17, { sex: "male", birthDate: "2000-01-01" }, in2026);
    expect(alert.message).toContain("26");
    expect(alert.message).toContain("Sub-17");
  });

  it("faixa vazia, adulto ou que não é sub não confere idade", () => {
    for (const ageGroup of [null, undefined, "", "adulto", "master", "sub", "sub100", "Sub17"]) {
      expect(codes({ category: "mixed", ageGroup }, { sex: "male", birthDate: "1950-01-01" }, in2026), String(ageGroup)).toEqual([]);
    }
  });

  it("data de nascimento inválida avisa, em vez de aprovar ou quebrar", () => {
    for (const birthDate of ["", "01/02/2009", "2009-13-45", "abc"]) {
      expect(codes(sub17, { sex: "male", birthDate }, in2026), birthDate).toEqual(["birth_date_invalid"]);
    }
  });

  it("os dois avisos aparecem juntos", () => {
    expect(codes({ category: "female", ageGroup: "sub15" }, { sex: "male", birthDate: "2000-01-01" }, in2026)).toEqual([
      "category_mismatch",
      "over_age",
    ]);
  });
});
