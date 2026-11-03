import { BrandLogo } from "@/components/ui/brand-logo";
import { SportIcon } from "@/components/layout/sport-icon";
import type { RatingResult, SportDefinition } from "@/sports/types";
import { faceAttributes } from "./face";
import { formTone, formatForm } from "./form";
import { positionLabel, positionShort } from "./position";
import { TIER_LABEL, ratingTier } from "./tier";

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
  /** Saldo dos últimos jogos; sem o valor, a linha de forma não aparece. */
  form?: number;
  caption?: string;
  compact?: boolean;
};

/** Silhueta de cabeça e ombros para atleta sem foto. */
function Silhouette() {
  return (
    <svg viewBox="0 0 100 110" className="fut-card-silhouette" aria-hidden="true">
      <circle cx="50" cy="34" r="22" />
      <path d="M6 110c0-30 18-46 44-46s44 16 44 46z" />
    </svg>
  );
}

/**
 * Carta do atleta em qualquer esporte. A variante vem da nota: especial (90+),
 * ouro (80+), prata (70+) e bronze. As estatísticas mostradas dependem da posição.
 */
export default function RatingCard({
  sport,
  rating,
  player,
  form,
  caption,
  compact = false,
}: RatingCardProps) {
  const tier = ratingTier(rating.overall);
  const stats = faceAttributes(sport, rating, player.positionKey);
  const position = positionLabel(sport, player.positionKey);

  return (
    <figure className="fut-card-wrap">
      <article
        className={`fut-card overall-card is-${tier} ${compact ? "is-compact" : ""}`}
        aria-label={`${player.name}, ${sport.name}, nota ${rating.overall} de 99`}
      >
        <div className="fut-card-face">
          <div className="fut-card-top">
            <div className="fut-card-id">
              <span className="fut-card-rating">{rating.overall}</span>
              <span className="fut-card-position" title={position}>
                {positionShort(sport, player.positionKey)}
              </span>
              <span className="fut-card-sport" title={sport.name}>
                <SportIcon sportKey={sport.key} size={18} />
              </span>
              {player.shirtNumber != null && (
                <span className="fut-card-shirt" title="Camisa">
                  {player.shirtNumber}
                </span>
              )}
            </div>

            <div className="fut-card-portrait">
              {player.photoUrl ? (
                // Fotos são URLs assinadas do Storage; sem otimização de imagem para manter custo zero.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.photoUrl} alt="" />
              ) : (
                <Silhouette />
              )}
            </div>
          </div>

          <div className="fut-card-name">
            <strong title={player.name}>{player.name}</strong>
            <span className="sr-only">
              {position}, variante {TIER_LABEL[tier]}
              {player.shirtNumber != null ? `, Camisa #${player.shirtNumber}` : ", Sem camisa definida"}
            </span>
          </div>

          <dl className="fut-card-stats">
            {stats.map((attribute) => (
              <div key={attribute.key} className="fut-stat">
                <dd>{rating.attributes[attribute.key]}</dd>
                <dt title={attribute.label}>{attribute.short}</dt>
              </div>
            ))}
          </dl>

          <BrandLogo className="fut-card-brand" title="" />
        </div>
      </article>

      {(form !== undefined || caption) && (
        <figcaption className="fut-card-caption">
          {form !== undefined && <span className={`tone-${formTone(form)}`}>{formatForm(form)}</span>}
          {caption && <small>{caption}</small>}
        </figcaption>
      )}
    </figure>
  );
}
