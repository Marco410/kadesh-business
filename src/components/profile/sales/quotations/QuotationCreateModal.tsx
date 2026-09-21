"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import {
  CREATE_SAAS_QUOTATION_MUTATION,
  type CreateSaasQuotationResponse,
  type CreateSaasQuotationVariables,
} from "./queries";
import { ClientLeadAutocomplete } from "kadesh/components/shared";
import { useRouter } from "next/navigation";
import { Routes } from "kadesh/core/routes";
import { quotationMotionTransition } from "./motion";

const inputClassName =
  "w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2.5 text-[#212121] dark:text-white text-sm placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500";
const labelClassName =
  "block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5";

export interface QuotationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  companyId: string;
  userId: string;
}

export default function QuotationCreateModal({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  userId,
}: QuotationCreateModalProps) {
  const [leadId, setLeadId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const router = useRouter();
  const reduce = useReducedMotion();
  const transition = quotationMotionTransition(reduce);

  useEffect(() => {
    if (!isOpen) return;
    setLeadId("");
    setValidUntil("");
    setNotes("");
  }, [isOpen]);

  const [createQuotation, { loading }] = useMutation<
    CreateSaasQuotationResponse,
    CreateSaasQuotationVariables
  >(CREATE_SAAS_QUOTATION_MUTATION, {
    onCompleted: (data) => {
      const id = data.createSaasQuotation?.id;
      if (!id) {
        sileo.error({
          title: "La cotización se creó pero no se recibió el ID. Revisa la lista.",
        });
        onSuccess?.();
        onClose();
        return;
      }
      sileo.success({
        title: "Cotización creada.",
        description: "Redirigiendo a la cotización...",
      });
      router.push(Routes.panelQuotation(id));
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      sileo.error({ title: err.message || "No se pudo crear la cotización." });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadId.trim() || loading) return;
    createQuotation({
      variables: {
        data: {
          company: { connect: { id: companyId } },
          createdBy: { connect: { id: userId } },
          assignedSeller: { connect: { id: userId } },
          lead: { connect: { id: leadId.trim() } },
          currency: "MXN",
          ...(validUntil.trim() ? { validUntil: validUntil.trim() } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      },
    });
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="qc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="fixed inset-0 z-[95] bg-black/50"
            onClick={onClose}
          />
          <motion.div
            key="qc-content"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={transition}
            className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div
              className="pointer-events-auto flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-2xl dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="quotation-create-modal-title"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#e0e0e0] bg-[#f5f5f5] px-5 py-4 dark:border-[#3a3a3a] dark:bg-[#2a2a2a]">
                <div className="min-w-0">
                  <h4
                    id="quotation-create-modal-title"
                    className="text-lg font-bold text-[#212121] dark:text-white"
                  >
                    Nueva cotización
                  </h4>
                  <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                    Elige el cliente. Fecha y notas son opcionales.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#616161] hover:bg-[#e5e5e5] hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:bg-[#333] dark:hover:text-white"
                  aria-label="Cerrar"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex-1 space-y-4 overflow-y-auto p-5"
              >
                <ClientLeadAutocomplete
                  id="qc-lead"
                  userId={userId}
                  enabled={isOpen}
                  selectedLeadId={leadId || null}
                  onSelectedLeadIdChange={(id) => setLeadId(id ?? "")}
                  placeholder="Buscar cliente por nombre"
                  required
                />

                <div>
                  <label htmlFor="qc-valid-until" className={labelClassName}>
                    Válida hasta
                  </label>
                  <input
                    id="qc-valid-until"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="qc-notes" className={labelClassName}>
                    Notas
                  </label>
                  <textarea
                    id="qc-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas internas o para el cliente"
                    className={inputClassName}
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-[#e0e0e0] pt-4 dark:border-[#3a3a3a]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex min-h-11 items-center rounded-xl border border-[#e0e0e0] px-4 text-sm font-medium text-[#212121] hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:text-white dark:hover:bg-[#333]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !leadId.trim()}
                    className="inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {loading ? "Creando…" : "Crear cotización"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
