"use client";

import TopBar from "@/components/layout/top-bar";
import PlayersClient from "@/components/sections/players/players";
import { getSport } from "@/sports/registry";
import RosterPanel from "./roster-panel";
import { useSportTeam } from "./sport-team";

type Props = Parameters<typeof PlayersClient>[0];

/** Atletas do time ativo. O vôlei mantém o cadastro atual; as demais modalidades usam o elenco do time. */
export default function PlayersBySport(props: Props) {
  const { team, canEdit } = useSportTeam();
  if (!team) return <NoTeam title="Atletas" />;
  if (team.sportKey === "volleyball") return <PlayersClient {...props} />;

  const sport = getSport(team.sportKey);
  return (
    <div className="page-shell">
      <TopBar
        title="Atletas"
        badge={`${sport.name} · ${team.name}`}
        description={`Elenco do time. As posições são as de ${sport.name}: ${sport.positions.map((p) => p.label).join(", ")}.`}
      />
      <RosterPanel team={team} canEdit={canEdit} />
    </div>
  );
}

export function NoTeam({ title }: { title: string }) {
  return (
    <div className="page-shell">
      <TopBar title={title} />
      <section className="empty-state">
        <h2>Escolha um time</h2>
        <p>Esta página depende da modalidade do time. Escolha um time no topo da página.</p>
      </section>
    </div>
  );
}
