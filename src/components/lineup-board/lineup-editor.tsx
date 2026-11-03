"use client";

import { useState } from "react";
import { Check, Move, RotateCcw, Trash2 } from "lucide-react";
import {
  CUSTOM_FORMATION_KEY,
  moveSlot,
  reseatLineup,
  type Lineup,
} from "@/sports/lineup";
import type { Formation, SportDefinition } from "@/sports/types";
import LineupBoard, { type BoardAthlete } from "./lineup-board";
import { useSavedFormations } from "./saved-formations";

type LineupEditorProps = {
  sport: SportDefinition;
  athletes: BoardAthlete[];
  initialLineup?: (formation: Formation) => Lineup;
};

/**
 * Escalação completa: escolha do esquema (prontos e salvos), modo de mover posições,
 * salvar o desenho como esquema personalizado e o quadro com os atletas.
 */
export default function LineupEditor({ sport, athletes, initialLineup }: LineupEditorProps) {
  const { saved, save, remove } = useSavedFormations(sport.key);
  const [formation, setFormation] = useState<Formation>(sport.formations[0]);
  const [lineup, setLineup] = useState<Lineup>(() =>
    initialLineup ? initialLineup(sport.formations[0]) : {},
  );
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [base, setBase] = useState<Formation>(sport.formations[0]);

  const isCustom = formation.key === CUSTOM_FORMATION_KEY;
  const isSaved = formation.key.startsWith("saved:");
  const options = [...sport.formations, ...saved];

  function choose(next: Formation) {
    if (next.key === formation.key) return;
    setLineup(reseatLineup(formation, next, lineup));
    setFormation(next);
    setBase(next);
    setEditing(false);
  }

  function handleMove(slotKey: string, x: number, y: number) {
    setFormation((current) => moveSlot(current, slotKey, x, y));
  }

  function handleSave() {
    const created = save(formation, name || `${base.label} personalizado`);
    setFormation(created);
    setBase(created);
    setName("");
    setEditing(false);
  }

  function handleDiscard() {
    setFormation(base);
    setEditing(false);
  }

  function handleDelete() {
    remove(formation.key);
    choose(sport.formations[0]);
  }

  return (
    <div className="lineup-editor">
      <div className="lineup-toolbar">
        <div className="lineup-toolbar-row">
          <span className="lineup-toolbar-label" id={`esquema-${sport.key}`}>
            Esquema
          </span>
          <div className="segmented" role="radiogroup" aria-labelledby={`esquema-${sport.key}`}>
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                role="radio"
                aria-checked={option.key === formation.key}
                className={`segmented-option ${option.key === formation.key ? "is-active" : ""}`}
                onClick={() => choose(option)}
              >
                {option.label}
              </button>
            ))}
            {isCustom && (
              <span className="segmented-option is-active is-custom" aria-current="true">
                Personalizado
              </span>
            )}
          </div>
        </div>

        <div className="lineup-toolbar-row is-actions">
          <button
            type="button"
            className={`btn btn-sm ${editing ? "btn-primary" : "btn-secondary"}`}
            aria-pressed={editing}
            onClick={() => setEditing((value) => !value)}
          >
            <Move size={16} aria-hidden="true" />
            {editing ? "Concluir posições" : "Mover posições"}
          </button>

          {isCustom && (
            <>
              <label className="sr-only" htmlFor={`nome-${sport.key}`}>
                Nome do esquema
              </label>
              <input
                id={`nome-${sport.key}`}
                className="lineup-name-input"
                placeholder={`${base.label} personalizado`}
                value={name}
                maxLength={40}
                onChange={(event) => setName(event.target.value)}
              />
              <button type="button" className="btn btn-sm btn-primary" onClick={handleSave}>
                <Check size={16} aria-hidden="true" />
                Salvar esquema
              </button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={handleDiscard}>
                <RotateCcw size={16} aria-hidden="true" />
                Descartar
              </button>
            </>
          )}

          {isSaved && !isCustom && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={handleDelete}>
              <Trash2 size={16} aria-hidden="true" />
              Excluir esquema
            </button>
          )}
        </div>

        {editing && (
          <p className="lineup-hint">
            Arraste as posições no campo (ou selecione e use as setas). O desenho vira
            &ldquo;Personalizado&rdquo; e pode ser salvo com um nome.
          </p>
        )}
      </div>

      <LineupBoard
        sport={sport}
        formation={formation}
        athletes={athletes}
        value={lineup}
        onChange={setLineup}
        editLayout={editing}
        onMoveSlot={handleMove}
      />
    </div>
  );
}
