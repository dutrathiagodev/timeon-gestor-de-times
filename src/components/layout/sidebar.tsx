"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./sidebar-context";
import { TeamSwitcher, useActiveTeam } from "./active-team";
import { SportIcon } from "./sport-icon";
import {
  BarChart3,
  CalendarRange,
  ChevronLeft,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  ShieldCheck,
  Menu,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api-client";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    hint: "Visao geral",
  },
  {
    href: "/players",
    label: "Atletas",
    icon: Users,
    hint: "Elenco e cadastro",
  },
  {
    href: "/lineup",
    label: "Escalacao",
    icon: null,
    hint: "Esquema e titulares",
  },
  {
    href: "/statistics",
    label: "Estatisticas",
    icon: BarChart3,
    hint: "Desempenho e leitura",
  },
  {
    href: "/games",
    label: "Jogos",
    icon: CalendarRange,
    hint: "Agenda e resultados",
  },
  {
    href: "/modalidades",
    label: "Modalidades",
    icon: LayoutGrid,
    hint: "Modelo por esporte",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, toggleSidebar } = useSidebar();
  const { team } = useActiveTeam();

  async function handleLogout() {
    await apiRequest("/api/auth/logout", "POST").catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  if (pathname === "/login") return null;

  return (
    <>
      <button
        className="mobile-menu-button"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
      </button>

      <div
        className={cn("sidebar-overlay", isOpen && "is-visible")}
        onClick={toggleSidebar}
      />

      <aside className={cn("app-sidebar", isOpen ? "is-open" : "is-collapsed")}>
        <div className="sidebar-shell">
          <div className="sidebar-brand">
            <BrandLogo className="sidebar-brand-wordmark" />
            <span className="sidebar-brand-tagline">Gestao de times</span>
          </div>

          <TeamSwitcher />

          <div className="sidebar-section-label">Navegacao</div>

          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("sidebar-link", isActive && "is-active")}
                  onClick={() => {
                    if (window.innerWidth < 1024 && isOpen) {
                      toggleSidebar();
                    }
                  }}
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
              );
            })}
          </nav>

          <Link
            href="/conta/seguranca"
            className={cn("sidebar-link", pathname === "/conta/seguranca" && "is-active")}
          >
            <span className="sidebar-link-icon">
              <ShieldCheck size={18} />
            </span>
            <span className="sidebar-link-text">
              <strong>Seguranca</strong>
              <small>Verificacao em duas etapas</small>
            </span>
          </Link>

          <button className="btn btn-secondary" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </button>

          <div className="sidebar-foot-card">
            <span className="sidebar-foot-chip">Temporada 2026</span>
            <h3>Operacao esportiva</h3>
            <p>
              Controle elenco, acompanhe desempenho e mantenha a leitura da
              temporada em um unico painel.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
