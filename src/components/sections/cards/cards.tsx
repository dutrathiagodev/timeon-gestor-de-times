"use client";

import { useState } from "react";
import TopBar from "@/components/layout/top-bar";
import { SportIcon } from "@/components/layout/sport-icon";
import RatingCard from "@/components/rating-card/rating-card";
import { TIER_LABEL } from "@/components/rating-card/tier";
import { SPORT_KEYS, getSport } from "@/sports/registry";
import type { SportKey } from "@/sports/types";
import { TIER_SAMPLES, sampleRating } from "./sample-rating";

/** Galeria das cartas: uma linha por posição, com as quatro variantes (especial, ouro, prata, bronze). */
export default function CardsClient() {
  const [sportKey, setSportKey] = useState<SportKey>(SPORT_KEYS[0]);
  const sport = getSport(sportKey);

  return (
    <div className="page-shell">
      <TopBar
        title="Cartas dos atletas"
        badge="Modelo"
        description="Especial a partir de 90, ouro de 80 a 89, prata de 70 a 79 e bronze abaixo de 70. Cada posição mostra só as estatísticas que valem para ela. Atletas e notas são de exemplo."
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

      {sport.positions.map((position) => (
        <section key={position.key} className="card-gallery-row" aria-labelledby={`pos-${position.key}`}>
          <h3 id={`pos-${position.key}`}>
            {position.label}
            <small>{position.short}</small>
          </h3>
          <div className="card-gallery-variants">
            {TIER_SAMPLES.map(({ tier, overall }) => (
              <div key={tier} className="card-gallery-variant">
                <RatingCard
                  sport={sport}
                  rating={sampleRating(sport, position.key, overall)}
                  player={{
                    name: "Nome do atleta",
                    positionKey: position.key,
                    shirtNumber: 10,
                  }}
                />
                <span>{TIER_LABEL[tier]}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
