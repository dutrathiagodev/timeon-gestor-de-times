"use client";

import type { ReactNode } from "react";

interface TopBarProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  /** Etiqueta pequena de contexto acima do título. */
  badge?: string;
  onAction?: () => void;
  extra?: ReactNode;
}

/** Faixa de contexto da página: título, frase curta, contexto e uma ação principal. */
export default function TopBar({
  title,
  description,
  actionLabel,
  actionIcon,
  badge,
  onAction,
  extra,
}: TopBarProps) {
  return (
    <header className="page-hero">
      <div className="page-hero-copy">
        {badge ? <span className="page-hero-kicker">{badge}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>

      <div className="page-hero-actions">
        {extra}
        {actionLabel && onAction ? (
          <button type="button" className="btn btn-primary" onClick={onAction}>
            {actionIcon}
            <span>{actionLabel}</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
