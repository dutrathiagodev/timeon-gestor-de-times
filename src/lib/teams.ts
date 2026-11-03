import type { SportKey } from "@/sports/types";

export type TeamOption = {
  id: string;
  name: string;
  sportKey: SportKey;
  category: string;
};

/**
 * Times que o usuário pode escolher no seletor.
 * Hoje só existe o time de vôlei do modelo antigo; quando as telas passarem a ler
 * o banco novo (cards 00042 e 00043), esta função devolve os times do usuário.
 */
export function getTeamOptions(): TeamOption[] {
  return [{ id: "volei", name: "Vôlei", sportKey: "volleyball", category: "Principal" }];
}
