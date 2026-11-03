/** Texto da "forma" do atleta: saldo dos últimos jogos com sinal explícito. */
export function formatForm(form: number): string {
  const rounded = Math.round(form);
  return `${rounded > 0 ? "+" : ""}${rounded} forma`;
}

/** Zero é neutro: não pinta de verde nem de vermelho. */
export function formTone(form: number): "success" | "danger" | "neutral" {
  const rounded = Math.round(form);
  if (rounded > 0) return "success";
  if (rounded < 0) return "danger";
  return "neutral";
}
