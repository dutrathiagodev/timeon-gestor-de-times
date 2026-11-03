import type { RatingAttribute, RatingResult, SportDefinition } from "@/sports/types";

/** No máximo seis estatísticas por card: três por coluna, como nas cartas de referência. */
export const MAX_FACE_STATS = 6;

/**
 * Vôlei: a nota usa as sete estatísticas para todos (regra de hoje), mas o card só
 * mostra as que fazem sentido na posição. O líbero não saca, não ataca e não bloqueia.
 */
const VOLLEYBALL_FACE: Record<string, string[]> = {
  setter: ["set", "pass", "serve", "reading", "attack", "block"],
  libero: ["pass", "set", "reading"],
  middle: ["block", "attack", "jump", "reading", "serve"],
  opposite: ["attack", "block", "serve", "jump", "reading"],
  outside: ["attack", "pass", "serve", "block", "reading", "jump"],
};

/**
 * Estatísticas que aparecem na face do card, na ordem de leitura.
 * Nos demais esportes a nota já devolve só o que vale para a posição (goleiro sem
 * finalização, linha sem "Goleiro"); aqui só se põe a principal da posição primeiro.
 */
export function faceAttributes(
  sport: Pick<SportDefinition, "key" | "ratingAttributes">,
  rating: Pick<RatingResult, "attributes">,
  positionKey?: string | null,
): RatingAttribute[] {
  const available = sport.ratingAttributes.filter((attribute) => attribute.key in rating.attributes);

  const volleyballKeys = sport.key === "volleyball" && positionKey ? VOLLEYBALL_FACE[positionKey] : undefined;
  if (volleyballKeys) {
    return volleyballKeys
      .map((key) => available.find((attribute) => attribute.key === key))
      .filter((attribute): attribute is RatingAttribute => Boolean(attribute));
  }

  const goalkeeping = available.find((attribute) => attribute.key === "goalkeeping");
  const ordered = goalkeeping
    ? [goalkeeping, ...available.filter((attribute) => attribute !== goalkeeping)]
    : available;
  return ordered.slice(0, MAX_FACE_STATS);
}
