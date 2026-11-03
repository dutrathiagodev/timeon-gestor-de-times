import { describe, expect, it } from "vitest";
import { buildCalendar, kindLabel, type CalendarItem } from "./calendar-rules";

const item = (id: string, date: string, teamId: string, title = id): CalendarItem => ({
  id,
  date,
  title,
  teamId,
  sportKey: "volleyball",
  kind: "AMISTOSO",
});

describe("calendário geral", () => {
  it("ordena por dia e agrupa em meses e dias", () => {
    const months = buildCalendar([
      item("c", "2026-12-02", "futsal"),
      item("a", "2026-11-10", "volei"),
      item("b", "2026-11-10", "futsal"),
    ]);
    expect(months.map((m) => m.key)).toEqual(["2026-11", "2026-12"]);
    expect(months[0].days).toHaveLength(1);
    expect(months[0].days[0].items.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("filtra por time; sem filtro mostra todos", () => {
    const list = [item("a", "2026-11-10", "volei"), item("b", "2026-11-11", "futsal")];
    expect(buildCalendar(list, ["futsal"]).flatMap((m) => m.days.flatMap((d) => d.items.map((i) => i.id)))).toEqual(["b"]);
    expect(buildCalendar(list)).toHaveLength(1);
    expect(buildCalendar(list, [])[0].days).toHaveLength(2);
  });

  it("data inválida não entra e lista vazia dá calendário vazio", () => {
    expect(buildCalendar([item("a", "ontem", "volei"), item("b", "", "volei")])).toEqual([]);
    expect(buildCalendar([])).toEqual([]);
  });

  it("nomes dos tipos de jogo, com padrão para desconhecido", () => {
    expect(kindLabel("league")).toBe("Liga");
    expect(kindLabel("CAMPEONATO")).toBe("Campeonato");
    expect(kindLabel("algo")).toBe("Outro");
  });
});
