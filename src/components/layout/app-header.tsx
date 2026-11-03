"use client";

import Link from "next/link";
import { ChevronsUpDown, PanelLeft } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils";
import AccessSwitcher from "./access-switcher";
import { useActiveContext } from "./active-context";
import { ROLE_LABEL } from "./role-label";
import { useSidebar } from "./sidebar-context";

/** Faixa do topo: recolher o menu, acesso atual (organização e time) e papel. */
export default function AppHeader() {
  const { isOpen, toggleSidebar } = useSidebar();
  const { organization, team, role } = useActiveContext();

  return (
    <header className={cn("app-header", !isOpen && "is-nav-collapsed")}>
      <button
        type="button"
        className="app-header-menu"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Recolher menu" : "Abrir menu"}
        aria-expanded={isOpen}
      >
        <PanelLeft size={18} aria-hidden="true" />
      </button>

      <Link href="/" className="app-header-brand" aria-label="TimeOn, início">
        <BrandLogo className="app-header-logo" title="" />
      </Link>

      <AccessSwitcher className="access-chip">
        <span className="access-chip-text">
          <small>{organization?.name ?? "Sem organização"}</small>
          <strong>{team ? team.name : "Escolha um time"}</strong>
        </span>
        <ChevronsUpDown size={16} aria-hidden="true" />
      </AccessSwitcher>

      <span className="role-badge">{ROLE_LABEL[role]}</span>
    </header>
  );
}
