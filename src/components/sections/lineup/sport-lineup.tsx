"use client";

import TopBar from "@/components/layout/top-bar";
import LineupEditor from "@/components/lineup-board/lineup-editor";
import { useLocalRoster } from "@/components/lineup-board/local-roster";
import RosterPanel from "@/components/sections/sport/roster-panel";
import type { TeamOption } from "@/lib/teams";
import { getSport } from "@/sports/registry";

/** Escalação de um time que não é de vôlei: tudo vem da modalidade do time (esquemas, posições, regras). */
export default function SportLineup({ team, canEdit }: { team: TeamOption; canEdit: boolean }) {
  const sport = getSport(team.sportKey);
  const { roster } = useLocalRoster(team.id);

  return (
    <div className="page-shell">
      <TopBar
        title="Escalação"
        badge={`${sport.name} · ${team.name}`}
        description={`${sport.playersOnField} em campo e até ${sport.maxBench} no banco. Os esquemas e as posições são os de ${sport.name}.`}
      />

      <div className="lineup-grid">
        <section className="section-block lineup-main" aria-label="Quadro da escalação">
          {roster.length === 0 && (
            <div className="empty-state">
              <h2>Nenhum atleta neste time</h2>
              <p>
                {canEdit
                  ? `Cadastre os atletas ao lado, com a posição de ${sport.name}, para montar a escalação.`
                  : "A comissão ainda não cadastrou atletas neste time."}
              </p>
            </div>
          )}
          <LineupEditor key={sport.key + team.id} sport={sport} athletes={roster} />
        </section>
        <RosterPanel team={team} canEdit={canEdit} />
      </div>
    </div>
  );
}
