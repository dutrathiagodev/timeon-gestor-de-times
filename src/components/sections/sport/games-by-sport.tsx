"use client";

import TopBar from "@/components/layout/top-bar";
import GamesClient from "@/components/sections/games/games";
import { getSport } from "@/sports/registry";
import { NoTeam } from "./players-by-sport";
import { useSportTeam } from "./sport-team";

type Props = Parameters<typeof GamesClient>[0];

function scoreText(sportKey: Parameters<typeof getSport>[0]) {
  const { score } = getSport(sportKey);
  if (score.model === "sets") {
    return `Melhor de ${score.periods} sets: 25 pontos (15 no último), com 2 de diferença.`;
  }
  const extra = score.maxExtraPeriods > 0 ? ` Até ${score.maxExtraPeriods} prorrogações.` : "";
  return `${score.periods} ${sportKey === "basketball" ? "quartos" : "tempos"}, placar somado.${extra}`;
}

/** Jogos do time ativo. O vôlei mantém o calendário atual; as demais modalidades mostram as regras de jogo. */
export default function GamesBySport(props: Props) {
  const { team } = useSportTeam();
  if (!team) return <NoTeam title="Jogos" />;
  if (team.sportKey === "volleyball") return <GamesClient {...props} />;

  const sport = getSport(team.sportKey);
  return (
    <div className="page-shell">
      <TopBar
        title="Jogos"
        badge={`${sport.name} · ${team.name}`}
        description="Agenda e resultados do time."
      />

      <section className="section-block" aria-labelledby="rules-title">
        <h2 id="rules-title">Regras de {sport.name} neste sistema</h2>
        <dl className="rules-list">
          <div>
            <dt>Em campo</dt>
            <dd>{sport.playersOnField} atletas, até {sport.maxBench} no banco</dd>
          </div>
          <div>
            <dt>Placar</dt>
            <dd>{scoreText(sport.key)}</dd>
          </div>
          <div>
            <dt>Esquemas de escalação</dt>
            <dd>{sport.formations.map((formation) => formation.label).join(", ")}</dd>
          </div>
          <div>
            <dt>Estatísticas do jogo</dt>
            <dd>{sport.stats.length} tipos de lance registrados ao vivo</dd>
          </div>
        </dl>
      </section>

      <section className="empty-state">
        <h2>Agenda deste time</h2>
        <p>
          A agenda do banco (só gestor e administração criam jogos) ainda não está ligada a esta tela.
          Quando estiver, os jogos aparecem aqui com o tipo (amistoso, treino, liga) e o placar nas regras de {sport.name}.
        </p>
      </section>
    </div>
  );
}
