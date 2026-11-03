import { BrandLogo } from "@/components/ui/brand-logo";
import type { RatingResult, SportDefinition } from "@/sports/types";
import { faceStats } from "./face";
import { formTone, formatForm } from "./form";
import { positionLabel, positionShort } from "./position";
import { TIER_LABEL, ratingTier } from "./tier";

export type RatingCardPlayer = {
  name: string;
  positionKey?: string | null;
  shirtNumber?: number | null;
  photoUrl?: string | null;
  /** Silhueta feminina ou masculina quando não há foto. */
  sex?: "m" | "f" | null;
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

const SHAPE =
  "M0 42Q0 38 3 35L29 4Q32 0 37 0L271 0Q276 0 279 4L305 35Q308 38 308 42L308 376Q308 382 302 385Q228 410 160 430Q154 432 148 430Q80 410 6 385Q0 382 0 376Z";
const EDGE_GLOW =
  "M0 290L0 376Q0 382 6 385Q80 410 148 430Q154 432 160 430Q228 410 302 385Q308 382 308 376L308 300";
const EDGE_LINE =
  "M0 340L0 376Q0 382 6 385Q80 410 148 430Q154 432 160 430Q228 410 302 385Q308 382 308 376L308 340";

const MALE =
  "M64 240C70 214 96 202 128 196C145 192 155 186 157 172L157 162C149 156 143 147 139 137C135 131 133 125 132 119C127 119 123 113 123 105C123 97 127 93 132 95C130 81 130 67 134 55L131 49L137 45L135 37L144 35L145 27L154 29L158 21L166 25L172 16L179 22L186 15L191 22L198 18L202 26L210 24L212 32L220 33L221 42L227 48L225 56C230 68 230 82 228 95C233 93 237 97 237 105C237 113 233 119 228 119C226 128 222 136 218 142C213 150 207 156 202 160L202 172C204 186 214 192 230 196C262 202 290 214 298 240Z";
const FEMALE =
  "M64 240C70 214 96 202 128 196C145 192 155 186 157 172L157 162C149 156 143 147 139 137C135 131 133 125 132 119C127 119 123 113 123 105C123 97 127 93 132 95C129 78 131 62 138 50C147 34 162 25 180 25C198 25 213 34 221 50C228 64 230 80 228 95C238 92 247 98 251 110C257 126 256 146 250 164C246 178 240 190 236 198L228 196C232 182 234 166 232 152C230 138 228 128 226 119C224 129 220 137 215 143C210 150 205 155 202 159L202 172C204 186 214 192 230 196C262 202 290 214 298 240Z";

/** Estrelas da bola de futebol (centro, cantos e as duas metades de cima e de baixo). */
const STARS = [
  [26, 26, 15],
  [1, 4, 13],
  [51, 6, 13],
  [2, 50, 13],
  [51, 49, 13],
  [26, -9, 11],
  [26, 61, 11],
]
  .map(([cx, cy, r]) => {
    const points = Array.from({ length: 16 }, (_, i) => {
      const radius = i % 2 === 0 ? r : r * 0.58;
      const angle = (Math.PI / 8) * i - Math.PI / 2;
      return `${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)}`;
    });
    return `M${points.join("L")}Z`;
  })
  .join("");

function Ball({ family }: { family: SportDefinition["family"] }) {
  const kind =
    family === "basketball" ? "basket" : family === "volleyball" ? "volley" : family === "handball" ? "hand" : "soccer";
  return (
    <span className={`fut-ball is-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 52 52" width="52" height="52">
        {kind === "soccer" && <path d={STARS} fill="#141416" />}
        {kind === "basket" && (
          <path d="M26 0V52M0 26H52M9 6C21 15 21 37 9 46M43 6C31 15 31 37 43 46" stroke="#1b120c" strokeWidth="2.2" fill="none" />
        )}
        {kind === "volley" && (
          <>
            <path d="M26 0C32 11 30 21 14 28C8 31 3 34 0 38V52H10C12 40 22 31 38 30C44 30 49 28 52 25V12C44 16 36 18 30 12C28 8 27 4 26 0Z" fill="#1f4fa8" />
            <path d="M26 0C32 11 30 21 14 28M52 25C40 22 30 26 26 38C24 44 24 48 25 52M2 14C12 16 20 12 26 0" stroke="#0e1a33" strokeWidth="1" fill="none" opacity="0.6" />
          </>
        )}
        {kind === "hand" && (
          <>
            <path d="M26 0L36 12L30 26L18 26L14 12Z" fill="#ff641a" />
            <path d="M26 0L36 12L30 26L18 26L14 12ZM36 12L52 16M14 12L0 18M30 26L40 42M18 26L10 44M40 42L26 52M10 44L26 52" stroke="#151515" strokeWidth="1.4" fill="none" />
          </>
        )}
      </svg>
    </span>
  );
}

/** Ícone do app (atleta com bola) em tamanho de selo. */
function AppIcon() {
  return (
    <svg viewBox="0 0 200 200" width="22" height="22" aria-hidden="true">
      <rect width="200" height="200" rx="46" fill="#ff6a1a" />
      <g transform="translate(100 102) scale(0.152) translate(-300 462)" stroke="#f5f3ee" strokeLinecap="round" fill="none">
        <path d="M175 -205 Q 140 -340 205 -470" strokeWidth="170" />
        <path d="M220 -470 Q 270 -570 345 -625" strokeWidth="92" />
        <path d="M178 -440 Q 115 -455 75 -400" strokeWidth="76" />
        <path d="M185 -215 Q 265 -120 165 -45" strokeWidth="120" />
        <path d="M160 -205 Q 120 -95 35 -105" strokeWidth="106" />
        <circle cx="210" cy="-690" r="104" fill="#f5f3ee" stroke="none" />
        <circle cx="485" cy="-800" r="142" fill="#101217" stroke="none" />
      </g>
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
  const stats = faceStats(sport, rating, player.positionKey);
  const position = positionLabel(sport, player.positionKey);

  return (
    <figure className="fut-card-wrap">
      <article
        className={`fut-card overall-card is-${tier} ${compact ? "is-compact" : ""}`}
        aria-label={`${player.name}, ${sport.name}, nota ${rating.overall} de 99`}
      >
        <div className="fut-card-inner">
          <div className="fut-card-rim" />
          <div className="fut-card-face">
            <div className="fut-layer is-sheen" />
            <div className="fut-layer is-shard" />
            <div className="fut-layer is-facet" />
            <div className="fut-layer is-dark-1" />
            <div className="fut-layer is-dark-2" />
            <div className="fut-layer is-stripe-1" />
            <div className="fut-layer is-stripe-2" />
            <div className="fut-layer is-stripe-3" />
            <div className="fut-layer is-stripe-4" />
            <div className="fut-layer is-stripe-5" />
            <div className="fut-layer is-wedge" />
            <div className="fut-layer is-line" />
            <div className="fut-layer is-bottom-glow" />
            <div className="fut-layer is-stripe-6" />
            <div className="fut-layer is-stripe-7" />

            <svg className="fut-card-svg" viewBox="0 0 308 433" aria-hidden="true">
              <filter id="fut-soft" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
              <path className="fut-card-edge-glow" d={EDGE_GLOW} strokeWidth="18" opacity="0.65" filter="url(#fut-soft)" />
              <path className="fut-card-edge-glow" d={EDGE_LINE} strokeWidth="3" opacity="0.95" />
              <path d="M2 44L32 6" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" fill="none" />
            </svg>

            <span className="fut-spark" style={{ left: 288, top: 22 }} />
            <span className="fut-spark" style={{ left: 6, top: 372, animationDelay: "0.8s" }} />
            <span className="fut-spark" style={{ left: 286, top: 372, animationDelay: "1.4s" }} />
            {tier === "elite" && <span className="fut-shine" />}

            {player.photoUrl ? (
              // Fotos são URLs assinadas do Storage; sem otimização de imagem para manter custo zero.
              // eslint-disable-next-line @next/next/no-img-element
              <img className="fut-card-photo" src={player.photoUrl} alt="" />
            ) : (
              <svg className="fut-card-svg fut-card-silhouette" viewBox="0 0 308 433" aria-hidden="true">
                <path d={player.sex === "f" ? FEMALE : MALE} />
              </svg>
            )}

            <div className="fut-band" />
            <div className="fut-lower" />
            <div className="fut-divider" />
            <div className="fut-divider is-vertical" />

            <span className="fut-card-rating">{rating.overall}</span>
            <span className="fut-card-position" title={position}>
              {positionShort(sport, player.positionKey)}
            </span>
            <Ball family={sport.family} />

            <div className="fut-card-name">
              <strong title={player.name}>{player.name}</strong>
              <span className="sr-only">
                {position}, variante {TIER_LABEL[tier]}
                {player.shirtNumber != null ? `, Camisa #${player.shirtNumber}` : ", Sem camisa definida"}
              </span>
            </div>

            <dl className="fut-card-stats">
              {stats.map((stat) => (
                <div key={stat.key} className="fut-stat">
                  <dd>{stat.value}</dd>
                  <dt title={stat.label}>{stat.short}</dt>
                </div>
              ))}
            </dl>

            <div className="fut-card-brand">
              <AppIcon />
              <BrandLogo title="" />
            </div>
          </div>
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
