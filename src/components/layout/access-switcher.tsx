"use client";

import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { OrganizationSwitcher, TeamSwitcher, useActiveContext } from "./active-context";
import { ROLE_LABEL } from "./role-label";

/** Botão que abre o diálogo "Trocar acesso": organização e time ativos. */
export default function AccessSwitcher({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { role } = useActiveContext();

  return (
    <>
      <button type="button" className={className} onClick={() => dialog.current?.showModal()}>
        {children}
      </button>
      <dialog
        ref={dialog}
        className="access-dialog"
        aria-labelledby="access-dialog-title"
        onClick={(event) => event.target === dialog.current && dialog.current?.close()}
      >
        <div className="access-dialog-head">
          <h2 id="access-dialog-title">Trocar acesso</h2>
          <button
            type="button"
            className="access-dialog-close"
            aria-label="Fechar"
            onClick={() => dialog.current?.close()}
          >
            <X size={18} />
          </button>
        </div>
        <p className="access-dialog-role">Seu papel: {ROLE_LABEL[role]}</p>
        <OrganizationSwitcher id="dialog-org" />
        <TeamSwitcher id="dialog-team" />
        <button type="button" className="btn btn-primary" onClick={() => dialog.current?.close()}>
          Pronto
        </button>
      </dialog>
    </>
  );
}
