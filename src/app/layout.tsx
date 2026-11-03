import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ActiveContextProvider } from "@/components/layout/active-context";
import AppFrame from "@/components/layout/app-frame";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { getOrganizationOptions, getTeamOptions, getUserRole } from "@/lib/teams";
import { cn } from "@/lib/utils";

// Fonte única do Design System (Inter). Self-hosted pelo next/font: nenhuma chamada ao Google em produção.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TimeOn | Gestao de times",
  description:
    "Plataforma para gerenciar times, elenco, jogos, estatisticas e escalacoes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn(inter.variable)}>
      <body>
        <ActiveContextProvider
          organizations={getOrganizationOptions()}
          teams={getTeamOptions()}
          role={getUserRole()}
        >
          <SidebarProvider>
            <AppFrame>{children}</AppFrame>
            <SpeedInsights />
          </SidebarProvider>
        </ActiveContextProvider>
      </body>
    </html>
  );
}
