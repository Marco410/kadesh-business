"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { ClientLeadAutocomplete } from "kadesh/components/shared";
import {
  CREATE_TECH_PROPOSAL_MUTATION,
  TECH_PROPOSALS_QUERY,
  type CreateTechProposalMutation,
  type CreateTechProposalVariables,
  type TechProposalsVariables,
} from "kadesh/components/profile/sales/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import { workspaceConnectPayload } from "kadesh/components/profile/sales/workspaces/workspace-connect";
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

function RequiredFieldMark() {
  return (
    <span className="text-red-500" aria-hidden="true">
      *
    </span>
  );
}

export interface CreateWorkspaceProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  userId: string;
  defaultStatusCrmId?: string | null;
}

export default function CreateWorkspaceProposalModal({
  isOpen,
  onClose,
  workspaceId,
  userId,
  defaultStatusCrmId,
}: CreateWorkspaceProposalModalProps) {
  const [leadId, setLeadId] = useState("");
  const [sentDate, setSentDate] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<string>(PROPOSAL_STATUS.ENVIADA);
  const [product, setProduct] = useState("");
  const [notes, setNotes] = useState("");
  const [fileOrUrl, setFileOrUrl] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLeadId("");
    setSentDate(formatDateForInput(new Date().toISOString()));
    setAmount("");
    setStatus(PROPOSAL_STATUS.ENVIADA);
    setProduct("");
    setNotes("");
    setFileOrUrl("");
  }, [isOpen]);

  const boardWhere: TechProposalsVariables["where"] = mergeWorkspaceFilter({}, workspaceId);

  const [createProposal, { loading }] = useMutation<
    CreateTechProposalMutation,
    CreateTechProposalVariables
  >(CREATE_TECH_PROPOSAL_MUTATION, {
    refetchQueries: [{ query: TECH_PROPOSALS_QUERY, variables: { where: boardWhere } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      sileo.success({ title: "Propuesta registrada" });
      onClose();
    },
    onError: (err) => sileo.error({ title: err.message || "No se pudo registrar la propuesta" }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadId.trim()) {
      sileo.warning({ title: "Selecciona un lead" });
      return;
    }
    const amountNum = parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum < 0) {
      sileo.warning({ title: "El monto debe ser un número válido" });
      return;
    }

    const statusCrmConnect =
      defaultStatusCrmId != null && defaultStatusCrmId !== ""
        ? { statusCrm: { connect: { id: defaultStatusCrmId } } }
        : {};

    createProposal({
      variables: {
        data: {
          sentDate: sentDate || formatDateForInput(new Date().toISOString()),
          amount: amountNum,
          status: status || PROPOSAL_STATUS.ENVIADA,
          fileOrUrl: fileOrUrl.trim(),
          product: product.trim() || null,
          notes: notes.trim() || null,
          businessLead: { connect: { id: leadId.trim() } },
          assignedSeller: { connect: { id: userId } },
          createdBy: { connect: { id: userId } },
          ...workspaceConnectPayload(workspaceId),
          ...statusCrmConnect,
        },
      },
    });
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cwp-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="cwp-dialog"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="modal fixed inset-0 z-[125] pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-lg rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-ws-proposal-title"
        >
          <div className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] px-5 py-4">
            <h2
              id="create-ws-proposal-title"
              className="text-lg font-semibold text-[#212121] dark:text-white"
            >
              Registrar propuesta
            </h2>
            <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e]">
              Se registrará dentro del workspace actual.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <ClientLeadAutocomplete
              id="ws-proposal-lead"
              userId={userId}
              enabled={isOpen}
              selectedLeadId={leadId || null}
              onSelectedLeadIdChange={(id) => setLeadId(id ?? "")}
              placeholder="Buscar cliente por nombre"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                  Fecha envío <RequiredFieldMark />
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
                  Estado <RequiredFieldMark />
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClassName}
                  required
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
                URL o referencia al archivo <RequiredFieldMark />
              </label>
              <input
                value={fileOrUrl}
                onChange={(e) => setFileOrUrl(e.target.value)}
                className={inputClassName}
                required
                minLength={1}
                placeholder="Pega aquí el enlace del doc…"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Producto o servicio principal <RequiredFieldMark />
              </label>
              <input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className={inputClassName}
                required
                minLength={1}
                placeholder="Ej. Paquete pro, plan starter…"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Monto <RequiredFieldMark />
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputClassName}
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                Notas <RequiredFieldMark />
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClassName}
                rows={3}
                placeholder="Condiciones, alcances…"
                required
                minLength={1}
              />
            </div>

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
                {loading ? "Guardando…" : "Registrar"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

