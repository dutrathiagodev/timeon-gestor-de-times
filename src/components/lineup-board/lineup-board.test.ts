import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LineupBoard, { type BoardAthlete } from "@/components/lineup-board/lineup-board";
import { emptyLineup, type Lineup } from "@/sports/lineup";
import { getSport } from "@/sports/registry";
import type { SportKey } from "@/sports/types";

const athletes: BoardAthlete[] = [
  { id: "a", name: "Ana Souza", positionKey: "setter", shirtNumber: 10 },
  { id: "b", name: "Bia Lima", positionKey: "outside", shirtNumber: 7 },
  { id: "l", name: "Lia Rocha", positionKey: "libero", shirtNumber: 1 },
  { id: "c", name: "Carla Dias", positionKey: "middle" },
];

function render(sportKey: SportKey, value?: (empty: Lineup) => Lineup, formationIndex = 0) {
  const sport = getSport(sportKey);
  const formation = sport.formations[formationIndex];
  const lineup = value ? value(emptyLineup(formation)) : emptyLineup(formation);
  return renderToStaticMarkup(
    createElement(LineupBoard, { sport, formation, athletes, value: lineup, onChange: () => {} }),
  );
}

describe("LineupBoard", () => {
  it.each([
    ["volleyball", 7],
    ["futsal", 5],
    ["football_society", 7],
    ["football_field", 11],
    ["basketball", 5],
    ["handball", 7],
  ] as const)("%s desenha um botão por slot (%i)", (sportKey, count) => {
    const html = render(sportKey);
    expect(html.match(/class="board-slot /g)).toHaveLength(count);
    expect(html).toContain(`board-${getSport(sportKey).family}`);
  });

  it("posiciona os slots pelas coordenadas da formação", () => {
    const html = render("volleyball");
    expect(html).toContain("left:83%;top:64%");
    expect(html).toContain("left:17%;top:24%");
  });

  it("slot vazio e preenchido têm rótulo acessível", () => {
    const html = render("volleyball", (e) => ({ ...e, P1: "a" }));
    expect(html).toContain('aria-label="P1 · Levantador: Ana Souza"');
    expect(html).toContain('aria-label="P2 · Ponteiro: vazio"');
  });

  it("banco lista só quem não está em campo, com a contagem", () => {
    const html = render("volleyball", (e) => ({ ...e, P1: "a" }));
    expect(html).toContain("Banco (3)");
    expect(html).not.toMatch(/board-bench-text"><strong>Ana Souza/);
    expect(html).toContain("Bia Lima");
  });

  it("todos em campo mostra a mensagem do banco vazio", () => {
    const html = render("volleyball", (e) => ({ ...e, P1: "a", P2: "b", P3: "c", L: "l" }));
    expect(html).toContain("Banco (0)");
    expect(html).toContain("Todos os atletas estão em campo.");
  });

  it("posição trocada vira alerta no slot, no rótulo e na lista", () => {
    const html = render("volleyball", (e) => ({ ...e, P1: "c" }));
    expect(html).toContain("has-issue");
    expect(html).toContain("Alerta: ");
    expect(html).toContain('aria-label="Alertas da escalação"');
    expect(html).toContain("Central");
  });

  it("líbero na rede é avisado", () => {
    const html = render("volleyball", (e) => ({ ...e, P3: "l" }));
    expect(html).toContain("Líbero não pode jogar na rede (P3).");
  });

  it("escalação correta não mostra lista de alertas", () => {
    const html = render("volleyball", (e) => ({ ...e, P1: "a", P2: "b", L: "l" }));
    expect(html).not.toContain("has-issue");
    expect(html).not.toContain("Alertas da escalação");
  });

  it("slot vazio mostra a posição do futebol, e o do vôlei mostra P1 a P6", () => {
    expect(render("futsal")).toContain(">GOL<");
    expect(render("volleyball")).toContain(">P4<");
  });

  it("controles são botões, e a região viva existe", () => {
    const html = render("futsal");
    expect(html).toContain('role="status"');
    expect(html).not.toMatch(/<div[^>]*onclick/i);
    expect(html).toContain('role="group"');
  });

  it("escapa o nome do atleta", () => {
    const sport = getSport("futsal");
    const formation = sport.formations[0];
    const html = renderToStaticMarkup(
      createElement(LineupBoard, {
        sport,
        formation,
        athletes: [{ id: "x", name: '<script>alert(1)</script>' }],
        value: emptyLineup(formation),
        onChange: () => {},
      }),
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
