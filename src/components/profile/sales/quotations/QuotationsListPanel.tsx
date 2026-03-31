"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Edit01Icon } from "@hugeicons/core-free-icons";
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

export interface QuotationsListPanelProps {
  userId: string;
}

export default function QuotationsListPanel({ userId }: QuotationsListPanelProps) {
  const router = useRouter();
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

  if (!companyId) {
    return (
      <div
        role="tabpanel"
        id="panel-cotizaciones"
        aria-labelledby="tab-cotizaciones"
        className="space-y-3"
      >
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          No se pudo obtener la empresa. Las cotizaciones se filtran por compañía.
        </p>
      </div>
    );
  }

  return (
    <div
      role="tabpanel"
      id="panel-cotizaciones"
      aria-labelledby="tab-cotizaciones"
      className="space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
          {isAdminCompany
            ? "Todas las cotizaciones de la empresa."
            : "Cotizaciones donde eres el vendedor asignado."}
        </p>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e]"
        >
          <HugeiconsIcon icon={Add01Icon} size={18} />
          Nueva cotización
        </button>
      </div>

      <div className={quotationTableWrapClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className={quotationThClass}>Folio</th>
                <th className={quotationThClass}>Cliente</th>
                <th className={quotationThClass}>Fecha</th>
                <th className={`${quotationThClass} text-right`}>Total</th>
                <th className={quotationThClass}>Estado</th>
                <th className={`${quotationThClass} w-28 text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`${quotationTdClass} text-center py-12 text-[#616161] dark:text-[#9e9e9e]`}
                  >
                    Cargando…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`${quotationTdClass} text-center py-10 text-red-600 dark:text-red-400`}
                  >
                    {error.message}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`${quotationTdClass} text-center py-14 text-[#616161] dark:text-[#9e9e9e]`}
                  >
                    No hay cotizaciones con estos criterios.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className={`${quotationTdClass} font-medium`}>
                      {row.quotationNumber}
                    </td>
                    <td className={quotationTdClass}>
                      {row.lead?.businessName ?? (
                        <span className="text-[#9e9e9e]">—</span>
                      )}
                    </td>
                    <td className={`${quotationTdClass} text-xs whitespace-nowrap`}>
                      {formatDateShort(row.createdAt, false)}
                    </td>
                    <td className={`${quotationTdClass} text-right tabular-nums`}>
                      {formatMoney(row.total, row.currency ?? "MXN")}
                    </td>
                    <td className={quotationTdClass}>
                      {(() => {
                        const status = row.status as QuotationStatus | null;
                        const color = status
                          ? QUOTATION_STATUS_COLORS[status]
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200";
                        const label =
                          QUOTATION_STATUS_OPTIONS.find(
                            (opt) => opt.value === row.status,
                          )?.label ?? "—";

                        return (
                          <span
                            className={`inline-flex items-center rounded-xl px-3 py-2 text-xs font-medium ${color}`}
                          >
                            {label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className={`${quotationTdClass} text-right`}>
                      <button
                        type="button"
                        onClick={() => router.push(Routes.panelQuotation(row.id))}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] px-2.5 py-1.5 text-xs font-medium text-[#212121] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#333] cursor-pointer"
                      >
                        <HugeiconsIcon icon={Edit01Icon} size={14} />
                        Ver / editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
            Página {page}
            {hasNextPage ? " · hay más resultados" : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPrevPage || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] text-sm text-[#212121] dark:text-white disabled:opacity-40 disabled:pointer-events-none hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={!hasNextPage || loading}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] text-sm text-[#212121] dark:text-white disabled:opacity-40 disabled:pointer-events-none hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
            >
              Siguiente
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
