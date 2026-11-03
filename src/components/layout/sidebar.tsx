"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarRange,
  Home,
  LayoutDashboard,
  LayoutGrid,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OrganizationSwitcher, TeamSwitcher, useActiveContext } from "./active-context";
import { SportIcon } from "./sport-icon";
import { useSidebar } from "./sidebar-context";

type NavItem = {
  href: string;
  label: string;
  hint: string;
  /** Sem ícone fixo: usa o da modalidade do time ativo. */
  icon: LucideIcon | null;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Geral",
    items: [{ href: "/", label: "Início", hint: "Organização e times", icon: Home }],
  },
  {
    label: "Time ativo",
    items: [
      { href: "/dashboard", label: "Painel", hint: "Visão geral do time", icon: LayoutDashboard },
      { href: "/players", label: "Atletas", hint: "Elenco e cadastro", icon: Users },
      { href: "/lineup", label: "Escalação", hint: "Esquema e titulares", icon: null },
      { href: "/games", label: "Jogos", hint: "Agenda e resultados", icon: CalendarRange },
      { href: "/statistics", label: "Estatísticas", hint: "Desempenho e leitura", icon: BarChart3 },
    ],
  },
  {
    label: "Conta",
    items: [
      { href: "/modalidades", label: "Modalidades", hint: "Modelo por esporte", icon: LayoutGrid },
      { href: "/conta/seguranca", label: "Segurança", hint: "Verificação em duas etapas", icon: ShieldCheck },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggleSidebar } = useSidebar();
  const { team } = useActiveContext();

  function closeOnMobile() {
    if (window.innerWidth < 1100 && isOpen) toggleSidebar();
  }

  return (
    <>
      <div
        className={cn("sidebar-overlay", isOpen && "is-visible")}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      <aside className={cn("app-sidebar", isOpen ? "is-open" : "is-collapsed")}>
        <nav className="sidebar-shell" aria-label="Principal">
          <div className="sidebar-context">
            <OrganizationSwitcher id="side-org" />
            <TeamSwitcher id="side-team" />
          </div>

          {navGroups.map((group) => (
            <div key={group.label} className="sidebar-group">
              <div className="sidebar-section-label">{group.label}</div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("sidebar-link", pathname === item.href && "is-active")}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={closeOnMobile}
                >
                  <span className="sidebar-link-icon">
                    {item.icon ? (
                      <item.icon size={18} />
                    ) : (
                      <SportIcon sportKey={team?.sportKey ?? "volleyball"} />
                    )}
                  </span>
                  <span className="sidebar-link-text">
                    <strong>{item.label}</strong>
                    <small>{item.hint}</small>
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
