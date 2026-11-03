import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ActiveContextProvider } from "@/components/layout/active-context";
import AppFrame from "@/components/layout/app-frame";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { getOrganizationOptions, getTeamOptions, getUserRole } from "@/lib/teams";
import { cn } from "@/lib/utils";

// Brand typeface (from the TimeOn logo). Self-hosted by next/font: no request to Google at runtime.
const sora = Sora({
  variable: "--font-sora",
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
    <html lang="pt-BR" className={cn(sora.variable)}>
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
