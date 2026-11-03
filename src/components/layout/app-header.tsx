"use client";

import Link from "next/link";
import { ChevronLeft, ChevronsUpDown, Menu } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import AccessSwitcher from "./access-switcher";
import { useActiveContext } from "./active-context";
import { ROLE_LABEL } from "./role-label";
import { useSidebar } from "./sidebar-context";

/** Barra do topo: marca e o acesso atual (organização e time), que abre a troca. */
export default function AppHeader() {
  const { isOpen, toggleSidebar } = useSidebar();
  const { organization, team, role } = useActiveContext();

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
