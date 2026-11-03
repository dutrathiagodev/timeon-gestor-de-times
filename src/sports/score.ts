import type { Issue, Period, ScoreRules } from "./types";

function sum(periods: Period[]) {
  return periods.reduce(
    (acc, p) => ({ us: acc.us + p.us, them: acc.them + p.them }),
    { us: 0, them: 0 },
  );
}

function invalidValues(periods: Period[]): Issue[] {
  const issues: Issue[] = [];
  periods.forEach((p, i) => {
    for (const value of [p.us, p.them]) {
      if (!Number.isInteger(value) || value < 0) {
        issues.push({
          code: "invalid_value",
          message: "Placar deve ser um número inteiro maior ou igual a zero.",
          period: i + 1,
        });
        break;
      }
    }
  });
  return issues;
}

type PeriodsOptions = {
  periods: number;
  maxExtraPeriods: number;
  allowDraw: boolean;
};

/** Placar por períodos somados: gols (futebol, handebol) ou pontos (basquete). */
export function periodsScore({
  periods,
  maxExtraPeriods,
  allowDraw,
}: PeriodsOptions): ScoreRules {
  return {
    model: "periods",
    periods,
    maxExtraPeriods,
    final: sum,
    validate(list) {
      const issues = invalidValues(list);
      if (list.length < periods) {
        issues.push({
          code: "periods_missing",
          message: `A partida tem ${periods} períodos; faltam resultados.`,
        });
      }
      if (list.length > periods + maxExtraPeriods) {
        issues.push({
          code: "periods_exceeded",
          message: `Máximo de ${periods + maxExtraPeriods} períodos.`,
        });
      }
      if (!allowDraw && !issues.length) {
        const total = sum(list);
        if (total.us === total.them) {
          issues.push({
            code: "draw_not_allowed",
            message: "Este esporte não termina empatado; registre a prorrogação.",
          });
        }
      }
      return issues;
    },
  };
}

const SETS_TO_WIN = 3;
const SET_POINTS = 25;
const TIE_BREAK_POINTS = 15;

function setWinner(set: Period) {
  return set.us > set.them ? "us" : "them";
}

/** Vôlei: melhor de 5 sets (3 vencem); 25 pontos, 15 no 5º; 2 de diferença. */
export function setsScore(maxSets = 5): ScoreRules {
  return {
    model: "sets",
    periods: maxSets,
    maxExtraPeriods: 0,
    final(list) {
      return list.reduce(
        (acc, set) => {
          if (set.us === set.them) return acc;
          acc[setWinner(set)] += 1;
          return acc;
        },
        { us: 0, them: 0 },
      );
    },
    validate(list) {
      const issues = invalidValues(list);
      if (issues.length) return issues;

      if (list.length > maxSets) {
        issues.push({ code: "periods_exceeded", message: `Máximo de ${maxSets} sets.` });
      }

      const won = { us: 0, them: 0 };
      list.forEach((set, i) => {
        const number = i + 1;
        if (won.us === SETS_TO_WIN || won.them === SETS_TO_WIN) {
          issues.push({
            code: "after_decided",
            message: "A partida já estava decidida antes deste set.",
            period: number,
          });
          return;
        }
        const target = number === maxSets ? TIE_BREAK_POINTS : SET_POINTS;
        const high = Math.max(set.us, set.them);
        const low = Math.min(set.us, set.them);
        const closedAtTarget = high === target && target - low >= 2;
        const closedInExtra = high > target && high - low === 2;
        if (closedAtTarget || closedInExtra) {
          won[setWinner(set)] += 1;
        } else {
          issues.push({
            code: "set_invalid",
            message: `Set deve terminar com ${target} pontos e 2 de diferença.`,
            period: number,
          });
        }
      });

      if (!issues.length && won.us !== SETS_TO_WIN && won.them !== SETS_TO_WIN) {
        issues.push({
          code: "match_undecided",
          message: `Nenhum time venceu ${SETS_TO_WIN} sets.`,
        });
      }
      return issues;
    },
  };
}
