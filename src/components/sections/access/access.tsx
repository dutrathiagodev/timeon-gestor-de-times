"use client";

import TopBar from "@/components/layout/top-bar";
import { useActiveContext } from "@/components/layout/active-context";
import { canManageAccess } from "@/lib/teams";

/**
 * Esqueleto da gestão de acesso (card 00042): mostra o que a administração e o gestor
 * vão fazer, mas ainda não lê nem grava nada no banco.
 */
export default function AccessClient() {
  const { organization, team, role } = useActiveContext();

  if (!canManageAccess(role)) {
    return (
      <div className="page-shell">
        <TopBar title="Gestão de acesso" />
        <section className="empty-state">
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
        badge={organization?.name}
        description="Quem entra, com qual papel e em qual time."
      />

      <section className="section-block" aria-labelledby="acc-code">
        <h2 id="acc-code">Código do time</h2>
        <p>
          {team ? `Time ativo: ${team.name}. ` : "Escolha um time para gerar o código. "}
          O código tem o papel fixo, vale uma vez para a comissão e pode exigir aprovação. Menores
          de idade são cadastrados só por técnico, gestor ou administração.
        </p>
        <button type="button" className="btn btn-primary" disabled>
          Gerar código
        </button>
        <p className="hint">Disponível quando o acesso por código estiver ligado.</p>
      </section>

      <section className="section-block" aria-labelledby="acc-pending">
        <h2 id="acc-pending">Pedidos pendentes</h2>
        <p>Nenhum pedido agora. Quem usar um código com aprovação aparece aqui para Aceitar ou Recusar, também em lote.</p>
      </section>

      <section className="section-block" aria-labelledby="acc-people">
        <h2 id="acc-people">Pessoas e papéis</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Pessoa</th>
                <th scope="col">Papel</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} className="table-empty">
                  Ninguém listado ainda. As pessoas aparecem aqui quando o acesso por código estiver ligado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
