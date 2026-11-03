"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Repeat } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils";
import AccessSwitcher from "./access-switcher";
import { useActiveContext } from "./active-context";
import { MODULE_GROUPS, modulesFor, type AppModule } from "./modules";
import { ROLE_LABEL } from "./role-label";
import { SportIcon } from "./sport-icon";
import { useSidebar } from "./sidebar-context";
import { useLogout } from "./use-logout";

function hasHref(item: AppModule): item is AppModule & { href: string } {
  return item.href !== null;
}

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
          <Link href="/" className="sidebar-brand" aria-label="TimeOn, início">
            <BrandLogo className="sidebar-logo" title="" />
            <Image src="/icon.svg" alt="" width={28} height={28} className="sidebar-symbol" />
          </Link>

          <div className="sidebar-scroll">
            {MODULE_GROUPS.map((group) => {
              // Só aparece o que já existe: módulo sem tela não vira item de menu.
              const items = modulesFor(role, group).filter(hasHref);
              if (items.length === 0) return null;
              return (
                <div key={group} className="sidebar-group">
                  <div className="sidebar-section-label">{group}</div>
                  {items.map((item) => (
                    <NavEntry
                      key={item.label}
                      item={item}
                      active={pathname === item.href}
                      sportKey={team?.sportKey ?? "volleyball"}
                      onNavigate={closeOnMobile}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          <div className="sidebar-account">
            <div className="sidebar-account-card">
              <small>{ROLE_LABEL[role]}</small>
              <strong>{team ? team.name : (organization?.name ?? "Sem organização")}</strong>
              <span>{organization?.name ?? ""}</span>
            </div>
            <AccessSwitcher className="sidebar-account-action">
              <Repeat size={16} aria-hidden="true" />
              <span>Trocar acesso</span>
            </AccessSwitcher>
            <button type="button" className="sidebar-account-action" onClick={logout}>
              <LogOut size={16} aria-hidden="true" />
              <span>Sair</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}

function NavEntry({
  item,
  active,
  sportKey,
  onNavigate,
}: {
  item: AppModule & { href: string };
  active: boolean;
  sportKey: Parameters<typeof SportIcon>[0]["sportKey"];
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      className={cn("sidebar-link", active && "is-active")}
      aria-current={active ? "page" : undefined}
      title={item.label}
      onClick={onNavigate}
    >
      <span className="sidebar-link-icon">
        {item.icon ? <item.icon size={18} aria-hidden="true" /> : <SportIcon sportKey={sportKey} />}
      </span>
      <span className="sidebar-link-label">{item.label}</span>
    </Link>
  );
}
