"use client";

import type { Formation, SportDefinition } from "@/sports/types";

type FormationPickerProps = {
  sport: SportDefinition;
  formation: Formation;
  onChange: (formation: Formation) => void;
};

/** Escolha do esquema tático; lista só as formações da modalidade do time. */
export default function FormationPicker({ sport, formation, onChange }: FormationPickerProps) {
  if (sport.formations.length < 2) return null;

  return (
    <div className="formation-picker" role="radiogroup" aria-label={`Esquema de ${sport.name}`}>
      {sport.formations.map((option) => (
        <button
          key={option.key}
          type="button"
          role="radio"
          aria-checked={option.key === formation.key}
          className={`formation-option ${option.key === formation.key ? "is-active" : ""}`}
          onClick={() => option.key !== formation.key && onChange(option)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
