"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "./app-header";
import Sidebar from "./sidebar";

/** Moldura do app: cabeçalho, menu lateral e conteúdo. O login ocupa a tela inteira, sem moldura. */
export default function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return (
      <div className="app-shell is-bare">
        <div className="app-gradient" />
        <main className="app-main">{children}</main>
      </div>
    );
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo
      </a>
      <AppHeader />
      <Sidebar />
      <div className="app-shell">
        <div className="app-gradient" />
        <main id="conteudo" tabIndex={-1} className="app-main">
          {children}
        </main>
      </div>
    </>
  );
}
