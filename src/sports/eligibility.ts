export type TeamCategory = "male" | "female" | "mixed";
export type AthleteSex = "male" | "female";

export type EligibilityAlert = {
  code: "category_mismatch" | "over_age" | "birth_date_invalid";
  message: string;
};

/**
 * Avisos de elegibilidade ao entrar num time. Só avisam: ligas amadoras tem
 * excecoes e o admin pode autorizar. O sexo vem da inscricao; o sistema nao o infere.
 *
 * Sub-N (`age_group` como `sub17`): vale a idade que a pessoa completa no ano
 * de referencia (ano atual menos ano de nascimento), como nos campeonatos. So o
 * ANO de nascimento entra: a data completa fica cifrada e nao e preciso decifra-la.
 */
export function eligibilityAlerts(
  team: { category: TeamCategory; ageGroup?: string | null },
  athlete: { sex: AthleteSex; birthYear: number },
  reference: Date = new Date(),
): EligibilityAlert[] {
  const alerts: EligibilityAlert[] = [];

  if (team.category === "male" && athlete.sex === "female") {
    alerts.push({
      code: "category_mismatch",
      message: "Atleta do sexo feminino em time masculino.",
    });
  }
  if (team.category === "female" && athlete.sex === "male") {
    alerts.push({
      code: "category_mismatch",
      message: "Atleta do sexo masculino em time feminino.",
    });
  }

  const sub = team.ageGroup?.match(/^sub(\d{1,2})$/);
  if (sub) {
    const birthYear = athlete.birthYear;
    if (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > reference.getFullYear()) {
      alerts.push({
        code: "birth_date_invalid",
        message: "Ano de nascimento inválido: não dá para conferir a faixa etária.",
      });
    } else {
      const limit = Number(sub[1]);
      const age = reference.getFullYear() - birthYear;
      if (age > limit) {
        alerts.push({
          code: "over_age",
          message: `Atleta completa ${age} anos em ${reference.getFullYear()}, acima do limite do Sub-${limit}.`,
        });
      }
    }
  }
  return alerts;
}
