import type { SportDefinition } from "@/sports/types";
import type { BoardAthlete } from "./lineup-board";

export type NewAthleteInput = { name: string; positionKey: string; shirtNumber: string };

export const MAX_ROSTER = 40;

/**
 * Valida o atleta novo contra a modalidade do time: a posição precisa existir naquele esporte
 * (a mesma chave pode significar coisas diferentes em outro) e a camisa não repete no time.
 * Devolve a mensagem do erro, ou null se estiver tudo certo.
 */
export function validateNewAthlete(
  sport: Pick<SportDefinition, "positions">,
  roster: BoardAthlete[],
  input: NewAthleteInput,
): string | null {
  const name = input.name.trim();
  if (name.length < 2) return "Escreva o nome do atleta (pelo menos 2 letras).";
  if (name.length > 60) return "O nome pode ter no máximo 60 letras.";
  if (!sport.positions.some((position) => position.key === input.positionKey)) {
    return "Escolha uma posição da modalidade do time.";
  }
  if (roster.length >= MAX_ROSTER) return `O elenco tem no máximo ${MAX_ROSTER} atletas.`;
  if (input.shirtNumber.trim() !== "") {
    const shirt = Number(input.shirtNumber);
    if (!Number.isInteger(shirt) || shirt < 0 || shirt > 99) return "A camisa vai de 0 a 99.";
    if (roster.some((athlete) => athlete.shirtNumber === shirt)) {
      return `A camisa ${shirt} já é de outro atleta deste time.`;
    }
  }
  return null;
}

export function buildAthlete(input: NewAthleteInput, id: string): BoardAthlete {
  return {
    id,
    name: input.name.trim().replace(/\s+/g, " "),
    positionKey: input.positionKey,
    shirtNumber: input.shirtNumber.trim() === "" ? null : Number(input.shirtNumber),
  };
}
