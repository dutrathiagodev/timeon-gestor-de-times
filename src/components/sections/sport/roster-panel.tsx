"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { newRosterId, useLocalRoster } from "@/components/lineup-board/local-roster";
import { buildAthlete, validateNewAthlete } from "@/components/lineup-board/roster-rules";
import type { TeamOption } from "@/lib/teams";
import { getSport } from "@/sports/registry";

/** Elenco do time com cadastro de atleta: as posições vêm da modalidade do time. */
export default function RosterPanel({ team, canEdit }: { team: TeamOption; canEdit: boolean }) {
  const sport = getSport(team.sportKey);
  const { roster, add, remove } = useLocalRoster(team.id);
  const [name, setName] = useState("");
  const [positionKey, setPositionKey] = useState(sport.positions[0].key);
  const [shirt, setShirt] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const input = { name, positionKey, shirtNumber: shirt };
    const problem = validateNewAthlete(sport, roster, input);
    if (problem) {
      setError(problem);
      return;
    }
    add(buildAthlete(input, newRosterId(team.id)));
    setName("");
    setShirt("");
    setError("");
  }

  const positionLabel = (key?: string | null) =>
    sport.positions.find((position) => position.key === key)?.label ?? "Atleta";

  return (
    <aside className="section-block lineup-side" aria-labelledby={`roster-title-${team.id}`}>
      <h2 id={`roster-title-${team.id}`}>Elenco ({roster.length})</h2>

      {canEdit && (
        <form className="roster-form" onSubmit={submit} noValidate>
          <label htmlFor={`roster-name-${team.id}`}>Nome</label>
          <input
            id={`roster-name-${team.id}`}
            className="lineup-name-input"
            value={name}
            maxLength={60}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="roster-form-row">
            <div>
              <label htmlFor={`roster-position-${team.id}`}>Posição ({sport.name})</label>
              <select
                id={`roster-position-${team.id}`}
                className="lineup-name-input"
                value={positionKey}
                onChange={(event) => setPositionKey(event.target.value)}
              >
                {sport.positions.map((position) => (
                  <option key={position.key} value={position.key}>
                    {position.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`roster-shirt-${team.id}`}>Camisa</label>
              <input
                id={`roster-shirt-${team.id}`}
                className="lineup-name-input is-narrow"
                inputMode="numeric"
                value={shirt}
                maxLength={2}
                onChange={(event) => setShirt(event.target.value)}
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-sm">
            <Plus size={16} aria-hidden="true" />
            Adicionar atleta
          </button>
          <p className="hint">Fica salvo neste navegador até o elenco vir do banco.</p>
        </form>
      )}

      {roster.length > 0 && (
        <ul className="roster-list">
          {roster.map((athlete) => (
            <li key={athlete.id}>
              <span className="roster-shirt">{athlete.shirtNumber ?? "–"}</span>
              <span className="roster-info">
                <strong>{athlete.name}</strong>
                <small>{positionLabel(athlete.positionKey)}</small>
              </span>
              {canEdit && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label={`Remover ${athlete.name}`}
                  onClick={() => remove(athlete.id)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
