"use client";

import TopBar from "@/components/layout/top-bar";
import { useLocalRoster } from "@/components/lineup-board/local-roster";
import RatingCard from "@/components/rating-card/rating-card";
import StatisticsClient from "@/components/sections/statistics/statistics";
import { getSport } from "@/sports/registry";
import { NoTeam } from "./players-by-sport";
import { useSportTeam } from "./sport-team";

type Props = Parameters<typeof StatisticsClient>[0];

/** Estatísticas do time ativo. O vôlei mantém o painel atual; as demais mostram as estatísticas da modalidade e as cartas do elenco. */
export default function StatisticsBySport(props: Props) {
  const { team } = useSportTeam();
  if (!team) return <NoTeam title="Estatísticas" />;
  if (team.sportKey === "volleyball") return <StatisticsClient {...props} />;
  return <SportStatistics key={team.id} teamId={team.id} sportKey={team.sportKey} teamName={team.name} />;
}

function SportStatistics({
  teamId,
  sportKey,
  teamName,
}: {
  teamId: string;
  sportKey: Parameters<typeof getSport>[0];
  teamName: string;
}) {
  const sport = getSport(sportKey);
  const { roster } = useLocalRoster(teamId);
  const groups = [...new Set(sport.stats.map((stat) => stat.group))];

  return (
    <div className="page-shell">
      <TopBar
        title="Estatísticas"
        badge={`${sport.name} · ${teamName}`}
        description={`O que é registrado em um jogo de ${sport.name} e a carta de cada atleta.`}
      />

      <section className="section-block" aria-labelledby="stats-catalog">
        <h2 id="stats-catalog">Lances registrados em {sport.name}</h2>
        <div className="stat-catalog">
          {groups.map((group) => (
            <div key={group} className="stat-group">
              <h3>{group}</h3>
              <ul>
                {sport.stats
                  .filter((stat) => stat.group === group)
                  .map((stat) => (
                    <li key={stat.key} className={`is-${stat.polarity}`}>
                      {stat.label}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block" aria-labelledby="stats-cards">
        <h2 id="stats-cards">Cartas do elenco</h2>
        {roster.length === 0 ? (
          <div className="empty-state">
            <h2>Nenhum atleta neste time</h2>
            <p>Cadastre atletas em Atletas para ver as cartas. Sem jogos registrados, a nota é a base da posição.</p>
          </div>
        ) : (
          <div className="roster-cards">
            {roster.map((athlete) => (
              <RatingCard
                key={athlete.id}
                sport={sport}
                player={{
                  name: athlete.name,
                  positionKey: athlete.positionKey,
                  shirtNumber: athlete.shirtNumber,
                }}
                rating={sport.rating({ totals: {}, games: 0, position: athlete.positionKey })}
                compact
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
