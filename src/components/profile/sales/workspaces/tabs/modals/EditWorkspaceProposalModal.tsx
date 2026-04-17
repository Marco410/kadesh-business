"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import Link from "next/link";
import {
  TECH_PROPOSALS_QUERY,
  UPDATE_TECH_PROPOSAL_MUTATION,
  type TechProposalsResponse,
  type TechProposalsVariables,
  type UpdateTechProposalMutation,
  type UpdateTechProposalVariables,
} from "kadesh/components/profile/sales/queries";
import type { SaasWorkspaceCrmStatus } from "kadesh/components/profile/sales/workspaces/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import HiddenInWorkspaceSwitch from "./HiddenInWorkspaceSwitch";
import { Routes } from "kadesh/core/routes";
import { PROPOSAL_STATUS } from "kadesh/constants/constans";

const PROPOSAL_STATUS_OPTIONS = Object.values(PROPOSAL_STATUS);

function formatDateForInput(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const inputClassName =
  "w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#252525] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

type ProposalRow = TechProposalsResponse["techProposals"][number];

export interface EditWorkspaceProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  proposal: ProposalRow | null;
  crmStatuses: SaasWorkspaceCrmStatus[];
  defaultCrmStatusId: string | null;
}

export default function EditWorkspaceProposalModal({
  isOpen,
  onClose,
  workspaceId,
  proposal,
  crmStatuses,
  defaultCrmStatusId,
}: EditWorkspaceProposalModalProps) {
  const [sentDate, setSentDate] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [product, setProduct] = useState("");
  const [notes, setNotes] = useState("");
  const [fileOrUrl, setFileOrUrl] = useState("");
  const [statusCrmId, setStatusCrmId] = useState("");
  const [hiddenInWorkspace, setHiddenInWorkspace] = useState(false);

  useEffect(() => {
    if (!isOpen || !proposal) return;
    setSentDate(formatDateForInput(proposal.sentDate));
    setAmount(proposal.amount != null ? String(proposal.amount) : "");
    setStatus(proposal.status);
    setProduct(proposal.product ?? "");
    setNotes(proposal.notes ?? "");
    setFileOrUrl(proposal.fileOrUrl ?? "");
    setStatusCrmId(
      proposal.statusCrm?.id ?? defaultCrmStatusId ?? crmStatuses[0]?.id ?? ""
    );
    setHiddenInWorkspace(proposal.hiddenInWorkspace === true);
  }, [isOpen, proposal, defaultCrmStatusId, crmStatuses]);

  const boardWhere: TechProposalsVariables["where"] = mergeWorkspaceFilter({}, workspaceId);

  const [updateProposal, { loading }] = useMutation<
    UpdateTechProposalMutation,
    UpdateTechProposalVariables
  >(UPDATE_TECH_PROPOSAL_MUTATION, {
    refetchQueries: [{ query: TECH_PROPOSALS_QUERY, variables: { where: boardWhere } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      sileo.success({ title: "Propuesta actualizada" });
      onClose();
    },
    onError: (err) =>
      sileo.error({ title: err.message || "No se pudo actualizar la propuesta" }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!proposal) return;
    if (!fileOrUrl.trim()) {
      sileo.warning({ title: "La URL o referencia al archivo es obligatoria" });
      return;
    }
    const amountNum = amount.trim() ? parseFloat(amount) : null;
    if (amountNum != null && (Number.isNaN(amountNum) || amountNum < 0)) {
      sileo.warning({ title: "El monto debe ser un número válido" });
      return;
    }
    const statusPayload =
      statusCrmId.trim() !== ""
        ? { statusCrm: { connect: { id: statusCrmId.trim() } } }
        : {};
    updateProposal({
      variables: {
        where: { id: proposal.id },
        data: {
          sentDate: sentDate || formatDateForInput(new Date().toISOString()),
          amount: amountNum,
          status: status || PROPOSAL_STATUS.ENVIADA,
          fileOrUrl: fileOrUrl.trim(),
          product: product.trim() || null,
          notes: notes.trim() || null,
          hiddenInWorkspace,
          ...statusPayload,
        },
      },
    });
  }

  if (!isOpen || !proposal) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="ewp-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="ewp-dialog"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="fixed inset-0 z-[125] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-lg rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-ws-proposal-title"
        >
          <div className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] px-5 py-4">
            <h2
              id="edit-ws-proposal-title"
              className="text-lg font-semibold text-[#212121] dark:text-white"
            >
              Editar propuesta
            </h2>
            {proposal.businessLead && (
              <Link
                href={Routes.panelLead(proposal.businessLead.id)}
                className="mt-2 inline-block text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
              >
                Ir al lead: {proposal.businessLead.businessName}
              </Link>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Estado CRM
              </label>
              <select
                value={statusCrmId}
                onChange={(e) => setStatusCrmId(e.target.value)}
                className={inputClassName}
                required
              >
                {crmStatuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                  Fecha envío
                </label>
                <input
                  type="date"
                  value={sentDate}
                  onChange={(e) => setSentDate(e.target.value)}
                  className={inputClassName}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                  Estado (legado)
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClassName}
                >
                  {PROPOSAL_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                URL o referencia al archivo
              </label>
              <input
                value={fileOrUrl}
                onChange={(e) => setFileOrUrl(e.target.value)}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Producto o servicio
              </label>
              <input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Monto
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClassName}
                rows={3}
              />
            </div>

            <HiddenInWorkspaceSwitch
              checked={hiddenInWorkspace}
              onCheckedChange={setHiddenInWorkspace}
              disabled={loading}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-[#616161] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {loading ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
