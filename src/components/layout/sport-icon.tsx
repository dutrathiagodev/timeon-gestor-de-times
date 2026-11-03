import { Goal, Trophy, Volleyball, type LucideIcon } from "lucide-react";
import type { SportKey } from "@/sports/types";

const ICONS: Record<SportKey, LucideIcon> = {
  volleyball: Volleyball,
  futsal: Goal,
  football_society: Goal,
  football_field: Goal,
  basketball: Trophy,
  handball: Trophy,
};

export function SportIcon({ sportKey, size = 18 }: { sportKey: SportKey; size?: number }) {
  const Icon = ICONS[sportKey];
  return <Icon size={size} aria-hidden="true" />;
}
