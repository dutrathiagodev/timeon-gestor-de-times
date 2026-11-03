"use client";

import TopBar from "@/components/layout/top-bar";
import { useActiveContext } from "@/components/layout/active-context";
import { canCreateTeam } from "@/lib/teams";
import LineupClient from "./lineup";
import SportLineup from "./sport-lineup";

type Player = Parameters<typeof LineupClient>[0]["players"][number];

/**
 * A escalação segue o time ativo: cada modalidade tem as próprias posições, esquemas e regras.
 * O vôlei mantém a tela de rotações com os atletas do cadastro atual; as demais usam o quadro por esquema.
 */
export default function LineupBySport({ players }: { players: Player[] }) {
  const { team, role } = useActiveContext();

  if (!team) {
    return (
      <div className="page-shell">
        <TopBar title="Escalação" />
        <section className="empty-state">
          <h2>Escolha um time</h2>
          <p>A escalação depende da modalidade do time. Escolha um time no topo da página.</p>
        </section>
      </div>
    );
  }

  if (team.sportKey === "volleyball") return <LineupClient players={players} />;
  return <SportLineup key={team.id} team={team} canEdit={canCreateTeam(role)} />;
}
