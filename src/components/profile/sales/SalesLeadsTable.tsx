"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { TechBusinessLeadsResponse } from "kadesh/components/profile/sales/queries";
import {
  PIPELINE_STATUS_COLORS,
  GOOGLE_PLACE_CATEGORIES,
} from "kadesh/components/profile/sales/constants";
import { Routes } from "kadesh/core/routes";
import { getCategoryLabel } from "./helpers/category";
import { ApolloError } from "@apollo/client";



const DEFAULT_PIPELINE_COLOR =
  "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";

type LeadItem = TechBusinessLeadsResponse["techBusinessLeads"][number];

interface SalesLeadsTableProps {
  leads: LeadItem[];
  loading: boolean;
  error: ApolloError | undefined;
  /** Modo asignar: mostrar columnas de selección. */
  assignMode?: boolean;
  selectedLeadIds?: Set<string>;
  onToggleLead?: (leadId: string) => void;
  onToggleAll?: (leadIds: string[]) => void;
  /** Paginación: total de leads, tamaño de página, página actual y callback. */
  totalCount?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function SalesLeadsTable({
  leads,
  loading,
  error,
  assignMode = false,
  selectedLeadIds = new Set(),
  onToggleLead,
  onToggleAll,
  totalCount = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
}: SalesLeadsTableProps) {
  const router = useRouter();
  const leadIds = leads.map((l) => l.id);
  const allSelected =
    leadIds.length > 0 && leadIds.every((id) => selectedLeadIds.has(id));
  const someSelected = leadIds.some((id) => selectedLeadIds.has(id));
  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const effectivePage = totalCount > 0 ? Math.min(currentPage, totalPages) : currentPage;
  const from = totalCount === 0 ? 0 : (effectivePage - 1) * pageSize + 1;
  const to = Math.min(effectivePage * pageSize, totalCount);
  const showPagination = totalCount > pageSize && onPageChange != null;

  if (leads.length === 0) {
    return (
      <div className="w-full space-y-6 h-[500px]">
        <div className="p-8 rounded-xl bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e0e0e0] dark:border-[#3a3a3a] text-center text-[#616161] dark:text-[#b0b0b0]">
          No hay leads.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-16 h-[500px]">
        <span className="animate-spin size-10 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
        No se pudieron cargar los leads. Intenta de nuevo más tarde.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e]">
      <table className="w-full min-w-[900px] text-sm border-collapse">
        <thead>
          <tr className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a]">
            {assignMode && (
              <th className="w-10 px-2 py-3 text-left">
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  checked={allSelected}
                  onChange={() => onToggleAll?.(leadIds)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-[#e0e0e0] dark:border-[#3a3a3a] text-orange-500 focus:ring-orange-500"
                  aria-label="Seleccionar todos"
                />
              </th>
            )}
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Empresa
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Categoría
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Pipeline
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Teléfono
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Ciudad
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Estado
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              País
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Oportunidad
            </th>
            <th className="text-center px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Rating
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Fuente
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Asignado a
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const statuses = Array.isArray(lead.status)
              ? lead.status
              : lead.status
                ? [lead.status]
                : [];
            const leadStatus = statuses[0] ?? null;
            return (
            <tr
              key={lead.id}
              role={assignMode ? undefined : "button"}
              tabIndex={assignMode ? undefined : 0}
              onClick={() => !assignMode && router.push(Routes.profileLead(lead.id))}
              onKeyDown={(e) => {
                if (!assignMode && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  router.push(Routes.profileLead(lead.id));
                }
              }}
              className={`border-b border-[#e0e0e0] dark:border-[#3a3a3a] transition-colors ${
                assignMode ? "" : "hover:bg-[#fafafa] dark:hover:bg-[#252525] cursor-pointer"
              } ${selectedLeadIds.has(lead.id) ? "bg-orange-50/50 dark:bg-orange-900/10" : ""}`}
            >
              {assignMode && (
                <td className="w-10 px-2 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.has(lead.id)}
                    onChange={() => onToggleLead?.(lead.id)}
                    className="rounded border-[#e0e0e0] dark:border-[#3a3a3a] text-orange-500 focus:ring-orange-500"
                    aria-label={`Seleccionar ${lead.businessName}`}
                  />
                </td>
              )}
              <td className="px-4 py-3 text-[#212121] dark:text-[#ffffff] font-medium">
                {lead.businessName || "—"}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {getCategoryLabel(lead.category)}
              </td>
              <td className="px-4 py-3">
                {leadStatus?.pipelineStatus ? (
                 <div className="flex flex-col items-center">
                    <span
                      className={`inline-flex px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                        PIPELINE_STATUS_COLORS[leadStatus.pipelineStatus] ??
                        DEFAULT_PIPELINE_COLOR
                      }`}
                    >
                      {leadStatus.pipelineStatus}
                    </span>
                    <span className="text-[9px] text-[#616161] dark:text-[#b0b0b0]">
                      Aplicado por: {leadStatus.salesPerson?.name ?? "—"}
                  </span>
                  </div>
                ) : (
                  <span className="text-[#616161] dark:text-[#b0b0b0]">—</span>
                )}
              </td>
              <td
                className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0] whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone.replace(/\s/g, "")}`}
                    className="text-orange-500 dark:text-orange-400 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {lead.city ?? "—"}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {lead.state ?? "—"}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {lead.country ?? "—"}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {leadStatus?.opportunityLevel ?? "—"}
              </td>
              <td className="px-4 py-3 text-center text-[#212121] dark:text-[#ffffff]">
                {lead.rating != null ? lead.rating : "—"}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {lead.source ?? "—"}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {lead.salesPerson?.[0]?.name ?? "—"} {lead.salesPerson?.[0]?.lastName ?? "—"}
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
      </div>
      {showPagination && (
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525]">
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
            Mostrando {from}–{to} de {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, effectivePage - 1))}
              disabled={effectivePage <= 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-[#ffffff] hover:bg-[#f5f5f5] dark:hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-[#2a2a2a]"
            >
              Anterior
            </button>
            <span className="text-sm text-[#616161] dark:text-[#b0b0b0] px-2">
              Página {effectivePage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, effectivePage + 1))}
              disabled={effectivePage >= totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-[#ffffff] hover:bg-[#f5f5f5] dark:hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-[#2a2a2a]"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
