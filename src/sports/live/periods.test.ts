import { describe, expect, it } from "vitest";
import { computeLive } from "@/sports/live/engine";
import { ev, repeat } from "@/sports/live/test-helpers";
import { getSport } from "@/sports/registry";

const codes = (state: { issues: { code: string }[] }) => state.issues.map((i) => i.code);

describe("basquete ao vivo", () => {
  const basketball = getSport("basketball");

  it("cesta de 2, de 3 e lance livre somam 2, 3 e 1", () => {
    const state = computeLive(basketball, [
      ev("fg2_made", "a"),
      ev("fg3_made", "b"),
      ev("ft_made", "c"),
      ev("opponent_fg2"),
      ev("opponent_fg3"),
      ev("opponent_ft"),
    ]);
    expect(state.current).toEqual({ us: 6, them: 6 });
    expect(state.score).toEqual({ us: 6, them: 6 });
  });

  it("cesta conta acerto e tentativa; errada conta só tentativa", () => {
    const state = computeLive(basketball, [
      ev("fg3_made", "a"),
      ev("fg3_miss", "a"),
      ev("fg3_miss", "a"),
      ev("ft_miss", "a"),
    ]);
    expect(state.stats.a).toEqual({ fg3_made: 1, fg3_att: 3, ft_att: 1 });
  });

  it("assistência vai para quem passou, e não para quem fez a cesta", () => {
    const state = computeLive(basketball, [ev("fg2_made", "a", "b")]);
    expect(state.stats.a).toEqual({ fg2_made: 1, fg2_att: 1 });
    expect(state.stats.b).toEqual({ assists: 1 });
  });

  it("recusa assistência de quem fez a cesta e assistência em lance sem ponto", () => {
    expect(codes(computeLive(basketball, [ev("fg2_made", "a", "a")]))).toEqual(["assist_same_athlete"]);
    expect(codes(computeLive(basketball, [ev("fg2_miss", "a", "b")]))).toEqual(["assist_not_allowed"]);
  });

  it("quartos somam no placar do jogo e o placar do quarto fica separado", () => {
    const state = computeLive(basketball, [
      ev("fg2_made", "a"),
      ev("end_period"),
      ev("fg3_made", "a"),
    ]);
    expect(state.periods).toEqual([{ us: 2, them: 0 }]);
    expect(state.current).toEqual({ us: 3, them: 0 });
    expect(state.score).toEqual({ us: 5, them: 0 });
    expect(state.currentNumber).toBe(2);
  });

  it("não termina empatado: pede prorrogação", () => {
    const quarters = [
      ev("fg2_made", "a"),
      ev("opponent_fg2"),
      ev("end_period"),
      ev("end_period"),
      ev("end_period"),
    ];
    const tied = computeLive(basketball, [...quarters, ev("finish")]);
    expect(tied.finished).toBe(false);
    expect(codes(tied)).toContain("draw_not_allowed");

    const overtime = computeLive(basketball, [
      ...quarters,
      ev("end_period"),
      ev("fg2_made", "a"),
      ev("finish"),
    ]);
    expect(overtime.issues).toEqual([]);
    expect(overtime.finished).toBe(true);
    expect(overtime.winner).toBe("us");
    expect(overtime.periods).toHaveLength(5);
  });

  it("não aceita mais de 8 períodos (4 + 4 de prorrogação)", () => {
    const state = computeLive(basketball, repeat(8, () => ev("end_period")));
    expect(codes(state)).toEqual(["periods_exceeded"]);
    expect(state.periods).toHaveLength(7);
  });

  it("5 faltas avisam que o atleta deve sair", () => {
    const four = computeLive(basketball, repeat(4, () => ev("fouls", "a")));
    expect(four.alerts).toEqual([]);
    const five = computeLive(basketball, repeat(5, () => ev("fouls", "a")));
    expect(five.alerts).toEqual([
      expect.objectContaining({ code: "foul_out", athleteId: "a" }),
    ]);
  });
});

describe("futebol, futsal e handebol ao vivo", () => {
  const futsal = getSport("futsal");

  it("gol vale 1, conta gol e finalização no alvo, e a assistência vai ao outro atleta", () => {
    const state = computeLive(futsal, [ev("goal", "a", "b"), ev("opponent_goal")]);
    expect(state.current).toEqual({ us: 1, them: 1 });
    expect(state.stats.a).toEqual({ goals: 1, shots_on: 1 });
    expect(state.stats.b).toEqual({ assists: 1 });
  });

  it("gol sofrido credita o goleiro quando ele é indicado", () => {
    const state = computeLive(futsal, [ev("opponent_goal", "gk"), ev("opponent_goal")]);
    expect(state.stats.gk).toEqual({ goals_conceded: 1 });
    expect(state.current.them).toBe(2);
  });

  it("dois tempos, e o jogo pode terminar empatado", () => {
    const state = computeLive(futsal, [
      ev("goal", "a"),
      ev("end_period"),
      ev("opponent_goal"),
      ev("finish"),
    ]);
    expect(state.issues).toEqual([]);
    expect(state.finished).toBe(true);
    expect(state.winner).toBe("draw");
    expect(state.periods).toEqual([
      { us: 1, them: 0 },
      { us: 0, them: 1 },
    ]);
  });

  it("encerrar sem ter fechado o primeiro tempo fecha o tempo em andamento e pede o segundo", () => {
    const state = computeLive(futsal, [ev("goal", "a"), ev("finish")]);
    expect(state.finished).toBe(false);
    expect(codes(state)).toEqual(["periods_missing"]);
  });

  it("tempo sem gol conta como tempo jogado ao encerrar", () => {
    const state = computeLive(futsal, [ev("goal", "a"), ev("end_period"), ev("finish")]);
    expect(state.finished).toBe(true);
    expect(state.periods).toEqual([
      { us: 1, them: 0 },
      { us: 0, them: 0 },
    ]);
    expect(state.winner).toBe("us");
  });

  it("5 faltas do time no tempo avisam, para cada lado, e zeram no tempo seguinte", () => {
    const ours = computeLive(futsal, repeat(5, () => ev("fouls", "a")));
    expect(ours.alerts).toEqual([expect.objectContaining({ code: "team_fouls", side: "us" })]);

    const theirs = computeLive(futsal, repeat(5, () => ev("opponent_foul")));
    expect(theirs.alerts).toEqual([expect.objectContaining({ code: "team_fouls", side: "them" })]);

    const reset = computeLive(futsal, [...repeat(5, () => ev("fouls", "a")), ev("end_period")]);
    expect(reset.alerts).toEqual([]);

    const four = computeLive(futsal, [...repeat(4, () => ev("fouls", "a")), ev("fouls", "b")]);
    expect(four.alerts).toHaveLength(1);
    const three = computeLive(futsal, repeat(4, () => ev("fouls", "a")));
    expect(three.alerts).toEqual([]);
  });

  it("segundo amarelo avisa vermelho; vermelho avisa expulsão", () => {
    const field = getSport("football_field");
    const one = computeLive(field, [ev("yellow", "a")]);
    expect(one.alerts).toEqual([]);
    const two = computeLive(field, [ev("yellow", "a"), ev("yellow", "a")]);
    expect(two.alerts).toEqual([expect.objectContaining({ code: "second_yellow", athleteId: "a" })]);
    const red = computeLive(field, [ev("red", "b")]);
    expect(red.alerts).toEqual([expect.objectContaining({ code: "sent_off", athleteId: "b" })]);
    const both = computeLive(field, [ev("yellow", "a"), ev("yellow", "a"), ev("red", "a")]);
    expect(both.alerts.map((a) => a.code)).toEqual(["sent_off"]);
  });

  it("handebol: gol conta arremesso, arremesso sem gol também, e 3 exclusões avisam", () => {
    const handball = getSport("handball");
    const state = computeLive(handball, [
      ev("goal", "a"),
      ev("shot_miss", "a"),
      ev("opponent_goal"),
      ev("suspensions_2min", "b"),
      ev("suspensions_2min", "b"),
    ]);
    expect(state.stats.a).toEqual({ goals: 1, shots: 2 });
    expect(state.current).toEqual({ us: 1, them: 1 });
    expect(state.alerts).toEqual([]);
    const three = computeLive(handball, repeat(3, () => ev("suspensions_2min", "b")));
    expect(three.alerts).toEqual([expect.objectContaining({ code: "disqualification", athleteId: "b" })]);
  });

  it("depois de encerrado não aceita lance", () => {
    const state = computeLive(futsal, [ev("goal", "a"), ev("end_period"), ev("finish"), ev("goal", "a")]);
    expect(codes(state)).toEqual(["match_finished"]);
    expect(state.score).toEqual({ us: 1, them: 0 });
  });
});
