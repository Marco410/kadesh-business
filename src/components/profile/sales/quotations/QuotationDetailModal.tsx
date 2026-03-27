"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import {
  SAAS_QUOTATION_DETAIL_QUERY,
  UPDATE_SAAS_QUOTATION_MUTATION,
  type SaasQuotationDetailResponse,
  type SaasQuotationDetailVariables,
  type SaasQuotationProductRow,
  type UpdateSaasQuotationResponse,
  type UpdateSaasQuotationVariables,
} from "./queries";
import QuotationProductFormModal from "./QuotationProductFormModal";
import {
  quotationTableWrapClass,
  quotationThClass,
  quotationTdClass,
} from "./quotation-table-classes";
import { ClientLeadAutocomplete } from "kadesh/components/shared";

const inputClassName =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";
const labelClassName = "block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5";

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(val: string): string | null {
  const t = val.trim();
  if (!t) return null;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function parseNum(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function relPatch(
  current: string,
  initial: string,
  field: "lead" | "assignedSeller" | "project",
): Record<string, unknown> | undefined {
  const c = current.trim();
  const i = initial.trim();
  if (c === i) return undefined;
  if (c) return { [field]: { connect: { id: c } } };
  if (i) return { [field]: { disconnect: true } };
  return undefined;
}

function formatMoney(
  n: number | null | undefined,
  currency = "MXN",
): string {
  if (n == null || Number.isNaN(n)) return "—";
  const code = currency?.trim() || "MXN";
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: code,
    }).format(n);
  } catch {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(n);
  }
}

export interface QuotationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationId: string | null;
  userId: string;
  onUpdated?: () => void;
}

export default function QuotationDetailModal({
  isOpen,
  onClose,
  quotationId,
  userId,
  onUpdated,
}: QuotationDetailModalProps) {
  const skipHydrationRef = useRef(false);

  const [quotationNumber, setQuotationNumber] = useState("");
  const [status, setStatus] = useState("");
  const [currency, setCurrency] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [sentAt, setSentAt] = useState("");
  const [acceptedAt, setAcceptedAt] = useState("");
  const [leadId, setLeadId] = useState("");
  const [assignedSellerId, setAssignedSellerId] = useState("");
  const [projectId, setProjectId] = useState("");

  const [initialLeadId, setInitialLeadId] = useState("");
  const [initialSellerId, setInitialSellerId] = useState("");
  const [initialProjectId, setInitialProjectId] = useState("");

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingProduct, setEditingProduct] =
    useState<SaasQuotationProductRow | null>(null);

  const { data, loading, error, refetch } = useQuery<
    SaasQuotationDetailResponse,
    SaasQuotationDetailVariables
  >(SAAS_QUOTATION_DETAIL_QUERY, {
    skip: !isOpen || !quotationId,
    variables: quotationId ? { where: { id: quotationId } } : undefined,
    fetchPolicy: "network-only",
  });

  const detail = data?.saasQuotation;

  useEffect(() => {
    skipHydrationRef.current = false;
  }, [quotationId]);

  useEffect(() => {
    if (!isOpen) {
      skipHydrationRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !quotationId) return;
    if (!detail || detail.id !== quotationId) return;
    if (skipHydrationRef.current) return;
    skipHydrationRef.current = true;

    setQuotationNumber(detail.quotationNumber ?? "");
    setStatus(detail.status ?? "");
    setCurrency(detail.currency ?? "");
    setExchangeRate(
      detail.exchangeRate != null ? String(detail.exchangeRate) : "",
    );
    setNotes(detail.notes ?? "");
    setTerms(detail.terms ?? "");
    setValidUntil(toDatetimeLocal(detail.validUntil));
    setSentAt(toDatetimeLocal(detail.sentAt));
    setAcceptedAt(toDatetimeLocal(detail.acceptedAt));

    const lid = detail.lead?.id ?? "";
    const sid = detail.assignedSeller?.id ?? "";
    const pid = detail.project?.id ?? "";
    setLeadId(lid);
    setAssignedSellerId(sid);
    setProjectId(pid);
    setInitialLeadId(lid);
    setInitialSellerId(sid);
    setInitialProjectId(pid);
  }, [isOpen, quotationId, detail]);

  const [updateQuotation, { loading: savingQuotation }] = useMutation<
    UpdateSaasQuotationResponse,
    UpdateSaasQuotationVariables
  >(UPDATE_SAAS_QUOTATION_MUTATION, {
    onCompleted: () => {
      sileo.success({ title: "Cotización actualizada." });
      void refetch();
      onUpdated?.();
    },
    onError: (err) => {
      sileo.error({
        title: err.message || "No se pudo guardar la cotización.",
      });
    },
  });

  function handleClose() {
    onClose();
  }

  function handleSaveQuotation(e: React.FormEvent) {
    e.preventDefault();
    if (!quotationId) return;

    const ex = parseNum(exchangeRate);
    const payload: Record<string, unknown> = {
      quotationNumber: quotationNumber.trim(),
      status: status.trim() || null,
      currency: currency.trim() || null,
      exchangeRate: ex,
      notes: notes.trim() || null,
      terms: terms.trim() || null,
      validUntil: fromDatetimeLocal(validUntil),
      sentAt: fromDatetimeLocal(sentAt),
      acceptedAt: fromDatetimeLocal(acceptedAt),
    };

    const lp = relPatch(leadId, initialLeadId, "lead");
    const sp = relPatch(assignedSellerId, initialSellerId, "assignedSeller");
    const pp = relPatch(projectId, initialProjectId, "project");
    if (lp) Object.assign(payload, lp);
    if (sp) Object.assign(payload, sp);
    if (pp) Object.assign(payload, pp);

    void updateQuotation({
      variables: {
        where: { id: quotationId },
        data: payload,
      },
    });
  }

  function openCreateProduct() {
    setProductModalMode("create");
    setEditingProduct(null);
    setProductModalOpen(true);
  }

  function openEditProduct(row: SaasQuotationProductRow) {
    setProductModalMode("edit");
    setEditingProduct(row);
    setProductModalOpen(true);
  }

  const cc = detail?.currency?.trim() || "MXN";
  const products = detail?.quotationProducts ?? [];

  if (!isOpen || !quotationId) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="qd-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4"
        onClick={handleClose}
      />
      <motion.div
        key="qd-content"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="fixed inset-0 z-[82] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a] flex flex-col"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quotation-detail-title"
        >
          <div className="flex justify-between items-center p-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a] shrink-0">
            <h4
              id="quotation-detail-title"
              className="text-lg font-bold text-[#212121] dark:text-[#ffffff]"
            >
              Cotización {detail?.quotationNumber ?? ""}
            </h4>
            <button
              type="button"
              onClick={handleClose}
              className="text-2xl font-bold text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-[#333]"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1 space-y-6">
            {loading && !detail ? (
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                Cargando…
              </p>
            ) : error ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error.message}
              </p>
            ) : !detail ? (
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                No se encontró la cotización.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] p-3 text-sm">
                  <div>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      Subtotal
                    </p>
                    <p className="font-medium tabular-nums">
                      {formatMoney(detail.subtotal, cc)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      Descuento
                    </p>
                    <p className="font-medium tabular-nums">
                      {formatMoney(detail.discountTotal, cc)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      Impuestos
                    </p>
                    <p className="font-medium tabular-nums">
                      {formatMoney(detail.taxTotal, cc)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      Total
                    </p>
                    <p className="font-semibold tabular-nums">
                      {formatMoney(detail.total, cc)}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveQuotation} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="qd-number" className={labelClassName}>
                        Folio / número
                      </label>
                      <input
                        id="qd-number"
                        type="text"
                        value={quotationNumber}
                        onChange={(e) => setQuotationNumber(e.target.value)}
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="qd-status" className={labelClassName}>
                        Estado
                      </label>
                      <input
                        id="qd-status"
                        type="text"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={inputClassName}
                        placeholder="Ej. DRAFT, SENT"
                      />
                    </div>
                    <div>
                      <label htmlFor="qd-currency" className={labelClassName}>
                        Moneda
                      </label>
                      <input
                        id="qd-currency"
                        type="text"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className={inputClassName}
                        placeholder="MXN"
                      />
                    </div>
                    <div>
                      <label htmlFor="qd-rate" className={labelClassName}>
                        Tipo de cambio
                      </label>
                      <input
                        id="qd-rate"
                        type="text"
                        inputMode="decimal"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(e.target.value)}
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="qd-valid" className={labelClassName}>
                        Válida hasta
                      </label>
                      <input
                        id="qd-valid"
                        type="datetime-local"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="qd-sent" className={labelClassName}>
                        Enviada
                      </label>
                      <input
                        id="qd-sent"
                        type="datetime-local"
                        value={sentAt}
                        onChange={(e) => setSentAt(e.target.value)}
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="qd-accepted" className={labelClassName}>
                        Aceptada
                      </label>
                      <input
                        id="qd-accepted"
                        type="datetime-local"
                        value={acceptedAt}
                        onChange={(e) => setAcceptedAt(e.target.value)}
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                    <ClientLeadAutocomplete
                        id="qd-lead"
                        userId={userId}
                        enabled={isOpen}
                        selectedLeadId={leadId || null}
                        onSelectedLeadIdChange={(id) => setLeadId(id ?? "")}
                        placeholder="Buscar cliente por nombre"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="qd-seller" className={labelClassName}>
                        Vendedor (ID)
                      </label>
                      <input
                        id="qd-seller"
                        type="text"
                        value={assignedSellerId}
                        onChange={(e) => setAssignedSellerId(e.target.value)}
                        className={inputClassName}
                      />
                      {detail.assignedSeller?.name ? (
                        <p className="mt-1 text-xs text-[#616161] dark:text-[#9e9e9e]">
                          {detail.assignedSeller.name}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor="qd-project" className={labelClassName}>
                        Proyecto (ID)
                      </label>
                      <input
                        id="qd-project"
                        type="text"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className={inputClassName}
                      />
                      {detail.project?.name ? (
                        <p className="mt-1 text-xs text-[#616161] dark:text-[#9e9e9e]">
                          {detail.project.name}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="qd-notes" className={labelClassName}>
                      Notas
                    </label>
                    <textarea
                      id="qd-notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="qd-terms" className={labelClassName}>
                      Términos
                    </label>
                    <textarea
                      id="qd-terms"
                      rows={3}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className={inputClassName}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] text-sm font-medium hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
                    >
                      Cerrar
                    </button>
                    <button
                      type="submit"
                      disabled={savingQuotation}
                      className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {savingQuotation ? "Guardando…" : "Guardar cotización"}
                    </button>
                  </div>
                </form>

                <div className="space-y-3 border-t border-[#e0e0e0] dark:border-[#3a3a3a] pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h5 className="text-base font-semibold text-[#212121] dark:text-white">
                      Conceptos ({products.length})
                    </h5>
                    <button
                      type="button"
                      onClick={openCreateProduct}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                      <HugeiconsIcon icon={Add01Icon} size={18} />
                      Agregar línea
                    </button>
                  </div>

                  <div className={quotationTableWrapClass}>
                    <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
                      <table className="w-full min-w-[720px] border-collapse">
                        <thead className="sticky top-0 z-[1]">
                          <tr>
                            <th className={quotationThClass}>Descripción</th>
                            <th className={`${quotationThClass} text-right`}>
                              P. unit.
                            </th>
                            <th className={`${quotationThClass} text-right`}>
                              Cant.
                            </th>
                            <th className={`${quotationThClass} text-right`}>
                              IVA %
                            </th>
                            <th className={`${quotationThClass} text-right`}>
                              Subtotal línea
                            </th>
                            <th className={`${quotationThClass} text-right`}>
                              Total línea
                            </th>
                            <th
                              className={`${quotationThClass} text-right w-24`}
                            >
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                className={`${quotationTdClass} text-center py-8 text-[#616161] dark:text-[#9e9e9e]`}
                              >
                                No hay conceptos. Usa “Agregar línea”.
                              </td>
                            </tr>
                          ) : (
                            products.map((row) => (
                              <tr key={row.id}>
                                <td className={`${quotationTdClass} max-w-[200px]`}>
                                  <span className="line-clamp-2">
                                    {row.description ?? "—"}
                                  </span>
                                </td>
                                <td
                                  className={`${quotationTdClass} text-right tabular-nums`}
                                >
                                  {formatMoney(row.unitPrice, cc)}
                                </td>
                                <td
                                  className={`${quotationTdClass} text-right tabular-nums`}
                                >
                                  {row.quantity ?? "—"}
                                </td>
                                <td
                                  className={`${quotationTdClass} text-right tabular-nums`}
                                >
                                  {row.taxRate ?? "—"}
                                </td>
                                <td
                                  className={`${quotationTdClass} text-right tabular-nums`}
                                >
                                  {formatMoney(row.lineSubtotal, cc)}
                                </td>
                                <td
                                  className={`${quotationTdClass} text-right tabular-nums`}
                                >
                                  {formatMoney(row.lineTotal, cc)}
                                </td>
                                <td
                                  className={`${quotationTdClass} text-right`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => openEditProduct(row)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] px-2 py-1 text-xs font-medium text-[#212121] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
                                  >
                                    <HugeiconsIcon icon={Edit01Icon} size={14} />
                                    Editar
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <QuotationProductFormModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSuccess={() => void refetch()}
        mode={productModalMode}
        product={editingProduct}
        presetQuotationId={
          productModalMode === "create" ? quotationId : null
        }
      />
    </AnimatePresence>
  );
}