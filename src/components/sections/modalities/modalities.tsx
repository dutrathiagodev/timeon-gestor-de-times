"use client";

import { useState } from "react";
import TopBar from "@/components/layout/top-bar";
import { SportIcon } from "@/components/layout/sport-icon";
import LineupEditor from "@/components/lineup-board/lineup-editor";
import RatingCard from "@/components/rating-card/rating-card";
import { emptyLineup, type Lineup } from "@/sports/lineup";
import { SPORT_KEYS, getSport } from "@/sports/registry";
import type { Formation, SportKey } from "@/sports/types";
import { sampleAthletes } from "./sample-data";

function startingLineup(sportKey: SportKey, formation: Formation): Lineup {
  let lineup = emptyLineup(formation);
  const used = new Set<string>();
  for (const slot of formation.slots) {
    const match = sampleAthletes(sportKey).find(
      (athlete) => athlete.positionKey === slot.positionHint && !used.has(athlete.id),
    );
    if (match) {
      used.add(match.id);
      lineup = { ...lineup, [slot.key]: match.id };
    }
  }
  return lineup;
}

function SportPreview({ sportKey }: { sportKey: SportKey }) {
  const sport = getSport(sportKey);
  const athletes = sampleAthletes(sportKey);
  const showcase = athletes.slice(0, 3);

  return (
    <div className="modality-preview">
      <section className="panel" aria-label={`Escalação de ${sport.name}`}>
        <h2>Escalação</h2>
        <LineupEditor
          sport={sport}
          athletes={athletes}
          initialLineup={(formation) => startingLineup(sportKey, formation)}
        />
      </section>

      <section className="panel" aria-label={`Cards de nota de ${sport.name}`}>
        <h2>Cards de nota</h2>
        <div className="modality-cards">
          {showcase.map((athlete) => (
            <RatingCard
              key={athlete.id}
              sport={sport}
              player={athlete}
              rating={sport.rating({ totals: {}, games: 0, position: athlete.positionKey })}
              compact
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ModalitiesClient() {
  const [sportKey, setSportKey] = useState<SportKey>(SPORT_KEYS[0]);

  return (
    <>
      <TopBar
        title="Modalidades"
        badge="Modelo das telas"
        description="Como escalação e cards de nota ficam em cada modalidade. Os atletas são de exemplo."
      />
      <div className="formation-picker" role="tablist" aria-label="Modalidade">
        {SPORT_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={key === sportKey}
            className={`formation-option sport-tab ${key === sportKey ? "is-active" : ""}`}
            onClick={() => setSportKey(key)}
          >
            <SportIcon sportKey={key} size={16} />
            {getSport(key).name}
          </button>
        ))}
      </div>
      <SportPreview key={sportKey} sportKey={sportKey} />
    </>
  );
}
