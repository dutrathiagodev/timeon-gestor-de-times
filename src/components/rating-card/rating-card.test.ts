import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RatingCard, { type RatingCardPlayer } from "@/components/rating-card/rating-card";
import { ratingTier } from "@/components/rating-card/tier";
import { getSport } from "@/sports/registry";

function render(
  sportKey: Parameters<typeof getSport>[0],
  player: RatingCardPlayer,
  totals: Record<string, number> = {},
  extra: { form?: number; caption?: string; games?: number } = {},
) {
  const sport = getSport(sportKey);
  const rating = sport.rating({
    totals,
    games: extra.games ?? 0,
    position: player.positionKey,
  });
  return {
    rating,
    html: renderToStaticMarkup(
      createElement(RatingCard, { sport, rating, player, form: extra.form, caption: extra.caption }),
    ),
  };
}

describe("RatingCard", () => {
  it("mostra a nota, o nome, a posição do esporte e a camisa", () => {
    const { html, rating } = render("volleyball", {
      name: "Ana Souza",
      positionKey: "outside",
      shirtNumber: 7,
    });
    expect(html).toContain(`>${rating.overall}<`);
    expect(html).toContain("Ana Souza");
    expect(html).toContain("Ponteiro");
    expect(html).toContain("Camisa #7");
  });

  it("lista os atributos do esporte na ordem do módulo", () => {
    const { html } = render("volleyball", { name: "Ana", positionKey: "setter" });
    const shorts = [...html.matchAll(/<dt[^>]*>([A-Z0-9]+)<\/dt>/g)].map((m) => m[1]);
    expect(shorts).toEqual(["ATQ", "PAS", "SAQ", "TOQ", "BLQ", "NOC", "PUL"]);
  });

  it("goleiro vê GOL e não vê atributos de linha", () => {
    const { html } = render("futsal", { name: "Beto", positionKey: "goalkeeper" });
    expect(html).toContain(">GOL<");
    expect(html).not.toContain(">FIN<");
    expect(html).not.toContain(">DRI<");
  });

  it("basquete mostra 3PT e REB", () => {
    const { html } = render("basketball", { name: "Caio", positionKey: "center" });
    expect(html).toContain(">3PT<");
    expect(html).toContain(">REB<");
  });

  it("faixa da nota vira classe do card", () => {
    const strong = Object.fromEntries(
      ["pass_a", "set_good", "serve_ace", "attack_kill", "block_point", "reading_good", "jump_good"].map(
        (key) => [key, 40],
      ),
    );
    const elite = render("volleyball", { name: "Top", positionKey: "opposite" }, strong, { games: 4 });
    expect(ratingTier(elite.rating.overall)).toBe("elite");
    expect(elite.html).toContain("overall-card is-elite");

    const weak = render("volleyball", { name: "Novo", positionKey: "libero" }, { pass_c: 30, serve_error: 30 }, { games: 3 });
    expect(ratingTier(weak.rating.overall)).not.toBe("elite");
    expect(weak.html).toContain(`overall-card is-${ratingTier(weak.rating.overall)}`);
  });

  it("sem foto mostra as iniciais; com foto usa a URL e alt vazio", () => {
    const without = render("futsal", { name: "Ana Souza", positionKey: "ala" });
    expect(without.html).toContain(">AS<");
    expect(without.html).not.toContain("<img");

    const withPhoto = render("futsal", {
      name: "Ana Souza",
      positionKey: "ala",
      photoUrl: "https://exemplo.test/a.webp?token=x",
    });
    expect(withPhoto.html).toContain('src="https://exemplo.test/a.webp?token=x"');
    expect(withPhoto.html).toContain('alt=""');
  });

  it("sem camisa mostra o texto padrão", () => {
    const { html } = render("handball", { name: "Duda", positionKey: "pivot", shirtNumber: null });
    expect(html).toContain("Sem camisa definida");
  });

  it("forma: sinal e cor só quando informada; zero é neutro", () => {
    const player = { name: "Eva", positionKey: "wing" };
    expect(render("handball", player).html).not.toContain("forma");
    expect(render("handball", player, {}, { form: 5 }).html).toContain("tone-success");
    expect(render("handball", player, {}, { form: 5 }).html).toContain("+5 forma");
    expect(render("handball", player, {}, { form: -2 }).html).toContain("tone-danger");
    const zero = render("handball", player, {}, { form: 0 }).html;
    expect(zero).toContain("tone-neutral");
    expect(zero).not.toContain("tone-success");
  });

  it("descreve o card para leitores de tela", () => {
    const { html, rating } = render("basketball", { name: "Caio", positionKey: "center" });
    expect(html).toContain(`aria-label="Caio, Basquete, nota ${rating.overall} de 99"`);
  });

  it("escapa o nome do atleta", () => {
    const { html } = render("futsal", { name: '<img src=x onerror="alert(1)">', positionKey: "ala" });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img");
  });
});
