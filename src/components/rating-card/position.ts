import type { SportDefinition } from "@/sports/types";

/** Nome da posição no esporte do time; posição desconhecida ou vazia vira "Atleta". */
export function positionLabel(
  sport: Pick<SportDefinition, "positions">,
  key?: string | null,
): string {
  return sport.positions.find((position) => position.key === key)?.label ?? "Atleta";
}
