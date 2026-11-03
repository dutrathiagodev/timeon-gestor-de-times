import { describe, expect, it } from "vitest";
import { formTone, formatForm } from "@/components/rating-card/form";

describe("forma do atleta", () => {
  it("coloca sinal nos positivos e mantém o negativo", () => {
    expect(formatForm(7)).toBe("+7 forma");
    expect(formatForm(-3)).toBe("-3 forma");
  });

  it("zero e valores que arredondam para zero não têm sinal nem cor", () => {
    expect(formatForm(0)).toBe("0 forma");
    expect(formatForm(0.4)).toBe("0 forma");
    expect(formatForm(-0.4)).toBe("0 forma");
    expect(formTone(0.4)).toBe("neutral");
  });

  it("tom acompanha o sinal", () => {
    expect(formTone(2)).toBe("success");
    expect(formTone(-2)).toBe("danger");
  });
});
