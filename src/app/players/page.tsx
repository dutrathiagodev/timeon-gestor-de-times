import { createClient } from "@/lib/supabase/server";
import { withSignedPhotos } from "@/lib/photos";
import { PLAYER_COLUMNS } from "@/lib/volleyball";
import PlayersBySport from "@/components/sections/sport/players-by-sport";

export default async function PlayersPage() {
  const supabase = await createClient();
  const [{ data: players }, { data: performance }] = await Promise.all([
    supabase.from("jogadores_leilao").select(PLAYER_COLUMNS).order("nome"),
    supabase.from("estatisticas_individuais").select("*"),
  ]);

  return (
    <PlayersBySport
      initialPlayers={await withSignedPhotos(supabase, players || [])}
      initialPerformance={performance || []}
    />
  );
}
