"use client";

import Link from "next/link";
import TopBar from "@/components/layout/top-bar";
import { OrganizationSwitcher, useActiveContext } from "@/components/layout/active-context";
import { ROLE_LABEL } from "@/components/layout/role-label";
import { SportIcon } from "@/components/layout/sport-icon";
import { canCreateTeam, groupTeamsBySport } from "@/lib/teams";
import { getSport } from "@/sports/registry";

export default function HomeClient() {
  const { organization, teams, team, role, setTeamId } = useActiveContext();
  const groups = groupTeamsBySport(teams);

  return (
    <div className="page-shell">
      <TopBar
        title={organization ? organization.name : "Bem-vindo ao TimeOn"}
        badge={ROLE_LABEL[role]}
        description={
          teams.length > 0
            ? `${teams.length} ${teams.length === 1 ? "time" : "times"} em ${groups.length} ${groups.length === 1 ? "modalidade" : "modalidades"}. Escolha um para trabalhar.`
            : undefined
        }
        extra={<OrganizationSwitcher id="home-org" />}
      />

      {groups.length === 0 ? (
        <section className="empty-state" aria-label="Nenhum time">
          <h2>Nenhum time nesta organização</h2>
          <p>
            {canCreateTeam(role)
              ? "A criação de times chega em breve. Por enquanto, a administração cadastra os times."
              : "Peça o código do time ao técnico ou ao gestor para entrar."}
          </p>
        </section>
      ) : (
        groups.map((group) => {
          const sport = getSport(group.sportKey);
          return (
            <section key={group.sportKey} className="team-section" aria-labelledby={`sport-${group.sportKey}`}>
              <h2 id={`sport-${group.sportKey}`} className="team-section-title">
                <SportIcon sportKey={group.sportKey} size={16} />
                {sport.name}
              </h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Time</th>
                      <th scope="col">Categoria</th>
                      <th scope="col" className="col-optional">Faixa etária</th>
                      <th scope="col">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.teams.map((item) => (
                      <tr key={item.id} className={item.id === team?.id ? "is-current" : undefined}>
                        <td>
                          <Link href="/dashboard" className="table-link" onClick={() => setTeamId(item.id)}>
                            {item.name}
                          </Link>
                        </td>
                        <td>{item.category}</td>
                        <td className="col-optional">{item.ageGroup ?? "Livre"}</td>
                        <td>
                          {item.id === team?.id ? (
                            <span className="status-pill is-brand">Ativo</span>
                          ) : (
                            <span className="status-pill">Disponível</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
