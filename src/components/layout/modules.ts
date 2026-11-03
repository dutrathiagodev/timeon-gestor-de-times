import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  Crosshair,
  FileText,
  Home,
  IdCard,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  Shuffle,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { OrgRole } from "@/lib/teams";

export type ModuleGroup = "Principal" | "Gerenciar" | "Sistema";

export type AppModule = {
  /** Sem endereço: o módulo ainda não existe e aparece como "Em breve". */
  href: string | null;
  label: string;
  hint: string;
  description: string;
  /** Sem ícone fixo: usa o da modalidade do time ativo. */
  icon: LucideIcon | null;
  group: ModuleGroup;
  /** Papéis que enxergam o módulo; sem a lista, todos enxergam. */
  roles?: OrgRole[];
};

const STAFF: OrgRole[] = ["admin", "manager"];
const COMMISSION: OrgRole[] = ["admin", "manager", "coach"];

/** Mapa único do produto: o menu lateral e os cartões da página inicial saem daqui. */
export const MODULES: AppModule[] = [
  { href: "/", label: "Início", hint: "Organização e times", description: "Escolha a organização e o time.", icon: Home, group: "Principal" },
  { href: "/calendario", label: "Calendário geral", hint: "Todos os times", description: "Jogos de todos os times e modalidades da organização.", icon: CalendarDays, group: "Principal" },
  { href: "/dashboard", label: "Painel", hint: "Visão geral do time", description: "Resumo do time, próximos jogos e momento técnico.", icon: LayoutDashboard, group: "Principal" },
  { href: "/players", label: "Atletas", hint: "Elenco e cadastro", description: "Ficha de cada atleta: posição, camisa e dados do cadastro.", icon: Users, group: "Gerenciar" },
  { href: "/lineup", label: "Escalação", hint: "Esquema e titulares", description: "Monte os titulares por esquema tático e veja avisos de posição.", icon: null, group: "Gerenciar" },
  { href: "/games", label: "Jogos", hint: "Agenda e resultados", description: "Agenda, resultados e placar de cada jogo.", icon: CalendarRange, group: "Gerenciar" },
  { href: "/statistics", label: "Estatísticas", hint: "Desempenho e leitura", description: "Desempenho do time e de cada atleta.", icon: BarChart3, group: "Gerenciar" },
  { href: null, label: "Presença", hint: "Treinos e jogos", description: "Chamada com justificativa e frequência de cada atleta.", icon: ClipboardCheck, group: "Gerenciar", roles: COMMISSION },
  { href: null, label: "Sorteio equilibrado", hint: "Times pela nota", description: "Divide o elenco em times parelhos usando a nota de cada atleta.", icon: Shuffle, group: "Gerenciar", roles: COMMISSION },
  { href: null, label: "Quadra tática", hint: "Jogadas e posições", description: "Desenhe posições e movimentos e guarde na biblioteca do time.", icon: Crosshair, group: "Gerenciar", roles: COMMISSION },
  { href: null, label: "Relatórios", hint: "PDF e planilha", description: "Relatórios por atleta, jogo e equipe para exportar.", icon: FileText, group: "Gerenciar", roles: COMMISSION },
  { href: "/cartas", label: "Cartas", hint: "Variantes por posição", description: "Todas as cartas por modalidade, posição e variante.", icon: IdCard, group: "Gerenciar" },
  { href: "/modalidades", label: "Modalidades", hint: "Modelo por esporte", description: "Como escalação e cards ficam em cada modalidade.", icon: LayoutGrid, group: "Sistema", roles: STAFF },
  { href: "/acesso", label: "Gestão de acesso", hint: "Pessoas, códigos e papéis", description: "Quem entra, com qual papel e em qual time.", icon: KeyRound, group: "Sistema", roles: STAFF },
  { href: "/conta/seguranca", label: "Segurança", hint: "Verificação em duas etapas", description: "Proteja a sua conta.", icon: ShieldCheck, group: "Sistema" },
];

export const MODULE_GROUPS: ModuleGroup[] = ["Principal", "Gerenciar", "Sistema"];

export function modulesFor(role: OrgRole, group?: ModuleGroup): AppModule[] {
  return MODULES.filter(
    (item) => (!group || item.group === group) && (!item.roles || item.roles.includes(role)),
  );
}
