import type { SportDefinition } from "../types";
import type { LiveAlert } from "./types";

const FOUL_OUT = 5;
const TEAM_FOULS = 5;
const SECOND_YELLOW = 2;
const SUSPENSIONS_TO_DISQUALIFY = 3;

/**
 * Avisos da regra da modalidade. Só avisam: quem decide é o árbitro e o técnico.
 * `fouls` são as faltas de cada time no período em andamento (regra do futsal).
 */
export function computeAlerts(
  sport: SportDefinition,
  stats: Record<string, Record<string, number>>,
  fouls: { us: number; them: number },
): LiveAlert[] {
  const alerts: LiveAlert[] = [];
  const athletes = Object.entries(stats);

  if (sport.family === "basketball") {
    for (const [athleteId, row] of athletes) {
      if ((row.fouls ?? 0) >= FOUL_OUT) {
        alerts.push({
          code: "foul_out",
          athleteId,
          message: `Atleta com ${FOUL_OUT} faltas: deve sair do jogo.`,
        });
      }
    }
  }

  if (sport.family === "football") {
    for (const [athleteId, row] of athletes) {
      if ((row.red ?? 0) >= 1) {
        alerts.push({ code: "sent_off", athleteId, message: "Atleta expulso." });
      } else if ((row.yellow ?? 0) >= SECOND_YELLOW) {
        alerts.push({
          code: "second_yellow",
          athleteId,
          message: "Segundo cartão amarelo: vale vermelho.",
        });
      }
    }
  }

  if (sport.key === "futsal") {
    for (const side of ["us", "them"] as const) {
      if (fouls[side] >= TEAM_FOULS) {
        alerts.push({
          code: "team_fouls",
          side,
          message:
            side === "us"
              ? `Nosso time chegou a ${TEAM_FOULS} faltas no tempo: a próxima dá tiro livre sem barreira.`
              : `O adversário chegou a ${TEAM_FOULS} faltas no tempo: a próxima dá tiro livre sem barreira.`,
        });
      }
    }
  }

  if (sport.family === "handball") {
    for (const [athleteId, row] of athletes) {
      if ((row.suspensions_2min ?? 0) >= SUSPENSIONS_TO_DISQUALIFY) {
        alerts.push({
          code: "disqualification",
          athleteId,
          message: `${SUSPENSIONS_TO_DISQUALIFY} exclusões de 2 minutos: exclusão definitiva.`,
        });
      }
    }
  }

  return alerts;
}
