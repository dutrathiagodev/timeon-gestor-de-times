import { createClient } from "@/lib/supabase/server";
import GamesBySport from "@/components/sections/sport/games-by-sport";

export default async function GamesPage() {
  const supabase = await createClient();
  const { data: games } = await supabase
    .from("jogos")
    .select("*")
    .order("data", { ascending: false });

  return <GamesBySport initialEvents={games || []} />;
}
