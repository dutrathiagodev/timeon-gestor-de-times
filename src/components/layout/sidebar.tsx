"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import AccessSwitcher from "./access-switcher";
import { useActiveContext } from "./active-context";
import { MODULE_GROUPS, modulesFor, type AppModule } from "./modules";
import { ROLE_LABEL } from "./role-label";
import { SoonBadge } from "./soon-badge";
import { SportIcon } from "./sport-icon";
import { useSidebar } from "./sidebar-context";
import { useLogout } from "./use-logout";

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
            {MODULE_GROUPS.map((group) => {
              const items = modulesFor(role, group);
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

function NavEntry({
  item,
  active,
  sportKey,
  onNavigate,
}: {
  item: AppModule;
  active: boolean;
  sportKey: Parameters<typeof SportIcon>[0]["sportKey"];
  onNavigate: () => void;
}) {
  const content = (
    <>
      <span className="sidebar-link-icon">
        {item.icon ? <item.icon size={18} /> : <SportIcon sportKey={sportKey} />}
      </span>
      <span className="sidebar-link-text">
        <strong>{item.label}</strong>
        <small>{item.hint}</small>
      </span>
      {item.href === null && <SoonBadge />}
    </>
  );

  if (item.href === null) {
    return (
      <div className="sidebar-link is-soon" aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn("sidebar-link", active && "is-active")}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
    >
      {content}
    </Link>
  );
}
