import { describe, expect, it } from "vitest";
import { computeLive } from "@/sports/live/engine";
import { liveActions } from "@/sports/live/actions";
import { addEvent, undoLast } from "@/sports/live/log";
import { ev } from "@/sports/live/test-helpers";
import type { LiveEvent } from "@/sports/live/types";
import { getSport, sports } from "@/sports/registry";

const codes = (events: LiveEvent[], key: Parameters<typeof getSport>[0] = "futsal") =>
  computeLive(getSport(key), events).issues.map((i) => i.code);

describe("validação dos lances", () => {
  it("lance desconhecido", () => {
    expect(codes([ev("teletransporte", "a")])).toEqual(["unknown_action"]);
    expect(codes([ev("fg2_made", "a")])).toEqual(["unknown_action"]); // lance de basquete no futsal
  });

  it("atleta obrigatório, e lance do adversário não aceita atleta nosso", () => {
    expect(codes([ev("goal")])).toEqual(["athlete_required"]);
    expect(codes([ev("opponent_foul", "a")])).toEqual(["athlete_not_allowed"]);
  });

  it("goleiro é opcional no gol sofrido do futsal", () => {
    expect(codes([ev("opponent_goal"), ev("opponent_goal", "gk")])).toEqual([]);
  });

  it("lance recusado não altera placar nem estatística, e diz a posição do lance", () => {
    const state = computeLive(getSport("futsal"), [ev("goal", "a"), ev("goal"), ev("goal", "a")]);
    expect(state.current.us).toBe(2);
    expect(state.stats.a).toEqual({ goals: 2, shots_on: 2 });
    expect(state.issues).toEqual([expect.objectContaining({ code: "athlete_required", eventIndex: 2 })]);
  });

  it("assistência só em lance que aceita", () => {
    expect(codes([ev("tackles", "a", "b")])).toEqual(["assist_not_allowed"]);
  });
});

describe("pureza do motor", () => {
  it("a mesma lista dá o mesmo estado", () => {
    const events = [ev("goal", "a", "b"), ev("end_period"), ev("opponent_goal", "gk")];
    expect(computeLive(getSport("futsal"), events)).toEqual(computeLive(getSport("futsal"), events));
  });

  it("não altera a lista recebida", () => {
    const events = [ev("goal", "a"), ev("end_period")];
    const copy = JSON.parse(JSON.stringify(events));
    computeLive(getSport("futsal"), events);
    expect(events).toEqual(copy);
  });

  it("lista vazia é um jogo no zero, em andamento", () => {
    const state = computeLive(getSport("basketball"), []);
    expect(state).toMatchObject({
      periods: [],
      current: { us: 0, them: 0 },
      currentNumber: 1,
      score: { us: 0, them: 0 },
      finished: false,
      winner: null,
      issues: [],
      alerts: [],
    });
  });
});

/** Gerador pseudo-aleatório fixo, para o teste repetir sempre a mesma sequência. */
function lcg(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("sequências aleatórias", () => {
  it.each(Object.values(sports))("$name: nenhuma sequência quebra o motor nem gera placar ou estatística negativa", (sport) => {
    const actions = [...liveActions(sport).map((a) => a.key), "end_period", "finish"];
    const random = lcg(42);
    for (let round = 0; round < 40; round++) {
      const events: LiveEvent[] = [];
      for (let i = 0; i < 120; i++) {
        const action = actions[Math.floor(random() * actions.length)];
        const athlete = random() < 0.85 ? `p${Math.floor(random() * 6)}` : null;
        const assist = random() < 0.2 ? `p${Math.floor(random() * 6)}` : null;
        events.push(ev(action, athlete, assist));
      }
      const state = computeLive(sport, events);
      expect(state.score.us).toBeGreaterThanOrEqual(0);
      expect(state.score.them).toBeGreaterThanOrEqual(0);
      expect(state.current.us).toBeGreaterThanOrEqual(0);
      for (const row of Object.values(state.stats)) {
        for (const value of Object.values(row)) expect(value).toBeGreaterThanOrEqual(0);
      }
      expect(state.periods.length).toBeLessThanOrEqual(sport.score.periods + sport.score.maxExtraPeriods);
      if (state.finished) expect(state.winner).not.toBeNull();
    }
  });

  it.each(["volleyball", "basketball", "futsal"] as const)(
    "%s: acrescentar lances e desfazer um por um repassa os mesmos estados, ao contrário",
    (key) => {
      const sport = getSport(key);
      const actions = liveActions(sport).map((a) => a.key);
      const random = lcg(7);
      let events: LiveEvent[] = [];
      const history = [computeLive(sport, events)];
      for (let i = 0; i < 200; i++) {
        const action = actions[Math.floor(random() * actions.length)];
        const result = addEvent(sport, events, ev(action, `p${Math.floor(random() * 5)}`));
        if (!result.ok) continue;
        events = result.events;
        history.push(result.state);
      }
      expect(events.length).toBeGreaterThan(20);
      for (let n = history.length - 1; n >= 1; n--) {
        expect(computeLive(sport, events)).toEqual(history[n]);
        events = undoLast(events);
      }
      expect(computeLive(sport, events)).toEqual(history[0]);
      expect(events).toEqual([]);
    },
  );
});
