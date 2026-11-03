import type { BoardAthlete } from "@/components/lineup-board/lineup-board";
import type { SportKey } from "@/sports/types";

const NAMES = [
  "Ana Souza", "Bia Lima", "Carla Dias", "Duda Rocha", "Eva Nunes", "Fabi Alves", "Gabi Reis",
  "Hana Melo", "Iris Costa", "Jade Pinto", "Kika Moura", "Lia Rocha", "Mari Teles", "Nina Vaz",
];

/** Posição de cada atleta de exemplo, na ordem da lista de nomes. */
const POSITIONS: Record<SportKey, string[]> = {
  volleyball: ["setter", "outside", "middle", "opposite", "outside", "middle", "libero", "setter", "outside", "middle"],
  futsal: ["goalkeeper", "fixo", "ala", "ala", "pivo", "fixo", "ala", "pivo"],
  football_society: ["goalkeeper", "defender", "defender", "midfielder", "midfielder", "midfielder", "attacker", "fullback", "attacker"],
  football_field: ["goalkeeper", "fullback", "defender", "defender", "fullback", "midfielder", "midfielder", "midfielder", "winger", "striker", "winger", "midfielder", "defender"],
  basketball: ["point_guard", "shooting_guard", "small_forward", "power_forward", "center", "center", "point_guard"],
  handball: ["goalkeeper", "wing", "playmaker", "center_back", "playmaker", "wing", "pivot", "pivot"],
};

/** Atletas inventados só para mostrar como cada modalidade fica; nada disso vem do banco. */
export function sampleAthletes(sportKey: SportKey): BoardAthlete[] {
  return POSITIONS[sportKey].map((positionKey, index) => ({
    id: `${sportKey}-${index}`,
    name: NAMES[index % NAMES.length],
    positionKey,
    shirtNumber: index + 1,
  }));
}
