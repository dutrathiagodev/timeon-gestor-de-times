"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, LogOut, Menu } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { apiRequest } from "@/lib/api-client";
import { OrganizationSwitcher, TeamSwitcher } from "./active-context";
import { useSidebar } from "./sidebar-context";

/** Barra do topo: marca, organização e time ativos, e saída. */
export default function AppHeader() {
  const router = useRouter();
  const { isOpen, toggleSidebar } = useSidebar();

  async function handleLogout() {
    await apiRequest("/api/auth/logout", "POST").catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="app-header">
      <button
        type="button"
        className="app-header-menu"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
      </button>

      <Link href="/" className="app-header-brand" aria-label="TimeOn, início">
        <BrandLogo className="app-header-logo" title="" />
      </Link>

      <div className="app-header-context">
        <OrganizationSwitcher id="header-org" />
        <TeamSwitcher id="header-team" />
      </div>

      <button type="button" className="btn btn-secondary app-header-logout" onClick={handleLogout}>
        <LogOut size={16} />
        <span>Sair</span>
      </button>
    </header>
  );
}
