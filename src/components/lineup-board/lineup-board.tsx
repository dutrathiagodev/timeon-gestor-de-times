"use client";

import { useState, type DragEvent, type KeyboardEvent } from "react";
import { getFirstName, getInitials } from "@/lib/volleyball";
import {
  lineupIssues,
  placeAthlete,
  removeAthlete,
  slotOf,
  type Lineup,
} from "@/sports/lineup";
import type { Formation, SportDefinition } from "@/sports/types";

export type BoardAthlete = {
  id: string;
  name: string;
  positionKey?: string | null;
  shirtNumber?: number | null;
  photoUrl?: string | null;
};

type LineupBoardProps = {
  sport: SportDefinition;
  formation: Formation;
  athletes: BoardAthlete[];
  value: Lineup;
  onChange: (lineup: Lineup) => void;
  /** No vôlei, desligue nas rotações 2 a 6 (a posição gira junto com o atleta). */
  checkPositionHints?: boolean;
};

const DRAG_TYPE = "application/x-timeon-athlete";

/** Escalação desenhada por esporte: slots posicionados pelas coordenadas da formação. */
export default function LineupBoard({
  sport,
  formation,
  athletes,
  value,
  onChange,
  checkPositionHints = true,
}: LineupBoardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const byId = new Map(athletes.map((athlete) => [athlete.id, athlete]));
  const onField = new Set(Object.values(value).filter((id): id is string => Boolean(id)));
  const bench = athletes.filter((athlete) => !onField.has(athlete.id));
  const issues = lineupIssues(sport, formation, value, athletes, { checkPositionHints });
  const issueBySlot = new Map(issues.map((issue) => [issue.slotKey, issue]));
  const selected = selectedId ? byId.get(selectedId) : undefined;
  const selectedSlot = selectedId ? slotOf(value, selectedId) : null;

  function place(slotKey: string, athleteId: string) {
    const slot = formation.slots.find((item) => item.key === slotKey);
    const athlete = byId.get(athleteId);
    if (!slot || !athlete) return;
    onChange(placeAthlete(value, slotKey, athleteId));
    setSelectedId(null);
    setAnnouncement(`${athlete.name} foi para ${slot.label}.`);
  }

  function handleSlotClick(slotKey: string) {
    if (selectedId) {
      place(slotKey, selectedId);
      return;
    }
    const occupant = value[slotKey];
    if (occupant) setSelectedId(occupant);
  }

  function handleRemove() {
    if (!selected) return;
    onChange(removeAthlete(value, selected.id));
    setAnnouncement(`${selected.name} saiu da escalação.`);
    setSelectedId(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && selectedId) {
      setSelectedId(null);
      setAnnouncement("Seleção cancelada.");
    }
  }

  function startDrag(event: DragEvent, athleteId: string) {
    event.dataTransfer.setData(DRAG_TYPE, athleteId);
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(event: DragEvent, slotKey: string) {
    event.preventDefault();
    const athleteId = event.dataTransfer.getData(DRAG_TYPE);
    if (athleteId) place(slotKey, athleteId);
  }

  const shortLabel = (slot: Formation["slots"][number]) =>
    sport.key === "volleyball"
      ? slot.key
      : (sport.positions.find((position) => position.key === slot.positionHint)?.short ?? slot.key);

  return (
    <div className="lineup-board" onKeyDown={handleKeyDown}>
      <div
        className={`board-field board-${sport.family}`}
        role="group"
        aria-label={`Escalação ${formation.label} de ${sport.name}`}
      >
        <div className="board-lines" aria-hidden="true" />
        {formation.slots.map((slot) => {
          const athlete = byId.get(value[slot.key] ?? "");
          const issue = issueBySlot.get(slot.key);
          const isSelected = Boolean(athlete) && athlete?.id === selectedId;
          const state = athlete ? athlete.name : "vazio";
          const label = [
            `${slot.label}: ${state}`,
            issue ? `Alerta: ${issue.message}` : "",
            selectedId && !isSelected ? "Pressione para escalar o atleta selecionado aqui." : "",
          ]
            .filter(Boolean)
            .join(". ");

          return (
            <button
              key={slot.key}
              type="button"
              className={[
                "board-slot",
                athlete ? "is-filled" : "is-empty",
                isSelected ? "is-selected" : "",
                issue ? "has-issue" : "",
              ].join(" ")}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              aria-label={label}
              aria-pressed={athlete ? isSelected : undefined}
              draggable={Boolean(athlete)}
              onClick={() => handleSlotClick(slot.key)}
              onDragStart={athlete ? (event) => startDrag(event, athlete.id) : undefined}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, slot.key)}
            >
              <span className="board-token">
                {athlete ? (
                  athlete.photoUrl ? (
                    // URL assinada do Storage; sem otimização de imagem para manter custo zero.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={athlete.photoUrl} alt="" draggable={false} />
                  ) : (
                    <span aria-hidden="true">{getInitials(athlete.name)}</span>
                  )
                ) : (
                  <span aria-hidden="true">{shortLabel(slot)}</span>
                )}
                {athlete?.shirtNumber != null && (
                  <span className="board-shirt" aria-hidden="true">
                    {athlete.shirtNumber}
                  </span>
                )}
                {issue && (
                  <span className="board-alert" aria-hidden="true">
                    !
                  </span>
                )}
              </span>
              {athlete && (
                <span className="board-name" aria-hidden="true">
                  {getFirstName(athlete.name)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="board-selection">
          <span>
            Selecionado: <strong>{selected.name}</strong>. Escolha um lugar na quadra
            {selectedSlot ? " para trocar de posição" : ""}.
          </span>
          {selectedSlot && (
            <button type="button" className="btn btn-sm btn-secondary" onClick={handleRemove}>
              Tirar da escalação
            </button>
          )}
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setSelectedId(null)}>
            Cancelar
          </button>
        </div>
      )}

      {issues.length > 0 && (
        <ul className="board-issues" aria-label="Alertas da escalação">
          {issues.map((issue) => (
            <li key={`${issue.slotKey}-${issue.code}`}>{issue.message}</li>
          ))}
        </ul>
      )}

      <section aria-label="Banco de reservas" className="board-bench">
        <h3 className="board-bench-title">Banco ({bench.length})</h3>
        {bench.length === 0 ? (
          <p className="board-bench-empty">Todos os atletas estão em campo.</p>
        ) : (
          <ul>
            {bench.map((athlete) => (
              <li key={athlete.id}>
                <button
                  type="button"
                  className={`board-bench-item ${athlete.id === selectedId ? "is-selected" : ""}`}
                  aria-pressed={athlete.id === selectedId}
                  draggable
                  onClick={() => setSelectedId(athlete.id === selectedId ? null : athlete.id)}
                  onDragStart={(event) => startDrag(event, athlete.id)}
                >
                  <span className="board-bench-avatar" aria-hidden="true">
                    {getInitials(athlete.name)}
                  </span>
                  <span className="board-bench-text">
                    <strong>{athlete.name}</strong>
                    <small>
                      {sport.positions.find((p) => p.key === athlete.positionKey)?.label ?? "Atleta"}
                      {athlete.shirtNumber != null ? ` · #${athlete.shirtNumber}` : ""}
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
