"use client";

import { useState } from "react";
import TopBar from "@/components/layout/top-bar";
import { useActiveContext } from "@/components/layout/active-context";
import { SportIcon } from "@/components/layout/sport-icon";
import { getSport } from "@/sports/registry";
import { buildCalendar, kindLabel, type CalendarItem } from "./calendar-rules";

/**
 * Visão geral da organização: os jogos de todos os times, de todas as modalidades, com filtro por time.
 * Hoje só o time de vôlei tem agenda ligada (a do cadastro atual); a agenda nova do banco entra quando
 * as telas lerem os times do banco.
 */
export default function GeneralCalendar({ items }: { items: CalendarItem[] }) {
  const { organization, teams } = useActiveContext();
  const [selected, setSelected] = useState<string[]>([]);
  const months = buildCalendar(items, selected);
  const withAgenda = new Set(items.map((item) => item.teamId));

  function toggle(teamId: string) {
    setSelected((current) =>
      current.includes(teamId) ? current.filter((id) => id !== teamId) : [...current, teamId],
    );
  }

  return (
    <div className="page-shell">
      <TopBar
        title="Calendário geral"
        badge={organization?.name}
        description="Os jogos de todos os times da organização, de todas as modalidades."
      />

      <section className="gcal-filters" aria-label="Filtrar por time">
        <button
          type="button"
          className={`filter-chip ${selected.length === 0 ? "is-active" : ""}`}
          aria-pressed={selected.length === 0}
          onClick={() => setSelected([])}
        >
          Todos os times
        </button>
        {teams.map((team) => (
          <button
            key={team.id}
            type="button"
            className={`filter-chip ${selected.includes(team.id) ? "is-active" : ""}`}
            aria-pressed={selected.includes(team.id)}
            onClick={() => toggle(team.id)}
          >
            <SportIcon sportKey={team.sportKey} size={14} />
            {team.name}
          </button>
        ))}
      </section>

      {months.length === 0 ? (
        <section className="empty-state">
          <h2>Nenhum jogo no calendário</h2>
          <p>
            {selected.length > 0
              ? "Os times escolhidos ainda não têm jogos agendados."
              : "Ainda não há jogos agendados nesta organização."}
          </p>
        </section>
      ) : (
        months.map((month) => (
          <section key={month.key} className="gcal-month" aria-labelledby={`m-${month.key}`}>
            <h2 id={`m-${month.key}`}>{month.label}</h2>
            <ul className="gcal-days">
              {month.days.map((day) => (
                <li key={day.date} className="gcal-day">
                  <span className="gcal-date">{day.label}</span>
                  <ul className="gcal-items">
                    {day.items.map((entry) => {
                      const team = teams.find((item) => item.id === entry.teamId);
                      return (
                        <li key={entry.id} className="gcal-item">
                          <SportIcon sportKey={entry.sportKey} size={16} />
                          <span className="gcal-item-main">
                            <strong>{entry.title}</strong>
                            <small>
                              {team?.name ?? getSport(entry.sportKey).name} · {kindLabel(entry.kind)}
                              {entry.venue ? ` · ${entry.venue}` : ""}
                            </small>
                          </span>
                          {entry.score && <span className="status-pill">{entry.score}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {teams.some((team) => !withAgenda.has(team.id)) && (
        <p className="hint">
          Times sem jogos aparecem quando a agenda deles for ligada:{" "}
          {teams
            .filter((team) => !withAgenda.has(team.id))
            .map((team) => team.name)
            .join(", ")}
          .
        </p>
      )}
    </div>
  );
}
