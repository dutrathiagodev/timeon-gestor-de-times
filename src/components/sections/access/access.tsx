"use client";

import { KeyRound, ShieldAlert, UserCheck, Users } from "lucide-react";
import TopBar from "@/components/layout/top-bar";
import { SoonBadge } from "@/components/layout/soon-badge";
import { useActiveContext } from "@/components/layout/active-context";
import { canManageAccess } from "@/lib/teams";

/**
 * Esqueleto da gestão de acesso (card 00042): o desenho já mostra o que a administração
 * e o gestor vão fazer, mas ainda não lê nem grava nada no banco.
 */
export default function AccessClient() {
  const { organization, team, role } = useActiveContext();

  if (!canManageAccess(role)) {
    return (
      <div className="page-shell">
        <TopBar title="Gestão de acesso" badge="Sistema" />
        <section className="panel access-card">
          <ShieldAlert size={22} aria-hidden="true" />
          <h2>Só administração e gestor</h2>
          <p>Para entrar em um time, peça o código ao técnico ou ao gestor.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <TopBar
        title="Gestão de acesso"
        badge="Sistema"
        description={`Quem pode entrar em ${organization?.name ?? "sua organização"}, com qual papel e em qual time.`}
      />

      <div className="access-grid">
        <section className="panel access-card" aria-label="Código do time">
          <KeyRound size={22} aria-hidden="true" />
          <h2>Código do time</h2>
          <p>
            {team ? `Time ativo: ${team.name}.` : "Escolha um time para gerar o código."} O código
            tem o papel fixo, vale uma vez para a comissão e pode exigir aprovação.
          </p>
          <button type="button" className="btn btn-primary" disabled title="Em breve">
            Gerar código <SoonBadge />
          </button>
        </section>

        <section className="panel access-card" aria-label="Pedidos pendentes">
          <UserCheck size={22} aria-hidden="true" />
          <h2>Pedidos pendentes</h2>
          <p>Nenhum pedido agora. Quem usar um código com aprovação aparece aqui para Aceitar ou Recusar, também em lote.</p>
        </section>

        <section className="panel access-card access-wide" aria-label="Pessoas e papéis">
          <Users size={22} aria-hidden="true" />
          <h2>Pessoas e papéis</h2>
          <div className="access-table" role="table" aria-label="Pessoas com acesso">
            <div className="access-row is-head" role="row">
              <span role="columnheader">Pessoa</span>
              <span role="columnheader">Papel</span>
              <span role="columnheader">Time</span>
            </div>
            <p className="access-empty">Ninguém listado ainda. As pessoas aparecem aqui quando o acesso por código estiver ligado.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
