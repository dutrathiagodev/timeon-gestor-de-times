import { describe, expect, it } from "vitest";
import { computeLive } from "@/sports/live/engine";
import { addEvent, undoLast } from "@/sports/live/log";
import { ev, repeat } from "@/sports/live/test-helpers";
import type { LiveEvent } from "@/sports/live/types";
import { getSport } from "@/sports/registry";

const volleyball = getSport("volleyball");
const us = (n: number) => repeat(n, () => ev("opponent_error"));
const them = (n: number) => repeat(n, () => ev("opponent_point"));

/** Joga um set até o placar dado, alternando os pontos para chegar sem fechar antes da hora. */
function set(usPoints: number, themPoints: number): LiveEvent[] {
  const events: LiveEvent[] = [];
  let u = 0;
  let t = 0;
  while (u < usPoints || t < themPoints) {
    if (u < usPoints && u <= t) {
      events.push(ev("opponent_error"));
      u++;
    } else if (t < themPoints) {
      events.push(ev("opponent_point"));
      t++;
    } else {
      events.push(ev("opponent_error"));
      u++;
    }
  }
  return events;
}

describe("vôlei ao vivo: pontos", () => {
  it("cada rally vale 1 ponto para quem ganha a jogada", () => {
    const state = computeLive(volleyball, [
      ev("attack_kill", "a"),
      ev("serve_ace", "b"),
      ev("block_point", "c"),
      ev("opponent_error"),
      ev("attack_error", "a"),
      ev("our_error"),
      ev("opponent_point"),
    ]);
    expect(state.current).toEqual({ us: 4, them: 3 });
    expect(state.issues).toEqual([]);
  });

  it("credita a estatística do atleta e o contador sem ponto", () => {
    const state = computeLive(volleyball, [
      ev("attack_kill", "a"),
      ev("attack_kill", "a"),
      ev("attack_error", "a"),
      ev("dig", "b"),
      ev("pass_a", "b"),
    ]);
    expect(state.stats.a).toEqual({ attack_kill: 2, attack_error: 1 });
    expect(state.stats.b).toEqual({ dig: 1, pass_a: 1 });
    // dig e pass_a não mexem no placar
    expect(state.current).toEqual({ us: 2, them: 1 });
  });
});

describe("vôlei ao vivo: sets", () => {
  it("o set fecha sozinho em 25 com 2 de diferença", () => {
    const state = computeLive(volleyball, set(25, 20));
    expect(state.periods).toEqual([{ us: 25, them: 20 }]);
    expect(state.current).toEqual({ us: 0, them: 0 });
    expect(state.currentNumber).toBe(2);
    expect(state.score).toEqual({ us: 1, them: 0 });
  });

  it("25 a 24 não fecha; 26 a 24 fecha", () => {
    const open = computeLive(volleyball, [...set(24, 24), ...us(1)]);
    expect(open.periods).toEqual([]);
    expect(open.current).toEqual({ us: 25, them: 24 });
    const closed = computeLive(volleyball, [...set(24, 24), ...us(2)]);
    expect(closed.periods).toEqual([{ us: 26, them: 24 }]);
  });

  it("o set passa de 25 enquanto não houver 2 de diferença", () => {
    const closed = computeLive(volleyball, [...set(28, 28), ...us(2)]);
    expect(closed.periods).toEqual([{ us: 30, them: 28 }]);
    // 29 a 28, 29 a 29 e 31 a 29: só o último fecha
    const long = computeLive(volleyball, [...set(28, 28), ...us(1), ...them(1), ...us(2)]);
    expect(long.periods).toEqual([{ us: 31, them: 29 }]);
    const open = computeLive(volleyball, [...set(28, 28), ...us(1), ...them(1)]);
    expect(open.periods).toEqual([]);
  });

  it("set que o adversário ganha vira ponto de set para ele", () => {
    const state = computeLive(volleyball, set(10, 25));
    expect(state.score).toEqual({ us: 0, them: 1 });
  });

  it("o quinto set vai a 15, não a 25", () => {
    const events = [
      ...set(25, 20),
      ...set(20, 25),
      ...set(25, 20),
      ...set(20, 25),
      ...set(15, 13),
    ];
    const state = computeLive(volleyball, events);
    expect(state.periods).toHaveLength(5);
    expect(state.periods[4]).toEqual({ us: 15, them: 13 });
    expect(state.finished).toBe(true);
    expect(state.winner).toBe("us");
    expect(state.score).toEqual({ us: 3, them: 2 });
  });

  it("15 a 14 no quinto set não fecha", () => {
    const events = [...set(25, 20), ...set(20, 25), ...set(25, 20), ...set(20, 25), ...set(14, 14), ...us(1)];
    const state = computeLive(volleyball, events);
    expect(state.finished).toBe(false);
    expect(state.current).toEqual({ us: 15, them: 14 });
  });

  it("a partida termina no terceiro set e recusa o que vier depois", () => {
    const events = [...set(25, 10), ...set(25, 12), ...set(25, 14), ev("opponent_error")];
    const state = computeLive(volleyball, events);
    expect(state.finished).toBe(true);
    expect(state.winner).toBe("us");
    expect(state.score).toEqual({ us: 3, them: 0 });
    expect(state.issues.map((i) => i.code)).toEqual(["match_finished"]);
    expect(state.periods).toHaveLength(3);
  });

  it("o adversário também pode vencer em 3 sets", () => {
    const state = computeLive(volleyball, [...set(10, 25), ...set(12, 25), ...set(14, 25)]);
    expect(state.winner).toBe("them");
  });
});

describe("vôlei ao vivo: encerrar", () => {
  it("encerrar set na mão é recusado (o set fecha sozinho)", () => {
    const state = computeLive(volleyball, [...us(3), ev("end_period")]);
    expect(state.issues.map((i) => i.code)).toEqual(["set_closes_automatically"]);
    expect(state.current).toEqual({ us: 3, them: 0 });
  });

  it("encerrar o jogo antes de haver vencedor é recusado", () => {
    const state = computeLive(volleyball, [...set(25, 20), ev("finish")]);
    expect(state.finished).toBe(false);
    expect(state.issues.map((i) => i.code)).toContain("match_undecided");
  });

  it("encerrar depois da vitória é aceito e não gera problema", () => {
    const state = computeLive(volleyball, [...set(25, 10), ...set(25, 12), ...set(25, 14), ev("finish")]);
    expect(state.issues).toEqual([]);
    expect(state.finished).toBe(true);
  });
});

describe("vôlei ao vivo: desfazer", () => {
  it("desfazer o ponto que fechou o set reabre o set", () => {
    const events = set(25, 20);
    expect(computeLive(volleyball, events).periods).toHaveLength(1);
    const state = computeLive(volleyball, undoLast(events));
    expect(state.periods).toHaveLength(0);
    expect(state.current).toEqual({ us: 24, them: 20 });
  });

  it("desfazer o ponto que terminou a partida volta o jogo ao vivo", () => {
    const events = [...set(25, 10), ...set(25, 12), ...set(25, 14)];
    expect(computeLive(volleyball, events).finished).toBe(true);
    expect(computeLive(volleyball, undoLast(events)).finished).toBe(false);
  });

  it("desfazer também tira a estatística do atleta", () => {
    const events = [ev("attack_kill", "a"), ev("attack_kill", "a")];
    expect(computeLive(volleyball, undoLast(events)).stats.a).toEqual({ attack_kill: 1 });
  });

  it("lista vazia continua vazia", () => {
    expect(undoLast([])).toEqual([]);
  });
});

describe("vôlei ao vivo: addEvent", () => {
  it("aceita lance válido e devolve o estado novo", () => {
    const result = addEvent(volleyball, [], ev("attack_kill", "a"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.current.us).toBe(1);
      expect(result.events).toHaveLength(1);
    }
  });

  it("recusa lance sem atleta e mantém a lista", () => {
    const base = [ev("attack_kill", "a")];
    const result = addEvent(volleyball, base, ev("attack_kill"));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues[0].code).toBe("athlete_required");
    expect(base).toHaveLength(1);
  });

  it("recusa lance depois do fim do jogo", () => {
    const over = [...set(25, 10), ...set(25, 12), ...set(25, 14)];
    const result = addEvent(volleyball, over, ev("opponent_error"));
    expect(result.ok).toBe(false);
  });
});
