import { getInitials } from "@/lib/volleyball";
import type { RatingResult, SportDefinition } from "@/sports/types";
import { formTone, formatForm } from "./form";
import { positionLabel } from "./position";
import { ratingTier } from "./tier";

export type RatingCardPlayer = {
  name: string;
  positionKey?: string | null;
  shirtNumber?: number | null;
  photoUrl?: string | null;
};

type RatingCardProps = {
  sport: SportDefinition;
  rating: RatingResult;
  player: RatingCardPlayer;
  /** Saldo dos últimos jogos; sem o valor, o rodapé não mostra a forma. */
  form?: number;
  caption?: string;
  compact?: boolean;
};

/** Card de nota do atleta em qualquer esporte: os atributos vêm do módulo do esporte. */
export default function RatingCard({
  sport,
  rating,
  player,
  form,
  caption,
  compact = false,
}: RatingCardProps) {
  const tier = ratingTier(rating.overall);
  const attributes = sport.ratingAttributes.filter(
    (attribute) => attribute.key in rating.attributes,
  );

  return (
    <article
      className={`overall-card is-${tier} ${compact ? "is-compact" : ""}`}
      aria-label={`${player.name}, ${sport.name}, nota ${rating.overall} de 99`}
    >
      <div className="overall-card-glow" aria-hidden="true" />
      <div className="overall-card-head">
        <div className="overall-rating-block">
          <span className="overall-rating-value">{rating.overall}</span>
          <span className="overall-rating-label">OVR</span>
        </div>

        <div className="overall-player-meta">
          <span className="overall-position-pill">
            {positionLabel(sport, player.positionKey)}
          </span>
          <strong>{player.name}</strong>
          <small>
            {player.shirtNumber != null
              ? `Camisa #${player.shirtNumber}`
              : "Sem camisa definida"}
          </small>
        </div>
      </div>

      <div className="overall-portrait">
        {player.photoUrl ? (
          // Fotos são URLs assinadas do Storage; sem otimização de imagem para manter custo zero.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.photoUrl} alt="" />
        ) : (
          <div className="overall-placeholder" aria-hidden="true">
            {getInitials(player.name)}
          </div>
        )}
      </div>

      <dl className="overall-stats-grid">
        {attributes.map((attribute) => (
          <div key={attribute.key} className="overall-stat-row">
            <dt title={attribute.label}>{attribute.short}</dt>
            <dd>{rating.attributes[attribute.key]}</dd>
          </div>
        ))}
      </dl>

      <div className="overall-card-footer">
        {form !== undefined ? (
          <span className={`tone-${formTone(form)}`}>{formatForm(form)}</span>
        ) : (
          <span />
        )}
        <small>{caption || "Leitura acumulada do atleta"}</small>
      </div>
    </article>
  );
}
