import type { SportKey } from "@/sports/types";

export type CalendarItem = {
  id: string;
  /** Dia do jogo, AAAA-MM-DD. */
  date: string;
  title: string;
  teamId: string;
  sportKey: SportKey;
  /** Amistoso, treino, liga, campeonato... */
  kind: string;
  venue?: string | null;
  score?: string | null;
};

export type CalendarMonth = {
  key: string;
  label: string;
  days: { date: string; label: string; items: CalendarItem[] }[];
};

const KIND_LABEL: Record<string, string> = {
  CAMPEONATO: "Campeonato",
  AMISTOSO: "Amistoso",
  TREINO: "Treino",
  OUTRO: "Outro",
  friendly: "Amistoso",
  training: "Treino",
  league: "Liga",
  other: "Outro",
};

export function kindLabel(kind: string): string {
  return KIND_LABEL[kind] ?? "Outro";
}

const isDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

/**
 * Agenda geral: filtra por times (vazio = todos), ordena por dia e agrupa em meses e dias.
 * Item com data inválida não entra.
 */
export function buildCalendar(items: CalendarItem[], teamIds: string[] = []): CalendarMonth[] {
  const wanted = new Set(teamIds);
  const visible = items
    .filter((item) => isDay(item.date) && (wanted.size === 0 || wanted.has(item.teamId)))
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, "pt-BR"));

  const months = new Map<string, CalendarMonth>();
  for (const item of visible) {
    const key = item.date.slice(0, 7);
    let month = months.get(key);
    if (!month) {
      const raw = new Date(`${key}-15T12:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      const label = raw.charAt(0).toUpperCase() + raw.slice(1);
      month = { key, label, days: [] };
      months.set(key, month);
    }
    let day = month.days.find((entry) => entry.date === item.date);
    if (!day) {
      const label = new Date(`${item.date}T12:00:00`).toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
      });
      day = { date: item.date, label, items: [] };
      month.days.push(day);
    }
    day.items.push(item);
  }
  return [...months.values()];
}
