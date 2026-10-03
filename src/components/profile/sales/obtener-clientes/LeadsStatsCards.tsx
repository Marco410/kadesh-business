"use client";

import { useMemo, useImperativeHandle, forwardRef } from "react";
import { getCategoryLabel } from "../helpers/category";
import { SupportContactSection } from "kadesh/components/shared";
import { useCompanyLeadLocations } from "./hooks/useCompanyLeadLocations";
import {
  UNCATEGORIZED_LEAD_CATEGORY,
  buildLeadCategoryStats,
} from "./leadCategoryColors";

export interface LeadsStatsCardsHandle {
  refetch: () => void;
}

const LeadsStatsCards = forwardRef<LeadsStatsCardsHandle>(
  function LeadsStatsCards(_props, ref) {
    const { leads, loading, companyId, refetch } = useCompanyLeadLocations();

    useImperativeHandle(ref, () => ({ refetch }), [refetch]);

    const { total, categories } = useMemo(
      () => buildLeadCategoryStats(leads),
      [leads],
    );

    if (loading || !companyId) return null;
    if (total === 0) return null;

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-[#e0e0e0] bg-gradient-to-br from-orange-500/5 to-transparent p-5 shadow-sm dark:border-[#3a3a3a] dark:from-orange-500/10">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Total de clientes obtenidos
          </p>
          <p className="mt-1 text-3xl font-bold text-[#212121] dark:text-white">
            {total.toLocaleString("es-MX")}
          </p>
          <p className="mt-1 text-xs text-[#9e9e9e] dark:text-[#666]">
            {categories.length}{" "}
            {categories.length === 1 ? "categoría" : "categorías"}
          </p>
        </div>

        {categories.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#212121] dark:text-white">
              Clientes por categoría
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((item) => {
                const label =
                  item.category === UNCATEGORIZED_LEAD_CATEGORY
                    ? "Sin categoría"
                    : getCategoryLabel(item.category);
                const pct =
                  total > 0 ? ((item.count / total) * 100).toFixed(0) : "0";
                return (
                  <div
                    key={item.category}
                    className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ${item.badge}`}
                      >
                        {pct}%
                      </span>
                      <span className="text-lg font-bold text-[#212121] dark:text-white">
                        {item.count}
                      </span>
                    </div>
                    <p
                      className="flex items-center gap-1.5 text-xs font-medium text-[#616161] dark:text-[#b0b0b0]"
                      title={label}
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.hex }}
                        aria-hidden
                      />
                      <span className="min-w-0 break-words">{label}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <SupportContactSection
          whatsappMessage="Hola KADESH, tengo una consulta sobre mis clientes obtenidos."
          emailSubject="Consulta sobre clientes obtenidos — KADESH"
        />
      </div>
    );
  },
);

export default LeadsStatsCards;
