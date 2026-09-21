"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowLeft01Icon,
  Copy01Icon,
  Delete02Icon,
  Edit01Icon,
  Invoice01Icon,
  Pdf01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { useParams } from "next/navigation";
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
import {
  quotationFadeUp,
  quotationMotionTransition,
  quotationStagger,
} from "./motion";

const inputClassName =
  "w-full min-h-11 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2.5 text-[#212121] dark:text-white text-sm placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500";
const labelClassName =
  "block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5";
const secondaryBtnClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] px-3.5 text-sm font-medium text-[#212121] hover:bg-[#f5f5f5] disabled:pointer-events-none disabled:opacity-50 dark:border-[#3a3a3a] dark:text-white dark:hover:bg-[#333]";
const primaryBtnClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:pointer-events-none disabled:opacity-50";

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
  const m = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
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

function StatusBadge({ status }: { status: string }) {
  const color = status
    ? QUOTATION_STATUS_COLORS[status as QuotationStatus]
    : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200";
  const label =
    QUOTATION_STATUS_OPTIONS.find((opt) => opt.value === status)?.label ??
    "Sin estado";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}

function DetailMessage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
        <HugeiconsIcon icon={Invoice01Icon} size={24} />
      </span>
      <h1 className="mt-4 text-lg font-bold tracking-tight text-[#212121] dark:text-white">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
        {children}
      </p>
      <Link
        href={`${Routes.panel}?tab=cotizaciones`}
        className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Volver a cotizaciones
      </Link>
    </div>
  );
}

export default function QuotationDetail() {
  const params = useParams<{ id?: string }>();
  const quotationId = params?.id ?? null;
  const { user } = useUser();
  const userId = user?.id ?? "";
  const skipHydrationRef = useRef(false);
  const reduce = useReducedMotion();
  const fadeUp = quotationFadeUp(reduce);

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
    setTerms(detail.terms ?? detail.company?.termsQuotation ?? "");
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

  const hasQuotationsFeature = hasPlanFeature(
    subscription?.planFeatures ?? null,
    PLAN_FEATURE_KEYS.QUOTATIONS,
  );

  function handleSaveQuotation(e?: React.FormEvent) {
    e?.preventDefault();
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

  function handleCopyPublicLink() {
    const url = getPublicQuotationUrl();
    if (!url) {
      sileo.error({ title: "No se pudo generar el enlace público." });
      return;
    }
    void navigator.clipboard
      .writeText(url)
      .then(() => {
        sileo.success({ title: "Enlace público copiado." });
      })
      .catch(() => {
        sileo.info({ title: url });
      });
  }

  function handleOpenPublic() {
    const url = getPublicQuotationUrl();
    if (!url) {
      sileo.error({ title: "No se pudo abrir el enlace público." });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
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
      <DetailMessage title="Falta la cotización">
        Vuelve a la lista e ábrela de nuevo.
      </DetailMessage>
    );
  }

  if (!hasQuotationsFeature) {
    return <FeatureLockedSection sectionName="Cotizaciones" />;
  }

  const saveButton = (
    <button
      type="submit"
      form="quotation-detail-form"
      disabled={savingQuotation || !detail}
      className={primaryBtnClass}
    >
      {savingQuotation ? "Guardando…" : "Guardar"}
    </button>
  );

  return (
    <>
      <motion.div
        className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 pb-28 sm:px-6 sm:pb-10 lg:px-8"
        variants={quotationStagger(reduce)}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={fadeUp}
          transition={quotationMotionTransition(reduce)}
        >
          <Link
            href={`${Routes.panel}?tab=cotizaciones`}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[#616161] hover:text-orange-500 dark:text-[#b0b0b0] dark:hover:text-orange-400"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Cotizaciones
          </Link>
        </motion.div>

        {loading && !detail ? (
          <div className="space-y-4" aria-busy="true">
            <span className="sr-only">Cargando cotización</span>
            <div className="h-10 w-56 rounded-lg bg-[#ececec] animate-pulse dark:bg-[#333]" />
            <div className="h-48 rounded-2xl border border-[#e0e0e0] bg-white animate-pulse dark:border-[#3a3a3a] dark:bg-[#1e1e1e]" />
            <div className="h-64 rounded-2xl border border-[#e0e0e0] bg-white animate-pulse dark:border-[#3a3a3a] dark:bg-[#1e1e1e]" />
          </div>
        ) : error ? (
          <DetailMessage title="No se pudo cargar">
            {error.message || "Intenta de nuevo en un momento."}
          </DetailMessage>
        ) : !detail ? (
          <DetailMessage title="No se encontró la cotización">
            Puede que la hayan eliminado o que el enlace ya no sea válido.
          </DetailMessage>
        ) : (
          <>
            <motion.div
              variants={fadeUp}
              transition={quotationMotionTransition(reduce)}
              className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-[#212121] dark:text-white sm:text-2xl">
                    {detail.quotationNumber}
                  </h1>
                  <StatusBadge status={status} />
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-[#212121] dark:text-white">
                  {formatMoney(detail.total, cc)}
                </p>
                {detail.lead?.businessName ? (
                  <p className="mt-0.5 text-sm text-[#616161] dark:text-[#b0b0b0]">
                    {detail.lead.businessName}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className={secondaryBtnClass}
                >
                  <HugeiconsIcon icon={Copy01Icon} size={16} />
                  Copiar enlace
                </button>
                <button
                  type="button"
                  onClick={handleOpenPublic}
                  className={secondaryBtnClass}
                >
                  <HugeiconsIcon icon={ViewIcon} size={16} />
                  Ver como cliente
                </button>
                <button
                  type="button"
                  onClick={handleExportPublicPdf}
                  disabled={exportingPdf}
                  className={secondaryBtnClass}
                >
                  <HugeiconsIcon icon={Pdf01Icon} size={16} />
                  {exportingPdf ? "Generando…" : "PDF"}
                </button>
                <span className="hidden sm:inline-flex">{saveButton}</span>
              </div>
            </motion.div>

            <motion.form
              id="quotation-detail-form"
              variants={fadeUp}
              transition={quotationMotionTransition(reduce)}
              onSubmit={handleSaveQuotation}
              className="space-y-6 rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-6"
            >
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                    Subtotal
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {formatMoney(detail.subtotal, cc)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                    Descuento
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {formatMoney(detail.discountTotal, cc)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                    IVA
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {formatMoney(detail.taxTotal, cc)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                    Total
                  </dt>
                  <dd className="mt-0.5 font-semibold tabular-nums">
                    {formatMoney(detail.total, cc)}
                  </dd>
                </div>
              </dl>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="qd-number" className={labelClassName}>
                    Folio
                  </label>
                  <input
                    id="qd-number"
                    type="text"
                    readOnly
                    value={quotationNumber}
                    className={`${inputClassName} cursor-default opacity-80`}
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
                {sentAt ? (
                  <div>
                    <p className={labelClassName}>Enviada</p>
                    <p className="text-sm text-[#212121] dark:text-white">
                      {formatDateShort(sentAt)}
                    </p>
                  </div>
                ) : null}
                {acceptedAt ? (
                  <div>
                    <p className={labelClassName}>Aceptada</p>
                    <p className="text-sm text-[#212121] dark:text-white">
                      {formatDateShort(acceptedAt)}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ClientLeadAutocomplete
                  id="qd-lead"
                  userId={userId}
                  enabled
                  selectedLeadId={leadId || null}
                  onSelectedLeadIdChange={(id) => setLeadId(id ?? "")}
                  placeholder="Buscar cliente por nombre"
                  required
                />
                {leadId ? (
                  <ClientProjectAutocomplete
                    id="qd-project"
                    userId={userId}
                    leadId={leadId || null}
                    enabled
                    selectedProjectId={projectId || null}
                    onSelectedProjectIdChange={(id) => setProjectId(id ?? "")}
                    placeholder="Buscar proyecto por nombre"
                  />
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                <label
                  htmlFor="qd-show-discount"
                  className="inline-flex min-h-11 items-center gap-2 text-sm text-[#616161] dark:text-[#b0b0b0]"
                >
                  <input
                    id="qd-show-discount"
                    type="checkbox"
                    checked={showDiscount}
                    onChange={(e) => setShowDiscount(e.target.checked)}
                    className="h-4 w-4 rounded border-[#d1d5db] text-orange-500 focus:ring-orange-500"
                  />
                  Mostrar descuento al cliente
                </label>
                <label
                  htmlFor="qd-show-notes"
                  className="inline-flex min-h-11 items-center gap-2 text-sm text-[#616161] dark:text-[#b0b0b0]"
                >
                  <input
                    id="qd-show-notes"
                    type="checkbox"
                    checked={showNotes}
                    onChange={(e) => setShowNotes(e.target.checked)}
                    className="h-4 w-4 rounded border-[#d1d5db] text-orange-500 focus:ring-orange-500"
                  />
                  Mostrar notas al cliente
                </label>
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
                  rows={5}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className={inputClassName}
                />
              </div>
            </motion.form>

            <motion.section
              variants={fadeUp}
              transition={quotationMotionTransition(reduce)}
              className="space-y-4 rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-[#212121] dark:text-white">
                  Conceptos
                  <span className="ml-2 font-normal text-[#616161] dark:text-[#b0b0b0]">
                    {products.length}
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={openCreateProduct}
                  className={primaryBtnClass}
                >
                  <HugeiconsIcon icon={Add01Icon} size={18} />
                  Agregar línea
                </button>
              </div>

              {products.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-10 text-center">
                  <p className="text-sm font-medium text-[#212121] dark:text-white">
                    Aún no hay conceptos
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-[#616161] dark:text-[#b0b0b0]">
                    Agrega productos o servicios. El total de la cotización se
                    calcula con estas líneas.
                  </p>
                  <button
                    type="button"
                    onClick={openCreateProduct}
                    className={`${primaryBtnClass} mt-4`}
                  >
                    <HugeiconsIcon icon={Add01Icon} size={18} />
                    Agregar línea
                  </button>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-[#eee] overflow-hidden rounded-xl border border-[#e8e8e8] dark:divide-[#333] dark:border-[#3a3a3a] md:hidden">
                    {products.map((row, index) => (
                      <li
                        key={row.id}
                        style={{
                          animationDelay: `${Math.min(index, 8) * 40}ms`,
                        }}
                        className="clientes-row-in p-4"
                      >
                        <p className="font-medium text-[#212121] dark:text-white">
                          {row.description ?? "—"}
                        </p>
                        <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
                          {row.quantity ?? "—"} ×{" "}
                          {formatMoney(row.unitPrice, cc)}
                          {row.taxRate != null ? ` · IVA ${row.taxRate}%` : ""}
                          {showDiscount &&
                          row.discountType &&
                          row.discountType !== "none"
                            ? ` · desc. ${formatRowDiscount(row.discountType, row.discountValue, cc)}`
                            : ""}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <p className="font-semibold tabular-nums">
                            {formatMoney(row.lineTotal, cc)}
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditProduct(row)}
                              disabled={deletingProduct}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a]"
                              aria-label="Editar concepto"
                            >
                              <HugeiconsIcon icon={Edit01Icon} size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteProductConfirm(row)}
                              disabled={deletingProduct}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-red-700 dark:border-red-900/60 dark:text-red-400"
                              aria-label="Eliminar concepto"
                            >
                              <HugeiconsIcon icon={Delete02Icon} size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className={`${quotationTableWrapClass} hidden md:block`}>
                    <div className="max-h-[680px] overflow-auto">
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
                            {showDiscount ? (
                              <>
                                <th
                                  className={`${quotationThClass} text-right`}
                                >
                                  Tipo desc.
                                </th>
                                <th
                                  className={`${quotationThClass} text-right`}
                                >
                                  Descuento
                                </th>
                              </>
                            ) : null}
                            <th className={`${quotationThClass} text-right`}>
                              Subtotal
                            </th>
                            <th className={`${quotationThClass} text-right`}>
                              Total
                            </th>
                            <th
                              className={`${quotationThClass} w-28 text-right`}
                            >
                              <span className="sr-only">Acciones</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((row, index) => (
                            <tr
                              key={row.id}
                              style={{
                                animationDelay: `${Math.min(index, 8) * 40}ms`,
                              }}
                              className="clientes-row-in"
                            >
                              <td
                                className={`${quotationTdClass} max-w-[220px]`}
                              >
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
                              {showDiscount ? (
                                <>
                                  <td
                                    className={`${quotationTdClass} text-right tabular-nums`}
                                  >
                                    {QUOTATION_DISCOUNT_TYPE_OPTIONS.find(
                                      (opt) => opt.value === row.discountType,
                                    )?.label ?? "—"}
                                  </td>
                                  <td
                                    className={`${quotationTdClass} text-right tabular-nums`}
                                  >
                                    {formatRowDiscount(
                                      row.discountType,
                                      row.discountValue,
                                      cc,
                                    )}
                                  </td>
                                </>
                              ) : null}
                              <td
                                className={`${quotationTdClass} text-right tabular-nums`}
                              >
                                {formatMoney(row.lineSubtotal, cc)}
                              </td>
                              <td
                                className={`${quotationTdClass} text-right font-medium tabular-nums`}
                              >
                                {formatMoney(row.lineTotal, cc)}
                              </td>
                              <td className={`${quotationTdClass} text-right`}>
                                <div className="inline-flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openEditProduct(row)}
                                    disabled={deletingProduct}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e0e0] hover:bg-[#f5f5f5] disabled:opacity-50 dark:border-[#3a3a3a] dark:hover:bg-[#333]"
                                    aria-label="Editar concepto"
                                  >
                                    <HugeiconsIcon
                                      icon={Edit01Icon}
                                      size={14}
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDeleteProductConfirm(row)
                                    }
                                    disabled={deletingProduct}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
                                    aria-label="Eliminar concepto"
                                  >
                                    <HugeiconsIcon
                                      icon={Delete02Icon}
                                      size={14}
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </motion.section>
          </>
        )}
      </motion.div>

      {detail ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e0e0e0] bg-white px-4 py-3 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:hidden">
          <button
            type="submit"
            form="quotation-detail-form"
            disabled={savingQuotation}
            className={`${primaryBtnClass} w-full`}
          >
            {savingQuotation ? "Guardando…" : "Guardar cotización"}
          </button>
        </div>
      ) : null}

      <QuotationProductFormModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSuccess={() => void refetch()}
        mode={productModalMode}
        product={editingProduct}
        presetQuotationId={productModalMode === "create" ? quotationId : null}
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
    </>
  );
}
