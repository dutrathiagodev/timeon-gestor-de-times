import { createClient } from "@/lib/supabase/server";
import { getEventTitle, type EventRecord } from "@/lib/volleyball";
import GeneralCalendar from "@/components/sections/calendar/general-calendar";
import type { CalendarItem } from "@/components/sections/calendar/calendar-rules";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("jogos").select("*").order("data", { ascending: true });

  // A agenda do cadastro atual é a do time de vôlei; os demais times entram com a agenda nova do banco.
  const items: CalendarItem[] = ((data || []) as EventRecord[]).map((event) => ({
    id: event.id,
    date: String(event.data).slice(0, 10),
    title: getEventTitle(event),
    teamId: "volei",
    sportKey: "volleyball",
    kind: event.tipo || "OUTRO",
    venue: event.local,
    score:
      event.placar_nos != null && event.placar_eles != null ? `${event.placar_nos} x ${event.placar_eles}` : null,
  }));

  return <GeneralCalendar items={items} />;
}
