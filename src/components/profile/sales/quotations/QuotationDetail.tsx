"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowLeft01Icon, Delete02Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { useParams, useRouter } from "next/navigation";
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
import {
  ClientLeadAutocomplete,
  ClientProjectAutocomplete,
  ConfirmModal,
  DatePickerField,
} from "kadesh/components/shared";
import {
  PLAN_FEATURE_KEYS,
  QUOTATION_CURRENCY_OPTIONS,
  QUOTATION_DISCOUNT_TYPE_OPTIONS,
  QUOTATION_STATUS_COLORS,
  QUOTATION_STATUS_OPTIONS,
  QuotationStatus,
} from "kadesh/constants/constans";
import { useUser } from "kadesh/utils/UserContext";
import { hasPlanFeature } from "../helpers/plan-features";
import { useSubscription } from "../SubscriptionContext";
import FeatureLockedSection from "../FeatureLockedSection";
import { useDeleteSaasQuotationProduct } from "./hooks";
import { formatMoney } from "kadesh/utils/format-currency";
import { formatDateShort } from "kadesh/utils/format-date";
import { buildPublicQuotationSlug } from "kadesh/utils/quotation-public-link";
import { exportQuotationPdf } from "kadesh/utils/export-quotation-pdf";
import { Routes } from "kadesh/core/routes";

const inputClassName =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";
const labelClassName = "block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5";

function toDateOnly(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** ISO 8601 full-date (`YYYY-MM-DD`) para escalares GraphQL tipo CalendarDay. */
function fromDateOnlyToCalendarDay(val: string): string | null {
  const t = val.trim();
  if (!t) return null;
  const dayPart = t.includes("T") ? t.slice(0, 10) : t;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayPart)) return null;
  const [y, m, d] = dayPart.split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  const parsed = new Date(y, m - 1, d);
  if (Number.isNaN(parsed.getTime())) return null;
  return dayPart;
}

/** `YYYY-MM-DDTHH:mm` (hora local) desde un valor ISO/DateTime del servidor. */
function isoLikeToLocalDateTimeMinute(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO 8601 completo (UTC) para escalares GraphQL DateTime; vacío → `null`. */
function localDateTimeMinuteToDateTimeIso(val: string): string | null {
  const raw = val.trim();
  if (!raw) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00` : raw;
  const m = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const day = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  const dt = new Date(y, mo - 1, day, h, mi, 0, 0);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
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

function formatRowDiscount(
  type: string | null | undefined,
  value: number | null | undefined,
  currency: string,
): string {
  if (type == null || value == null || Number.isNaN(value)) return "—";
  const normalized = type.trim().toLowerCase();
  if (!normalized || normalized === "none") return "—";
  if (normalized === "percent") return `${value}%`;
  if (normalized === "amount") return formatMoney(value, currency);
  return String(value);
}

export default function QuotationDetail() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const quotationId = params?.id ?? null;
  const { user } = useUser();
  const userId = user?.id ?? "";
  const skipHydrationRef = useRef(false);

  const [quotationNumber, setQuotationNumber] = useState("");
  const [status, setStatus] = useState("");
  const [currency, setCurrency] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [sentAt, setSentAt] = useState("");
  const [acceptedAt, setAcceptedAt] = useState("");
  const [showDiscount, setShowDiscount] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
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
  const [productPendingDelete, setProductPendingDelete] =
    useState<SaasQuotationProductRow | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const { data, loading, error, refetch } = useQuery<
    SaasQuotationDetailResponse,
    SaasQuotationDetailVariables
  >(SAAS_QUOTATION_DETAIL_QUERY, {
    skip: !quotationId,
    variables: quotationId ? { where: { id: quotationId } } : undefined,
    fetchPolicy: "network-only",
  });


  const detail = data?.saasQuotation;

  useEffect(() => {
    skipHydrationRef.current = false;
  }, [quotationId]);

  useEffect(() => {
    if (!quotationId) return;
    if (!detail || detail.id !== quotationId) return;
    if (skipHydrationRef.current) return;
    skipHydrationRef.current = true;

    setQuotationNumber(detail.quotationNumber ?? "");
    setStatus(detail.status ?? "");
    setCurrency(detail.currency ?? "");
    setNotes(detail.notes ?? "");
    setTerms(detail.terms?? detail.company?.termsQuotation ?? "");
    setShowDiscount(Boolean(detail.showDiscount));
    setShowNotes(detail.showNotes ?? true);
    setValidUntil(toDateOnly(detail.validUntil));

    const lid = detail.lead?.id ?? "";
    const sid = detail.assignedSeller?.id ?? "";
    const pid = detail.project?.id ?? "";
    setLeadId(lid);
    setAssignedSellerId(sid);
    setProjectId(pid);
    setInitialLeadId(lid);
    setInitialSellerId(sid);
    setInitialProjectId(pid);
  }, [quotationId, detail]);

  /** Fuera del “hydrate once”: tras refetch/mutación el servidor puede traer sentAt/acceptedAt nuevos. */
  useEffect(() => {
    if (!quotationId || !detail || detail.id !== quotationId) return;
    setSentAt(isoLikeToLocalDateTimeMinute(detail.sentAt));
    setAcceptedAt(isoLikeToLocalDateTimeMinute(detail.acceptedAt));
  }, [
    quotationId,
    detail?.id,
    detail?.sentAt,
    detail?.acceptedAt,
    detail?.updatedAt,
  ]);

  const [updateQuotation, { loading: savingQuotation }] = useMutation<
    UpdateSaasQuotationResponse,
    UpdateSaasQuotationVariables
  >(UPDATE_SAAS_QUOTATION_MUTATION, {
    onCompleted: () => {
      sileo.success({ title: "Cotización actualizada." });
      void refetch();
    },
    onError: (err) => {
      sileo.error({
        title: err.message || "No se pudo guardar la cotización.",
      });
    },
  });

  const { deleteQuotationProduct, loading: deletingProduct } =
    useDeleteSaasQuotationProduct();

  const { subscription } = useSubscription();

  const color = status
  ? QUOTATION_STATUS_COLORS[status as QuotationStatus]
  : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200";

  const hasQuotationsFeature = hasPlanFeature(
    subscription?.planFeatures ?? null,
    PLAN_FEATURE_KEYS.QUOTATIONS
  );

  function handleSaveQuotation(e: React.FormEvent) {
    e.preventDefault();
    if (!quotationId) return;

    const payload: Record<string, unknown> = {
      quotationNumber: quotationNumber.trim(),
      status: status.trim() || null,
      currency: currency.trim() || null,
      exchangeRate: 1,
      notes: notes.trim() || null,
      terms: terms.trim() || null,
      showDiscount: Boolean(showDiscount),
      showNotes: Boolean(showNotes),
      validUntil: fromDateOnlyToCalendarDay(validUntil),
      sentAt: localDateTimeMinuteToDateTimeIso(sentAt),
      acceptedAt: localDateTimeMinuteToDateTimeIso(acceptedAt),
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

  function openDeleteProductConfirm(row: SaasQuotationProductRow) {
    setProductPendingDelete(row);
  }

  function handleCloseDeleteConfirm() {
    if (!deletingProduct) setProductPendingDelete(null);
  }

  function handleConfirmDeleteProduct() {
    if (!productPendingDelete) return;
    deleteQuotationProduct(productPendingDelete.id, {
      quotationDetailId: quotationId,
      onCompleted: () => setProductPendingDelete(null),
    });
  }

  function handleCopyPublicLink() {
    const url = getPublicQuotationUrl();
    if (!url) {
      sileo.error({ title: "No se pudo generar el enlace publico." });
      return;
    }
    void navigator.clipboard
      .writeText(url)
      .then(() => {
        sileo.success({ title: "Enlace publico copiado." });
      })
      .catch(() => {
        sileo.info({ title: url });
      });
  }

  function getPublicQuotationUrl(): string | null {
    const id = detail?.id?.trim();
    const folio = detail?.quotationNumber?.trim();
    if (!id || !folio) {
      return null;
    }
    const slug = buildPublicQuotationSlug(folio, id);
    const path = Routes.publicQuotation(slug);
    return `${window.location.origin}${path}`;
  }

  async function handleExportPublicPdf() {
    if (!detail) {
      sileo.error({ title: "No se pudo generar el PDF." });
      return;
    }
    try {
      setExportingPdf(true);
      await exportQuotationPdf(detail);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo generar el PDF.";
      sileo.error({ title: message });
    } finally {
      setExportingPdf(false);
    }
  }

  const cc = detail?.currency?.trim() || "MXN";
  const products = detail?.quotationProducts ?? [];

  if (!quotationId) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          Falta el ID de la cotización.
        </p>
      </div>
    );
  }


  if (!hasQuotationsFeature) {
    return (
      <FeatureLockedSection sectionName="Cotizaciones" />
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 space-y-6 mt-10">
        <div className="mt-8">
            <div
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer"
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                Atrás
            </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-[#212121] dark:text-white">
              Cotización {detail?.quotationNumber ?? ""}
            </h1>
            <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
              ID: <span className="font-mono">{quotationId}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <button
              type="button"
              onClick={handleCopyPublicLink}
              className="inline-flex items-center justify-center rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] px-3 py-2 text-sm font-medium text-[#212121] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
              >
              Copiar link para cliente
            </button>
            <button
              type="button"
              onClick={handleExportPublicPdf}
              disabled={exportingPdf}
              className="inline-flex items-center justify-center rounded-lg bg-red-400 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none"
              >
              {exportingPdf ? "Generando PDF..." : "Exportar PDF"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-sm">
          <div className="p-4 space-y-6">
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
                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] p-3 text-sm ${color}`}>
                  <div>
                    <p className="text-md text-[#616161] dark:text-[#b0b0b0]">
                      Subtotal
                    </p>
                    <p className="font-medium tabular-nums">
                      {formatMoney(detail.subtotal, cc)}
                    </p>
                  </div>
                  <div>
                    <p className="text-md text-[#616161] dark:text-[#b0b0b0]">
                      Descuento
                    </p>
                    <p className="font-medium tabular-nums">
                      {formatMoney(detail.discountTotal, cc)}
                    </p>
                  </div>
                  <div>
                    <p className="text-md text-[#616161] dark:text-[#b0b0b0]">
                      Impuestos
                    </p>
                    <p className="font-medium tabular-nums">
                      {formatMoney(detail.taxTotal, cc)}
                    </p>
                  </div>
                  <div>
                    <p className="text-md text-[#616161] dark:text-[#b0b0b0]">
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
                        readOnly
                        value={quotationNumber}
                        onChange={(e) => setQuotationNumber(e.target.value)}
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="qd-status" className={labelClassName}>
                        Estado
                      </label>
                      <select
                        id="qd-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={inputClassName}
                      >
                        <option value="">—</option>
                        {QUOTATION_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="qd-currency" className={labelClassName}>
                        Moneda
                      </label>
                      <select
                        id="qd-currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className={inputClassName}
                      >
                        <option value="">—</option>
                        {currency.trim() &&
                        !QUOTATION_CURRENCY_OPTIONS.some(
                          (opt) => opt.value === currency.trim(),
                        ) ? (
                          <option value={currency.trim()}>
                            {currency.trim()} (actual)
                          </option>
                        ) : null}
                        {QUOTATION_CURRENCY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="qd-valid" className={labelClassName}>
                        Válida hasta
                      </label>
                      <DatePickerField
                        id="qd-valid"
                        ariaLabel="Válida hasta"
                        value={validUntil}
                        onChange={setValidUntil}
                        granularity="day"
                      />
                    </div>
                    {sentAt && (<div>
                      <label htmlFor="qd-sent" className={labelClassName}>
                        Enviada
                      </label>
                      <p className="text-md text-[#616161] dark:text-[#b0b0b0]">{formatDateShort(sentAt)}</p>
                    </div>)}
                    {acceptedAt && (<div>
                      <label htmlFor="qd-accepted" className={labelClassName}>
                        Aceptada
                      </label>
                      <p className="text-md text-[#616161] dark:text-[#b0b0b0]">{formatDateShort(acceptedAt)}</p>
                    </div>)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                    <ClientLeadAutocomplete
                        id="qd-lead"
                        userId={userId}
                        enabled={true}
                        selectedLeadId={leadId || null}
                        onSelectedLeadIdChange={(id) => setLeadId(id ?? "")}
                        placeholder="Buscar cliente por nombre"
                        required
                      />
                    </div>
                    <div>
                      <ClientProjectAutocomplete
                        id="qd-project"
                        userId={userId}
                        enabled={true}
                        selectedProjectId={projectId || null}
                        onSelectedProjectIdChange={(id) =>
                          setProjectId(id ?? "")
                        }
                        placeholder="Buscar proyecto por nombre"
                      />
                    </div>
                    <div className="flex items-end">
                      <label
                        htmlFor="qd-show-discount"
                        className="inline-flex items-center gap-2 text-sm text-[#616161] dark:text-[#b0b0b0]"
                      >
                        <input
                          id="qd-show-discount"
                          type="checkbox"
                          checked={showDiscount}
                          onChange={(e) => setShowDiscount(e.target.checked)}
                          className="h-4 w-4 rounded border-[#d1d5db] text-orange-500 focus:ring-orange-500"
                        />
                        Mostrar descuento en la cotización
                      </label>
                    </div>
                    <div className="flex items-end">
                      <label
                        htmlFor="qd-show-notes"
                        className="inline-flex items-center gap-2 text-sm text-[#616161] dark:text-[#b0b0b0]"
                      >
                        <input
                          id="qd-show-notes"
                          type="checkbox"
                          checked={showNotes}
                          onChange={(e) => setShowNotes(e.target.checked)}
                          className="h-4 w-4 rounded border-[#d1d5db] text-orange-500 focus:ring-orange-500"
                        />
                        Mostrar notas en la cotización
                      </label>
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
                      rows={6}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className={inputClassName}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
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
                    <div className="overflow-x-auto max-h-[680px] overflow-y-auto">
                      <table className="w-full min-w-[920px] border-collapse">
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
                              Tipo desc.
                            </th>
                            <th className={`${quotationThClass} text-right`}>
                              Descuento
                            </th>
                            <th className={`${quotationThClass} text-right`}>
                              Subtotal línea
                            </th>
                            <th className={`${quotationThClass} text-right`}>
                              Total línea
                            </th>
                            <th
                              className={`${quotationThClass} text-right min-w-[8.5rem]`}
                            >
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.length === 0 ? (
                            <tr>
                              <td
                                colSpan={9}
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
                                  {QUOTATION_DISCOUNT_TYPE_OPTIONS.find(opt => opt.value === row.discountType)?.label ?? "—"}
                                </td>
                                <td
                                  className={`${quotationTdClass} text-right tabular-nums`}
                                >
                                  {formatRowDiscount(row.discountType, row.discountValue, cc)}
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
                                  <div className="inline-flex flex-wrap items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => openEditProduct(row)}
                                      disabled={deletingProduct}
                                      className="inline-flex items-center gap-1 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] px-2 py-1 text-xs font-medium text-[#212121] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#333] disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                      <HugeiconsIcon
                                        icon={Edit01Icon}
                                        size={14}
                                      />
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openDeleteProductConfirm(row)}
                                      disabled={deletingProduct}
                                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/60 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                      <HugeiconsIcon
                                        icon={Delete02Icon}
                                        size={14}
                                      />
                                      Eliminar
                                    </button>
                                  </div>
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

      <ConfirmModal
        isOpen={!!productPendingDelete}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDeleteProduct}
        title="Eliminar concepto"
        message={
          productPendingDelete
            ? `¿Eliminar «${
                productPendingDelete.description?.trim() || "este concepto"
              }»? Esta acción no se puede deshacer.`
            : ""
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={deletingProduct}
        confirmButtonColor="red"
      />
      </div>
    </>
  );
}