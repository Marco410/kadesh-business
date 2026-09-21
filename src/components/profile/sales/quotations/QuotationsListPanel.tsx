"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  AlertCircleIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Invoice01Icon,
} from "@hugeicons/core-free-icons";
import { useQuotationsList } from "./hooks";
import { formatDateShort } from "kadesh/utils/format-date";
import QuotationCreateModal from "./QuotationCreateModal";
import { Routes } from "kadesh/core/routes";
import { useRouter } from "next/navigation";
import {
  quotationTableWrapClass,
  quotationThClass,
  quotationTdClass,
} from "./quotation-table-classes";
import {
  QUOTATION_STATUS_COLORS,
  QUOTATION_STATUS_OPTIONS,
  type QuotationStatus,
} from "kadesh/constants/constans";
import { formatMoney } from "kadesh/utils/format-currency";
import type { SaasQuotationRow } from "./queries";
import {
  quotationFadeUp,
  quotationMotionTransition,
  quotationStagger,
} from "./motion";

export interface QuotationsListPanelProps {
  userId: string;
}

function statusMeta(status: string | null) {
  const color = status
    ? QUOTATION_STATUS_COLORS[status as QuotationStatus]
    : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200";
  const label =
    QUOTATION_STATUS_OPTIONS.find((opt) => opt.value === status)?.label ?? "—";
  return { color, label };
}

function StatusBadge({ status }: { status: string | null }) {
  const { color, label } = statusMeta(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}

const primaryCtaClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(231,124,58,0.55)] hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e]";

const pageBtnClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border border-[#e0e0e0] px-3 text-sm font-medium text-[#212121] transition-colors hover:bg-[#f5f5f5] disabled:pointer-events-none disabled:opacity-40 dark:border-[#3a3a3a] dark:text-white dark:hover:bg-[#333]";

function QuotationsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:hidden" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#e0e0e0] bg-white p-4 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="h-4 w-28 rounded bg-[#ececec] animate-pulse dark:bg-[#333]" />
              <div className="h-6 w-16 rounded-full bg-[#ececec] animate-pulse dark:bg-[#333]" />
            </div>
            <div className="mt-3 h-3 w-40 rounded bg-[#ececec] animate-pulse dark:bg-[#333]" />
            <div className="mt-4 h-3 w-24 rounded bg-[#ececec] animate-pulse dark:bg-[#333]" />
          </div>
        ))}
      </div>
      <div className={`${quotationTableWrapClass} hidden md:block`} aria-hidden>
        <div className="h-11 bg-orange-500/[0.06] dark:bg-orange-500/10" />
        <div className="divide-y divide-[#e8e8e8] dark:divide-[#333]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex h-14 items-center px-4">
              <div className="h-3 w-full max-w-md rounded bg-[#ececec] animate-pulse dark:bg-[#333]" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function QuotationCard({
  row,
  index,
  onOpen,
}: {
  row: SaasQuotationRow;
  index: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      className="clientes-row-in group w-full rounded-2xl border border-[#e0e0e0] bg-white p-4 text-left shadow-sm transition-[border-color,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:border-orange-500/35 hover:bg-orange-500/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#212121] dark:text-white">
            {row.quotationNumber}
          </p>
          <p className="mt-0.5 truncate text-sm text-[#616161] dark:text-[#b0b0b0]">
            {row.lead?.businessName ?? "Sin cliente"}
          </p>
        </div>
        <StatusBadge status={row.status} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
          {formatDateShort(row.createdAt, false)}
          {row.validUntil
            ? ` · vence ${formatDateShort(row.validUntil, false)}`
            : ""}
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-[#212121] dark:text-white">
          {formatMoney(row.total, row.currency ?? "MXN")}
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={16}
            className="text-orange-500 transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </button>
  );
}

export default function QuotationsListPanel({
  userId,
}: QuotationsListPanelProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [createOpen, setCreateOpen] = useState(false);
  const {
    companyId,
    isAdminCompany,
    page,
    setPage,
    rows,
    loading,
    error,
    refetch,
    hasNextPage,
    hasPrevPage,
  } = useQuotationsList({ userId });

  const handleCreated = async () => {
    setPage(1);
    await refetch();
  };

  const openRow = (id: string) => router.push(Routes.panelQuotation(id));
  const isEmpty = !loading && !error && rows.length === 0;
  const fadeUp = quotationFadeUp(reduce);

  const createButton = (
    <motion.button
      type="button"
      onClick={() => setCreateOpen(true)}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12, ease: [0.2, 0, 0, 1] }}
      className={primaryCtaClass}
    >
      <HugeiconsIcon icon={Add01Icon} size={18} />
      Nueva cotización
    </motion.button>
  );

  if (!companyId) {
    return (
      <div
        role="region"
        aria-label="Cotizaciones"
        className="rounded-2xl border border-[#e0e0e0] bg-white p-6 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-8"
      >
        <p className="text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
          No hay una empresa vinculada a tu cuenta. Asóciala en tu perfil para
          crear cotizaciones.
        </p>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Lista de cotizaciones" className="space-y-4">
      {!isEmpty && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
            {isAdminCompany
              ? "Todas las cotizaciones de la empresa."
              : "Cotizaciones donde eres el vendedor asignado."}
          </p>
          {createButton}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {loading && rows.length === 0 ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={quotationMotionTransition(reduce)}
            aria-busy="true"
            aria-live="polite"
          >
            <span className="sr-only">Cargando cotizaciones</span>
            <QuotationsSkeleton />
          </motion.div>
        ) : error && rows.length === 0 ? (
          <motion.div
            key="error"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            transition={quotationMotionTransition(reduce)}
            className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-800 dark:bg-red-900/20"
          >
            <HugeiconsIcon
              icon={AlertCircleIcon}
              size={28}
              className="text-red-600 dark:text-red-400"
            />
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              No se pudieron cargar las cotizaciones. Intenta de nuevo.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="min-h-11 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40"
            >
              Reintentar
            </button>
          </motion.div>
        ) : isEmpty ? (
          <motion.div
            key="empty"
            variants={quotationStagger(reduce, 0.06)}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="flex flex-col items-center px-6 py-12 text-center rounded-2xl border border-[#e0e0e0] bg-white dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:py-16"
          >
            <motion.span
              variants={fadeUp}
              transition={quotationMotionTransition(reduce)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400"
            >
              <HugeiconsIcon icon={Invoice01Icon} size={28} />
            </motion.span>
            <motion.h4
              variants={fadeUp}
              transition={quotationMotionTransition(reduce)}
              className="mt-4 text-lg font-semibold text-[#212121] dark:text-white"
            >
              Aún no hay cotizaciones
            </motion.h4>
            <motion.p
              variants={fadeUp}
              transition={quotationMotionTransition(reduce)}
              className="mt-1 max-w-sm text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]"
            >
              {isAdminCompany
                ? "Crea la primera para un cliente de la empresa. El folio, el total y el estado quedan en un solo lugar."
                : "Crea la primera para un cliente asignado a ti. El folio, el total y el estado quedan en un solo lugar."}
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={quotationMotionTransition(reduce)}
              className="mt-5"
            >
              {createButton}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key={`list-${page}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={quotationMotionTransition(reduce)}
            className="relative"
            aria-busy={loading}
          >
            {loading && (
              <div className="absolute inset-0 z-10 rounded-2xl bg-white/50 pointer-events-none dark:bg-black/30" />
            )}

            <div className="grid grid-cols-1 gap-3 md:hidden">
              {rows.map((row, index) => (
                <QuotationCard
                  key={row.id}
                  row={row}
                  index={index}
                  onOpen={() => openRow(row.id)}
                />
              ))}
            </div>

            <div className={`${quotationTableWrapClass} hidden md:block`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr>
                      <th className={quotationThClass}>Folio</th>
                      <th className={quotationThClass}>Cliente</th>
                      <th className={quotationThClass}>Fecha</th>
                      <th className={`${quotationThClass} text-right`}>
                        Total
                      </th>
                      <th className={quotationThClass}>Estado</th>
                      <th className={`${quotationThClass} w-16`}>
                        <span className="sr-only">Abrir</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={row.id}
                        role="link"
                        tabIndex={0}
                        onClick={() => openRow(row.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openRow(row.id);
                          }
                        }}
                        style={{
                          animationDelay: `${Math.min(index, 8) * 40}ms`,
                        }}
                        className="clientes-row-in group cursor-pointer border-b border-[#e8e8e8] transition-[background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] last:border-b-0 hover:bg-orange-500/[0.06] dark:border-[#333] dark:hover:bg-orange-500/10"
                      >
                        <td className={`${quotationTdClass} font-medium`}>
                          {row.quotationNumber}
                        </td>
                        <td className={quotationTdClass}>
                          {row.lead?.businessName ?? (
                            <span className="text-[#9e9e9e]">Sin cliente</span>
                          )}
                        </td>
                        <td
                          className={`${quotationTdClass} whitespace-nowrap text-xs text-[#616161] dark:text-[#b0b0b0]`}
                        >
                          {formatDateShort(row.createdAt, false)}
                        </td>
                        <td
                          className={`${quotationTdClass} text-right font-medium tabular-nums`}
                        >
                          {formatMoney(row.total, row.currency ?? "MXN")}
                        </td>
                        <td className={quotationTdClass}>
                          <StatusBadge status={row.status} />
                        </td>
                        <td className={`${quotationTdClass} text-right`}>
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-orange-500 transition-transform duration-150 group-hover:translate-x-0.5">
                            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && rows.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 pt-1 sm:flex-row">
          <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
            Página {page}
            {hasNextPage ? " · hay más resultados" : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPrevPage || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={pageBtnClass}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              Anterior
            </button>
            <button
              type="button"
              disabled={!hasNextPage || loading}
              onClick={() => setPage((p) => p + 1)}
              className={pageBtnClass}
            >
              Siguiente
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>
          </div>
        </div>
      )}

      <QuotationCreateModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreated}
        companyId={companyId}
        userId={userId}
      />
    </div>
  );
}
