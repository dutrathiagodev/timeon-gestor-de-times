import type { Period, SportDefinition } from "../types";
import { computeAlerts } from "./alerts";
import { END_PERIOD, FINISH, findAction } from "./actions";
import type { LiveEvent, LiveIssue, LiveState, Side } from "./types";

const VOLLEYBALL_SET_POINTS = 25;
const VOLLEYBALL_TIE_BREAK_POINTS = 15;

type Fouls = { us: number; them: number };

function winnerOf(final: { us: number; them: number }): Side | "draw" {
  if (final.us === final.them) return "draw";
  return final.us > final.them ? "us" : "them";
}

function credit(stats: LiveState["stats"], athleteId: string, key: string) {
  const row = (stats[athleteId] ??= {});
  row[key] = (row[key] ?? 0) + 1;
}

/** Vôlei: o set fecha sozinho no 25 (15 no último) com 2 de diferença. */
function volleyballSetClosed(current: Period, setNumber: number, maxSets: number) {
  const target = setNumber === maxSets ? VOLLEYBALL_TIE_BREAK_POINTS : VOLLEYBALL_SET_POINTS;
  const high = Math.max(current.us, current.them);
  const low = Math.min(current.us, current.them);
  return high >= target && high - low >= 2;
}

/**
 * Reproduz o jogo a partir da lista de lances. Função pura: a mesma lista
 * sempre dá o mesmo estado, então desfazer é tirar o último lance e recalcular.
 * Lance inválido é recusado (entra em `issues`) e não altera o estado.
 */
export function computeLive(sport: SportDefinition, events: LiveEvent[]): LiveState {
  const isVolleyball = sport.family === "volleyball";
  const maxSets = sport.score.periods;
  const setsToWin = Math.floor(maxSets / 2) + 1;
  const maxPeriods = sport.score.periods + sport.score.maxExtraPeriods;

  const periods: Period[] = [];
  let current: Period = { us: 0, them: 0 };
  let finished = false;
  let fouls: Fouls = { us: 0, them: 0 };
  const stats: LiveState["stats"] = {};
  const issues: LiveIssue[] = [];

  const reject = (eventIndex: number, code: string, message: string) => {
    issues.push({ code, message, eventIndex });
  };
  const closePeriod = () => {
    periods.push(current);
    current = { us: 0, them: 0 };
    fouls = { us: 0, them: 0 };
  };

  events.forEach((event, index) => {
    const eventIndex = index + 1;

    if (event.action === FINISH && finished) return;
    if (finished) {
      reject(eventIndex, "match_finished", "O jogo já terminou.");
      return;
    }

    if (event.action === END_PERIOD) {
      if (isVolleyball) {
        reject(eventIndex, "set_closes_automatically", "O set termina sozinho quando um time chega à pontuação.");
      } else if (periods.length + 1 >= maxPeriods) {
        reject(eventIndex, "periods_exceeded", "Não há mais períodos; encerre o jogo.");
      } else {
        closePeriod();
      }
      return;
    }

    if (event.action === FINISH) {
      const needsCurrent = !isVolleyball && (periods.length < sport.score.periods || current.us + current.them > 0);
      const list = needsCurrent ? [...periods, current] : periods;
      const problems = sport.score.validate(list);
      if (problems.length) {
        problems.forEach((p) => reject(eventIndex, p.code, p.message));
        return;
      }
      periods.splice(0, periods.length, ...list);
      current = { us: 0, them: 0 };
      finished = true;
      return;
    }

    const action = findAction(sport, event.action);
    if (!action) {
      reject(eventIndex, "unknown_action", "Lance desconhecido para este esporte.");
      return;
    }
    if (action.athlete === "required" && !event.athleteId) {
      reject(eventIndex, "athlete_required", `Escolha o atleta do lance "${action.label}".`);
      return;
    }
    if (action.athlete === "none" && event.athleteId) {
      reject(eventIndex, "athlete_not_allowed", `O lance "${action.label}" não tem atleta.`);
      return;
    }
    if (event.assistAthleteId) {
      if (!action.assist) {
        reject(eventIndex, "assist_not_allowed", `O lance "${action.label}" não tem assistência.`);
        return;
      }
      if (event.assistAthleteId === event.athleteId) {
        reject(eventIndex, "assist_same_athlete", "Quem faz o ponto não dá a própria assistência.");
        return;
      }
    }

    if (action.points) current[action.points.side] += action.points.value;
    if (action.key === "fouls") fouls.us += 1;
    if (action.key === "opponent_foul") fouls.them += 1;
    if (event.athleteId) action.credits.forEach((key) => credit(stats, event.athleteId!, key));
    if (event.assistAthleteId) credit(stats, event.assistAthleteId, "assists");

    if (isVolleyball && volleyballSetClosed(current, periods.length + 1, maxSets)) {
      closePeriod();
      const won = sport.score.final(periods);
      if (won.us >= setsToWin || won.them >= setsToWin) finished = true;
    }
  });

  const score = isVolleyball ? sport.score.final(periods) : sport.score.final([...periods, current]);
  return {
    periods,
    current,
    currentNumber: periods.length + 1,
    score,
    finished,
    winner: finished ? winnerOf(sport.score.final(periods)) : null,
    stats,
    issues,
    alerts: computeAlerts(sport, stats, fouls),
  };
}
