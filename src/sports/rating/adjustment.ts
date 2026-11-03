import type { Issue, RatingResult } from "../types";
import { clampRating } from "./shared";

/** Ajuste máximo do treinador sobre a nota, para mais ou para menos (D15). */
export const MAX_ADJUSTMENT = 5;
export const REASON_MIN_LENGTH = 3;
export const REASON_MAX_LENGTH = 200;

export type AdjustmentInput = { value: number; reason: string };

export type ParsedAdjustment =
  | { ok: true; value: number; reason: string }
  | { ok: false; issues: Issue[] };

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/**
 * Valida o corpo de `POST /api/athletes/:id/rating-adjustment`.
 * O valor precisa ser número inteiro (string "3" é recusada) e o motivo é
 * obrigatório mesmo para zerar o ajuste, porque a ação é auditada.
 */
export function parseAdjustment(input: unknown): ParsedAdjustment {
  const issues: Issue[] = [];
  const body = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const { value, reason } = body;

  if (typeof value !== "number" || !Number.isInteger(value)) {
    issues.push({ code: "value_invalid", message: "O ajuste deve ser um número inteiro." });
  } else if (Math.abs(value) > MAX_ADJUSTMENT) {
    issues.push({
      code: "value_out_of_range",
      message: `O ajuste vai de -${MAX_ADJUSTMENT} a +${MAX_ADJUSTMENT}.`,
    });
  }

  const text = typeof reason === "string" ? reason.replace(/\s+/g, " ").trim() : "";
  if (typeof reason !== "string" || CONTROL_CHARS.test(reason.replace(/[\t\n\r]/g, " "))) {
    issues.push({ code: "reason_invalid", message: "Informe o motivo do ajuste em texto." });
  } else if (text.length < REASON_MIN_LENGTH) {
    issues.push({
      code: "reason_too_short",
      message: `O motivo precisa ter ao menos ${REASON_MIN_LENGTH} caracteres.`,
    });
  } else if (text.length > REASON_MAX_LENGTH) {
    issues.push({
      code: "reason_too_long",
      message: `O motivo pode ter no máximo ${REASON_MAX_LENGTH} caracteres.`,
    });
  }

  if (issues.length) return { ok: false, issues };
  // Normaliza o zero negativo (-0), que o JSON preserva e o banco não distingue.
  return { ok: true, value: (value as number) + 0, reason: text };
}
