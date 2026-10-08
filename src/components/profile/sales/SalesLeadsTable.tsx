"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TechBusinessLeadsResponse } from "kadesh/components/profile/sales/queries";
import { PIPELINE_STATUS_COLORS } from "kadesh/constants/constans";
import { Routes } from "kadesh/core/routes";
import { getCategoryLabel } from "./helpers/category";
import { pickCanonicalLeadStatus } from "./helpers/canonical-lead-status";
import { ApolloError } from "@apollo/client";
import { CopyPhoneButton } from "./CopyPhoneButton";
import LeadsPageNav from "./LeadsPageNav";
import type { LeadsPageSize } from "./leadsPagination";

const DEFAULT_PIPELINE_COLOR =
  "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";

const thClass =
  "text-left text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] px-4 py-3 whitespace-nowrap";

type LeadItem = TechBusinessLeadsResponse["techBusinessLeads"][number];

interface SalesLeadsTableProps {
  leads: LeadItem[];
  loading: boolean;
  error: ApolloError | undefined;
  /** Mostrar columna de selección para asignación masiva. */
  selectable?: boolean;
  selectedLeadIds?: Set<string>;
  onToggleLead?: (leadId: string) => void;
  onToggleAll?: (leadIds: string[]) => void;
  totalCount?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: LeadsPageSize) => void;
  isAdminCompany?: boolean;
}

export default function SalesLeadsTable({
  leads,
  loading,
  error,
  selectable = false,
  selectedLeadIds = new Set(),
  onToggleLead,
  onToggleAll,
  totalCount = 0,
  pageSize = 25,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  isAdminCompany = false,
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

  if (error && leads.length === 0) {
    return (
      <div className="w-full p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
        No se pudieron cargar los clientes. Intenta de nuevo más tarde.
      </div>
    );
  }

  if (loading && leads.length === 0) {
    return (
      <div className="w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden">
        <div className="h-11 bg-[#f5f5f5] dark:bg-[#2a2a2a]" />
        <div className="divide-y divide-[#e8e8e8] dark:divide-[#333]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 px-4 flex items-center">
              <div className="h-3 w-full max-w-md rounded bg-[#ececec] dark:bg-[#333] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-10 rounded-xl border bg-white dark:bg-[#18181b] border-gray-200 dark:border-gray-800 w-full">
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          No hay clientes en esta vista
        </div>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Prueba a cambiar los filtros o el estado del pipeline.
        </div>
        <Link
          href={Routes.panel}
          className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          Ir a Extracción B2B
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div
        className="relative overflow-x-auto rounded-xl border border-orange-200/50 dark:border-orange-900/30 bg-white dark:bg-[#1e1e1e] shadow-sm"
        aria-busy={loading}
      >
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/30 pointer-events-none" />
        )}
        <table className="w-full min-w-[900px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-orange-200/40 dark:border-orange-900/30 bg-orange-500/[0.06] dark:bg-orange-500/10">
              {selectable && (
                <th className="w-10 px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    ref={selectAllRef}
                    checked={allSelected}
                    onChange={() => onToggleAll?.(leadIds)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-[#e0e0e0] dark:border-[#3a3a3a] text-orange-500 focus:ring-orange-500"
                    aria-label="Seleccionar todos los de esta página"
                  />
                </th>
              )}
              <th className={thClass}>Empresa</th>
              <th className={thClass}>Categoría</th>
              <th className={thClass}>Pipeline</th>
              <th className={thClass}>Teléfono</th>
              <th className={thClass}>Ciudad</th>
              <th className={thClass}>Estado</th>
              <th className={thClass}>País</th>
              <th className={thClass}>Oportunidad</th>
              <th className={`${thClass} text-center`}>Rating</th>
              <th className={thClass}>Fuente</th>
              <th className={thClass}>Asignado a</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => {
              const leadStatus = pickCanonicalLeadStatus(
                lead.status,
                lead.salesPerson,
              );
              return (
                <tr
                  key={lead.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(Routes.panelLead(lead.id))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(Routes.panelLead(lead.id));
                    }
                  }}
                  className={`clientes-row-in border-b border-[#e8e8e8] dark:border-[#333] cursor-pointer transition-[background-color,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-orange-500/[0.06] dark:hover:bg-orange-500/10 ${
                    selectedLeadIds.has(lead.id)
                      ? "bg-orange-500/10 dark:bg-orange-500/15 shadow-[inset_3px_0_0_0_#f7945e]"
                      : ""
                  }`}
                  style={{ animationDelay: `${Math.min(index, 10) * 20}ms` }}
                >
                  {selectable && (
                    <td
                      className="w-10 px-3 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.has(lead.id)}
                        onChange={() => onToggleLead?.(lead.id)}
                        className="rounded border-[#e0e0e0] dark:border-[#3a3a3a] text-orange-500 focus:ring-orange-500"
                        aria-label={`Seleccionar ${lead.businessName}`}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-[#212121] dark:text-white font-medium">
                    {lead.businessName || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                    {getCategoryLabel(lead.category)}
                  </td>
                  <td className="px-4 py-3">
                    {leadStatus?.pipelineStatus ? (
                      <div className="flex flex-col items-start gap-0.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${
                            PIPELINE_STATUS_COLORS[leadStatus.pipelineStatus] ??
                            DEFAULT_PIPELINE_COLOR
                          }`}
                        >
                          {leadStatus.pipelineStatus.replace(/^\d+\s*-\s*/, "")}
                        </span>
                        {(() => {
                          const byName =
                            leadStatus.salesPerson?.name ??
                            lead.salesPerson?.[0]?.name;
                          return byName ? (
                            <span className="text-[11px] text-[#9e9e9e] dark:text-[#777]">
                              {byName}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    ) : (
                      <span className="text-[#616161] dark:text-[#b0b0b0]">
                        —
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0] whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    {lead.phone ? (
                      <span className="inline-flex items-center gap-1">
                        <a
                          href={`tel:${lead.phone.replace(/\s/g, "")}`}
                          className="text-orange-500 dark:text-orange-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
                        >
                          {lead.phone}
                        </a>
                        <CopyPhoneButton phone={lead.phone} />
                      </span>
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
                  <td className="px-4 py-3 text-center text-[#212121] dark:text-white tabular-nums">
                    {lead.rating != null ? lead.rating : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                    {lead.source ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                    {(() => {
                      const persons = lead.salesPerson ?? [];
                      const count = persons.length;
                      if (isAdminCompany && count > 1) {
                        const names = persons
                          .map((sp) => {
                            const full = [sp?.name, sp?.lastName]
                              .filter(Boolean)
                              .join(" ")
                              .trim();
                            return full || "Sin nombre";
                          })
                          .join(", ");
                        const tooltipText =
                          names || `${count} vendedores asignados`;
                        return (
                          <span className="group relative inline-flex">
                            <span
                              aria-describedby={
                                lead.id ? `tooltip-${lead.id}-sp` : undefined
                              }
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/15 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 dark:border-orange-400/30 cursor-help"
                              tabIndex={0}
                            >
                              {count} asignado{count !== 1 ? "s" : ""}
                            </span>
                            <span
                              id={lead.id ? `tooltip-${lead.id}-sp` : undefined}
                              role="tooltip"
                              className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs font-normal text-white bg-[#212121] dark:bg-[#333] rounded-lg shadow-lg max-w-[200px] whitespace-normal text-center opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity z-50"
                            >
                              {tooltipText}
                            </span>
                          </span>
                        );
                      }
                      if (isAdminCompany && count === 1) {
                        const sp = persons[0];
                        return (
                          [sp?.name, sp?.lastName]
                            .filter(Boolean)
                            .join(" ")
                            .trim() || "—"
                        );
                      }
                      if (isAdminCompany && count === 0) return "—";
                      return (
                        `${lead.salesPerson?.[0]?.name ?? ""} ${lead.salesPerson?.[0]?.lastName ?? ""}`.trim() ||
                        "—"
                      );
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <LeadsPageNav
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        loading={loading}
      />
    </div>
  );
}
