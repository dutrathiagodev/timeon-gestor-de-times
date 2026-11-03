"use client";

import RatingCard from "@/components/rating-card/rating-card";
import type { PlayerRatings, PlayerRecord } from "@/lib/volleyball";
import { getSport } from "@/sports/registry";

const volleyball = getSport("volleyball");

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase();

/** O cadastro antigo guarda a posição como texto livre ("Levantador"); procura a posição do vôlei. */
function volleyballPositionKey(text?: string | null): string | null {
  if (!text) return null;
  const wanted = normalize(text);
  return (
    volleyball.positions.find(
      (position) => normalize(position.label) === wanted || normalize(position.short) === wanted,
    )?.key ?? null
  );
}

/** Carta do vôlei com a nota do painel antigo, desenhada pelo mesmo card das outras modalidades. */
export default function OverallCard({
  player,
  ratings,
  caption,
  compact = false,
}: {
  player: Pick<PlayerRecord, "nome" | "posicao" | "camisa" | "foto_url">;
  ratings: PlayerRatings;
  caption?: string;
  compact?: boolean;
}) {
  return (
    <RatingCard
      sport={volleyball}
      rating={{
        overall: ratings.overall,
        attributes: {
          attack: ratings.ataque,
          pass: ratings.passe,
          serve: ratings.saque,
          set: ratings.toque,
          block: ratings.bloqueio,
          reading: ratings.nocao,
          jump: ratings.pulo,
        },
      }}
      player={{
        name: player.nome,
        positionKey: volleyballPositionKey(player.posicao),
        shirtNumber: player.camisa,
        photoUrl: player.foto_url,
      }}
      form={ratings.trendScore}
      caption={caption}
      compact={compact}
    />
  );
}
