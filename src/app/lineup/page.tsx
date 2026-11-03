import { createClient } from "@/lib/supabase/server";
import { withSignedPhotos } from "@/lib/photos";
import LineupBySport from "@/components/sections/lineup/lineup-by-sport";

export default async function LineupPage() {
  const supabase = await createClient();
  const { data: players } = await supabase
    .from("jogadores_leilao")
    .select("id, nome, posicao, camisa, foto_url")
    .order("nome");

  return <LineupBySport players={await withSignedPhotos(supabase, players || [])} />;
}
