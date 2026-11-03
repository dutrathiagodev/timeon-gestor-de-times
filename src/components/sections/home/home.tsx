"use client";

import Link from "next/link";
import { KeyRound, Plus } from "lucide-react";
import TopBar from "@/components/layout/top-bar";
import { OrganizationSwitcher, useActiveContext } from "@/components/layout/active-context";
import { SportIcon } from "@/components/layout/sport-icon";
import { canCreateTeam, groupTeamsBySport } from "@/lib/teams";
import { getSport } from "@/sports/registry";

const ROLE_LABEL = { admin: "Administração", manager: "Gestor", coach: "Técnico", player: "Jogador" } as const;

export default function HomeClient() {
  const { organization, teams, team, role, setTeamId } = useActiveContext();
  const groups = groupTeamsBySport(teams);

  return (
    <div className="page-shell">
      <TopBar
        title={organization ? organization.name : "Bem-vindo ao TimeOn"}
        badge={`Você é ${ROLE_LABEL[role].toLowerCase()}`}
        description="Escolha a organização e o time para trabalhar. O menu ao lado mostra só o que pertence ao time ativo."
        extra={<OrganizationSwitcher id="home-org" className="is-large" />}
      />

      <section className="home-actions" aria-label="Ações">
        {canCreateTeam(role) && (
          <button type="button" className="btn btn-primary" disabled title="Em breve">
            <Plus size={16} />
            <span>Criar time</span>
            <small>em breve</small>
          </button>
        )}
        <button type="button" className="btn btn-secondary" disabled title="Em breve">
          <KeyRound size={16} />
          <span>Entrar com código</span>
          <small>em breve</small>
        </button>
      </section>

      {groups.length === 0 ? (
        <section className="panel home-empty">
          <h2>Nenhum time ainda</h2>
          <p>
            {canCreateTeam(role)
              ? "Crie o primeiro time desta organização."
              : "Peça o código do time ao técnico ou ao gestor para entrar."}
          </p>
        </section>
      ) : (
        groups.map((group) => {
          const sport = getSport(group.sportKey);
          return (
            <section key={group.sportKey} className="home-group" aria-label={sport.name}>
              <h2 className="home-group-title">
                <SportIcon sportKey={group.sportKey} />
                {sport.name}
              </h2>
              <ul className="home-team-grid">
                {group.teams.map((item) => (
                  <li key={item.id}>
                    <Link
                      href="/dashboard"
                      className={`home-team-card ${item.id === team?.id ? "is-active" : ""}`}
                      onClick={() => setTeamId(item.id)}
                    >
                      <strong>{item.name}</strong>
                      <span>
                        {item.category}
                        {item.ageGroup ? ` · ${item.ageGroup}` : ""}
                      </span>
                      <small>{item.id === team?.id ? "Time ativo" : "Abrir time"}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
