"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import {
  CREATE_SAAS_QUOTATION_MUTATION,
  type CreateSaasQuotationResponse,
  type CreateSaasQuotationVariables,
} from "./queries";

const inputClassName =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";
const labelClassName = "block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5";

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
  const [quotationNumber, setQuotationNumber] = useState("");
  const [leadId, setLeadId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setQuotationNumber("");
    setLeadId("");
    setValidUntil("");
    setNotes("");
  }, [isOpen]);

  const [createQuotation, { loading }] = useMutation<
    CreateSaasQuotationResponse,
    CreateSaasQuotationVariables
  >(CREATE_SAAS_QUOTATION_MUTATION, {
    onCompleted: () => {
      sileo.success({ title: "Cotización creada." });
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      sileo.error({ title: err.message || "No se pudo crear la cotización." });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createQuotation({
      variables: {
        data: {
          company: { connect: { id: companyId } },
          createdBy: { connect: { id: userId } },
          assignedSeller: { connect: { id: userId } },
          currency: "MXN",
          ...(quotationNumber.trim()
            ? { quotationNumber: quotationNumber.trim() }
            : {}),
          ...(leadId.trim() ? { lead: { connect: { id: leadId.trim() } } } : {}),
          ...(validUntil.trim() ? { validUntil: validUntil.trim() } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      },
    });
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="qc-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[95] flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="qc-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a] flex flex-col"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quotation-create-modal-title"
        >
          <div className="flex justify-between items-center p-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a]">
            <h4
              id="quotation-create-modal-title"
              className="text-lg font-bold text-[#212121] dark:text-[#ffffff]"
            >
              Nueva cotización
            </h4>
            <button
              type="button"
              onClick={onClose}
              className="text-2xl font-bold text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-[#333]"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 overflow-y-auto space-y-4 flex-1"
          >

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

            <div className="flex gap-2 justify-end pt-2 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] text-sm font-medium hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? "Creando…" : "Crear cotización"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
