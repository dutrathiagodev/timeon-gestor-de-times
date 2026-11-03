import { basketball } from "./basketball";
import { footballField, footballSociety, futsal } from "./football";
import { handball } from "./handball";
import type { SportDefinition, SportKey } from "./types";
import { volleyball } from "./volleyball";

export const sports: Record<SportKey, SportDefinition> = {
  volleyball,
  futsal,
  football_society: footballSociety,
  football_field: footballField,
  basketball,
  handball,
};

export const SPORT_KEYS = Object.keys(sports) as SportKey[];

export function isSportKey(value: unknown): value is SportKey {
  return typeof value === "string" && Object.hasOwn(sports, value);
}

export function getSport(key: SportKey): SportDefinition {
  return sports[key];
}

export type * from "./types";
