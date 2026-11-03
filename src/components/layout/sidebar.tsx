"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarRange,
  Home,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Repeat,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrgRole } from "@/lib/teams";
import AccessSwitcher from "./access-switcher";
import { useActiveContext } from "./active-context";
import { ROLE_LABEL } from "./role-label";
import { useLogout } from "./use-logout";
import { SportIcon } from "./sport-icon";
import { useSidebar } from "./sidebar-context";

type NavItem = {
  href: string;
  label: string;
  hint: string;
  /** Sem ícone fixo: usa o da modalidade do time ativo. */
  icon: LucideIcon | null;
  /** Papéis que enxergam o item; sem a lista, todos enxergam. */
  roles?: OrgRole[];
};

type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/", label: "Início", hint: "Organização e times", icon: Home },
      { href: "/dashboard", label: "Painel", hint: "Visão geral do time", icon: LayoutDashboard },
    ],
  },
  {
    label: "Gerenciar",
    items: [
      { href: "/players", label: "Atletas", hint: "Elenco e cadastro", icon: Users },
      { href: "/lineup", label: "Escalação", hint: "Esquema e titulares", icon: null },
      { href: "/games", label: "Jogos", hint: "Agenda e resultados", icon: CalendarRange },
      { href: "/statistics", label: "Estatísticas", hint: "Desempenho e leitura", icon: BarChart3 },
      { href: "/modalidades", label: "Modalidades", hint: "Modelo por esporte", icon: LayoutGrid, roles: ["admin", "manager"] },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/acesso", label: "Gestão de acesso", hint: "Pessoas, códigos e papéis", icon: KeyRound, roles: ["admin", "manager"] },
      { href: "/conta/seguranca", label: "Segurança", hint: "Verificação em duas etapas", icon: ShieldCheck },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggleSidebar } = useSidebar();
  const { team, organization, role } = useActiveContext();
  const logout = useLogout();

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
          <div className="sidebar-scroll">
            {navGroups
              .map((group) => ({
                ...group,
                items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
              }))
              .filter((group) => group.items.length > 0)
              .map((group) => (
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
          </div>

          <div className="sidebar-account">
            <div className="sidebar-account-card">
              <small>Acesso atual</small>
              <strong>{ROLE_LABEL[role]}</strong>
              <span>
                {organization?.name ?? "Sem organização"}
                {team ? ` · ${team.name}` : ""}
              </span>
            </div>
            <AccessSwitcher className="sidebar-account-action">
              <Repeat size={16} />
              Trocar acesso
            </AccessSwitcher>
            <button type="button" className="sidebar-account-action" onClick={logout}>
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
