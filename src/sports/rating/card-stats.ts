import type { RatingResult, SportDefinition, SportKey } from "../types";
import { clampRating } from "./shared";

/** Uma estatística mostrada na carta. */
export type CardStat = { key: string; short: string; label: string; value: number };

/**
 * Definição de uma estatística da carta.
 * - `from`: vem direto de uma estatística que a nota já calcula (muda com os jogos);
 * - `base`: ainda não existe lance que a alimente; parte de um valor típico da posição
 *   e acompanha a evolução da nota geral do atleta (sobe e desce junto com ela).
 */
type Def = { short: string; label: string; from?: string; base?: number };

const d = (short: string, label: string, from?: string, base?: number): Def => ({ short, label, from, base });

/** Seis estatísticas por posição (guia de modalidades, seção 11). Goleiro sem ataque; líbero sem saque, ataque nem bloqueio. */
const GK_FOOT: Def[] = [
  d("GOL", "Defesas", "goalkeeping"),
  d("REF", "Reflexos", undefined, 78),
  d("POS", "Posicionamento", undefined, 76),
  d("REP", "Reposição", "passing"),
  d("COM", "Comunicação", undefined, 74),
  d("AGI", "Agilidade", undefined, 74),
];

const FOOTBALL: Record<string, Def[]> = {
  goalkeeper: GK_FOOT,
  fixo: [d("MAR", "Marcação", "defense"), d("COB", "Cobertura", undefined, 74), d("PAS", "Passe", "passing"), d("POS", "Posicionamento", undefined, 75), d("DUE", "Duelos", undefined, 72), d("FIS", "Físico", "physical")],
  ala: [d("DRI", "Drible", "dribbling"), d("VEL", "Velocidade", undefined, 76), d("PAS", "Passe", "passing"), d("FIN", "Finalização", "finishing"), d("REC", "Recomposição", undefined, 66), d("RES", "Resistência", undefined, 72)],
  pivo: [d("FIN", "Finalização", "finishing"), d("PRO", "Proteção de bola", undefined, 74), d("FOR", "Força", undefined, 72), d("POS", "Posicionamento", undefined, 72), d("PAS", "Passe", "passing"), d("DUE", "Duelos", undefined, 68)],
  defender: [d("MAR", "Marcação", "defense"), d("ANT", "Antecipação", undefined, 74), d("DUE", "Duelos", undefined, 76), d("AER", "Jogo aéreo", undefined, 72), d("PAS", "Passe", "passing"), d("FIS", "Físico", "physical")],
  fullback: [d("DEF", "Defesa", "defense"), d("APO", "Apoio", undefined, 70), d("CRU", "Cruzamento", undefined, 68), d("REC", "Recomposição", undefined, 72), d("VEL", "Velocidade", undefined, 72), d("PAS", "Passe", "passing")],
  defensive_mid: [d("INT", "Interceptações", undefined, 74), d("MAR", "Marcação", "defense"), d("PAS", "Passe", "passing"), d("REC", "Recuperação", undefined, 72), d("FIS", "Físico", "physical"), d("POS", "Posicionamento", undefined, 74)],
  midfielder: [d("PAS", "Passe", "passing"), d("VIS", "Visão de jogo", undefined, 74), d("DRI", "Drible", "dribbling"), d("CRI", "Criação", undefined, 72), d("FIN", "Finalização", "finishing"), d("FIS", "Físico", "physical")],
  winger: [d("DRI", "Drible", "dribbling"), d("VEL", "Velocidade", undefined, 76), d("CRU", "Cruzamento", undefined, 70), d("FIN", "Finalização", "finishing"), d("REC", "Recomposição", undefined, 62), d("AGI", "Agilidade", undefined, 74)],
  striker: [d("FIN", "Finalização", "finishing"), d("MOV", "Movimentação", undefined, 74), d("CAB", "Cabeceio", undefined, 70), d("FOR", "Força", undefined, 72), d("VEL", "Velocidade", undefined, 70), d("PRE", "Pressão", undefined, 66)],
  attacker: [d("FIN", "Finalização", "finishing"), d("MOV", "Movimentação", undefined, 74), d("DRI", "Drible", "dribbling"), d("PRE", "Pressão", undefined, 66), d("PAS", "Passe", "passing"), d("VEL", "Velocidade", undefined, 70)],
};

const FOOTBALL_FIELD_GK: Def[] = [GK_FOOT[0], GK_FOOT[1], GK_FOOT[2], d("SAI", "Saídas", undefined, 72), GK_FOOT[3], GK_FOOT[4]];

const BASKETBALL: Record<string, Def[]> = {
  point_guard: [d("AST", "Assistência", "assisting"), d("DRI", "Controle de bola", undefined, 78), d("ARR", "Arremesso", "shooting"), d("3PT", "Três pontos", "three"), d("DEF", "Defesa", "defense"), d("VEL", "Velocidade", undefined, 72)],
  shooting_guard: [d("ARR", "Arremesso", "shooting"), d("3PT", "Três pontos", "three"), d("DRI", "Controle de bola", undefined, 72), d("AST", "Assistência", "assisting"), d("DEF", "Defesa", "defense"), d("MOV", "Movimentação", undefined, 70)],
  small_forward: [d("ARR", "Arremesso", "shooting"), d("REB", "Rebote", "rebounding"), d("DEF", "Defesa", "defense"), d("3PT", "Três pontos", "three"), d("DRI", "Controle de bola", undefined, 66), d("FIS", "Físico", "physical")],
  power_forward: [d("REB", "Rebote", "rebounding"), d("ARR", "Arremesso", "shooting"), d("DEF", "Defesa", "defense"), d("FIS", "Físico", "physical"), d("TOC", "Tocos", undefined, 68), d("3PT", "Três pontos", "three")],
  center: [d("REB", "Rebote", "rebounding"), d("TOC", "Tocos", undefined, 76), d("DEF", "Defesa", "defense"), d("FIN", "Finalização no garrafão", undefined, 74), d("FIS", "Físico", "physical"), d("COR", "Corta-luz", undefined, 70)],
};

const HANDBALL: Record<string, Def[]> = {
  goalkeeper: [d("GOL", "Defesas", "goalkeeping"), d("REF", "Reflexos", undefined, 76), d("POS", "Posicionamento", undefined, 74), d("7M", "Defesa de 7 m", undefined, 70), d("REP", "Reposição", "assisting"), d("AGI", "Agilidade", undefined, 72)],
  wing: [d("ARR", "Arremesso", "shooting"), d("ANG", "Ângulo de finalização", undefined, 72), d("VEL", "Velocidade", undefined, 76), d("CON", "Contra-ataque", undefined, 72), d("DEF", "Defesa", "defense"), d("AGI", "Agilidade", undefined, 72)],
  playmaker: [d("ASS", "Assistência", "assisting"), d("VIS", "Visão de jogo", undefined, 74), d("DEC", "Decisão", undefined, 72), d("ARR", "Arremesso", "shooting"), d("LID", "Liderança", undefined, 68), d("RIT", "Ritmo", undefined, 70)],
  center_back: [d("ASS", "Assistência", "assisting"), d("DEC", "Decisão", undefined, 74), d("ARR", "Arremesso", "shooting"), d("RIT", "Ritmo", undefined, 72), d("DEF", "Defesa", "defense"), d("FIS", "Físico", "physical")],
  pivot: [d("BLQ", "Bloqueio", undefined, 72), d("FOR", "Força", undefined, 74), d("FIN", "Finalização", "shooting"), d("POS", "Posicionamento", undefined, 72), d("FAL", "Faltas sofridas", undefined, 70), d("DEF", "Defesa", "defense")],
};

const VOLLEYBALL: Record<string, Def[]> = {
  setter: [d("TOQ", "Toque", "set"), d("DIS", "Distribuição", undefined, 80), d("SAQ", "Saque", "serve"), d("NOC", "Noção de jogo", "reading"), d("BLQ", "Bloqueio", "block"), d("DEF", "Defesa", undefined, 62)],
  outside: [d("ATQ", "Ataque", "attack"), d("REC", "Recepção", "pass"), d("SAQ", "Saque", "serve"), d("BLQ", "Bloqueio", "block"), d("DEF", "Defesa", undefined, 72), d("EST", "Estabilidade", undefined, 70)],
  opposite: [d("ATQ", "Ataque", "attack"), d("SAQ", "Saque", "serve"), d("BLQ", "Bloqueio", "block"), d("PUL", "Pulo", "jump"), d("NOC", "Noção de jogo", "reading"), d("EFI", "Eficiência em bola alta", undefined, 72)],
  middle: [d("BLQ", "Bloqueio", "block"), d("ATR", "Ataque rápido", "attack"), d("PUL", "Pulo", "jump"), d("LEI", "Leitura do levantador", "reading"), d("DES", "Deslocamento", undefined, 70), d("SAQ", "Saque", "serve")],
  libero: [d("REC", "Recepção", "pass"), d("DEF", "Defesa", undefined, 86), d("SEG", "Segunda bola", "set"), d("POS", "Posicionamento", undefined, 80), d("COM", "Comunicação", undefined, 76), d("NOC", "Noção de jogo", "reading")],
};

const TABLES: Partial<Record<SportKey, Record<string, Def[]>>> = {
  volleyball: VOLLEYBALL,
  futsal: FOOTBALL,
  football_society: FOOTBALL,
  football_field: { ...FOOTBALL, goalkeeper: FOOTBALL_FIELD_GK },
  basketball: BASKETBALL,
  handball: HANDBALL,
};

/** Máximo na carta: três por coluna, duas colunas. */
export const MAX_CARD_STATS = 6;

/**
 * Estatísticas da carta do atleta, na ordem de leitura, só as que valem para a posição.
 * As de `from` vêm da nota; as de `base` acompanham a nota geral (base da posição + o quanto
 * o atleta evoluiu em relação à base). Posição sem tabela cai nas estatísticas da nota.
 */
export function cardStats(
  sport: Pick<SportDefinition, "key" | "ratingAttributes" | "rating">,
  rating: Pick<RatingResult, "overall" | "attributes">,
  positionKey?: string | null,
): CardStat[] {
  const defs = positionKey ? TABLES[sport.key]?.[positionKey] : undefined;

  if (!defs) {
    return sport.ratingAttributes
      .filter((attribute) => attribute.key in rating.attributes)
      .slice(0, MAX_CARD_STATS)
      .map((attribute) => ({
        key: attribute.key,
        short: attribute.short,
        label: attribute.label,
        value: rating.attributes[attribute.key],
      }));
  }

  const baseOverall = sport.rating({ totals: {}, games: 0, position: positionKey }).overall;
  const growth = rating.overall - baseOverall;

  return defs.slice(0, MAX_CARD_STATS).map((def) => {
    const fromRating = def.from ? rating.attributes[def.from] : undefined;
    return {
      key: def.short,
      short: def.short,
      label: def.label,
      value: fromRating ?? clampRating((def.base ?? 70) + growth),
    };
  });
}
