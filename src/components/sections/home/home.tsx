"use client";

import Link from "next/link";
import { KeyRound, Plus } from "lucide-react";
import TopBar from "@/components/layout/top-bar";
import { OrganizationSwitcher, useActiveContext } from "@/components/layout/active-context";
import { modulesFor } from "@/components/layout/modules";
import { SoonBadge } from "@/components/layout/soon-badge";
import { ROLE_LABEL } from "@/components/layout/role-label";
import { SportIcon } from "@/components/layout/sport-icon";
import { canCreateTeam, canManageAccess, groupTeamsBySport } from "@/lib/teams";
import { getSport } from "@/sports/registry";

export default function HomeClient() {
  const { organization, teams, team, role, setTeamId } = useActiveContext();
  const groups = groupTeamsBySport(teams);
  const isStaff = canManageAccess(role);
  const modules = modulesFor(role, "Gerenciar");

  return (
    <div className="page-shell">
      <TopBar
        title={organization ? organization.name : "Bem-vindo ao TimeOn"}
        badge={`Você é ${ROLE_LABEL[role].toLowerCase()}`}
        description={
          isStaff
            ? "Escolha a organização e o time para trabalhar. O menu ao lado mostra só o que pertence ao time ativo."
            : "Escolha o time para ver escalação, jogos e a sua nota."
        }
        extra={<OrganizationSwitcher id="home-org" className="is-large" />}
      />

      {isStaff && (
        <section className="home-stats" aria-label="Resumo da organização">
          <div className="home-stat">
            <span>Times</span>
            <strong>{teams.length}</strong>
          </div>
          <div className="home-stat">
            <span>Modalidades</span>
            <strong>{groups.length}</strong>
          </div>
          <div className="home-stat">
            <span>Time ativo</span>
            <strong className="is-text">{team ? team.name : "Nenhum"}</strong>
          </div>
        </section>
      )}

      <section className="home-actions" aria-label="Ações">
        {canCreateTeam(role) && (
          <button type="button" className="btn btn-primary" disabled title="Em breve">
            <Plus size={16} />
            <span>Criar time</span>
            <SoonBadge />
          </button>
        )}
        <button type="button" className="btn btn-secondary" disabled title="Em breve">
          <KeyRound size={16} />
          <span>Entrar com código</span>
          <SoonBadge />
        </button>
      </section>

      {groups.length === 0 ? (
        <section className="panel home-empty">
          <SportIcon sportKey="volleyball" size={28} />
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
                      <span className="home-team-icon">
                        <SportIcon sportKey={item.sportKey} size={20} />
                      </span>
                      <strong>{item.name}</strong>
                      <span>
                        {item.category}
                        {item.ageGroup ? ` · ${item.ageGroup}` : ""}
                      </span>
                      <small>{item.id === team?.id ? "Time ativo" : "Abrir time →"}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      <section className="home-modules" aria-label="Módulos do time">
        <h2 className="home-group-title">O que você pode fazer</h2>
        <ul className="module-grid">
          {modules.map((item) => {
            const body = (
              <>
                <span className="module-icon">
                  {item.icon ? (
                    <item.icon size={20} aria-hidden="true" />
                  ) : (
                    <SportIcon sportKey={team?.sportKey ?? "volleyball"} size={20} />
                  )}
                </span>
                <strong>{item.label}</strong>
                <span>{item.description}</span>
                {item.href === null ? <SoonBadge /> : <small>Abrir →</small>}
              </>
            );
            return (
              <li key={item.label}>
                {item.href === null ? (
                  <div className="module-card is-soon" aria-disabled="true">
                    {body}
                  </div>
                ) : (
                  <Link href={item.href} className="module-card">
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
