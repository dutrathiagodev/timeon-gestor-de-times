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
