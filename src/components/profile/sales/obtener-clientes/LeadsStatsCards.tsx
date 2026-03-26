"use client";

import { useMemo, useImperativeHandle, forwardRef } from "react";
import { useQuery, gql } from "@apollo/client";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { GOOGLE_PLACE_CATEGORIES } from "kadesh/constants/constans";
import { useUser } from "kadesh/utils/UserContext";
import { getCategoryLabel } from "../helpers/category";

export interface LeadsStatsCardsHandle {
  refetch: () => void;
}

const LEADS_CATEGORIES_QUERY = gql`
  query LeadsCategories($where: TechBusinessLeadWhereInput!) {
    techBusinessLeads(where: $where) {
      id
      category
    }
  }
`;

interface LeadCategory {
  id: string;
  category: string | null;
}

interface LeadsCategoriesResponse {
  techBusinessLeads: LeadCategory[];
}

interface LeadsCategoriesVariables {
  where: {
    saasCompany?: { some: { id: { equals: string } } };
    salesPerson?: { some: { id: { equals: string } } };
  };
}

const LeadsStatsCards = forwardRef<LeadsStatsCardsHandle>(function LeadsStatsCards(_props, ref) {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  const { data, loading, refetch } = useQuery<
    LeadsCategoriesResponse,
    LeadsCategoriesVariables
  >(LEADS_CATEGORIES_QUERY, {
    variables: {
      where: companyId
        ? { saasCompany: { some: { id: { equals: companyId } } } }
        : {},
    },
    skip: !companyId,
  });

  useImperativeHandle(ref, () => ({ refetch }), [refetch]);

  const leads = data?.techBusinessLeads ?? [];

  const { total, categoryBreakdown } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const lead of leads) {
      const cat = lead.category ?? "sin_categoria";
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    const sorted = Object.entries(counts)
      .map(([cat, count]) => ({ category: cat, count }))
      .sort((a, b) => b.count - a.count);
    return { total: leads.length, categoryBreakdown: sorted };
  }, [leads]);

  const categoryColors = useMemo(() => {
    const palette = [
      "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
      "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
      "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
      "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    ];
    const map: Record<string, string> = {};
    categoryBreakdown.forEach((item, i) => {
      map[item.category] = palette[i % palette.length];
    });
    return map;
  }, [categoryBreakdown]);

  if (loading || !companyId) return null;
  if (total === 0) return null;

  const allowedCategories = new Set<string>(GOOGLE_PLACE_CATEGORIES.map((c) => c.value));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-gradient-to-br from-orange-500/5 to-transparent dark:from-orange-500/10 p-5 shadow-sm">
        <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
          Total de clientes obtenidos
        </p>
        <p className="text-3xl font-bold text-[#212121] dark:text-white mt-1">
          {total.toLocaleString("es-MX")}
        </p>
        <p className="text-xs text-[#9e9e9e] dark:text-[#666] mt-1">
          {categoryBreakdown.length} {categoryBreakdown.length === 1 ? "categoría" : "categorías"}
        </p>
      </div>

      {categoryBreakdown.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[#212121] dark:text-white mb-3">
            Clientes por categoría
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryBreakdown.map((item) => {
              const colorClass =
                categoryColors[item.category] ??
                "bg-[#f0f0f0] text-[#616161] dark:bg-[#333] dark:text-[#b0b0b0]";
              const label =
                item.category === "sin_categoria"
                  ? "Sin categoría"
                  : allowedCategories.has(item.category)
                    ? getCategoryLabel(item.category)
                    : item.category;
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(0) : "0";
              return (
                <div
                  key={item.category}
                  className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${colorClass}`}
                    >
                      {pct}%
                    </span>
                    <span className="text-lg font-bold text-[#212121] dark:text-white">
                      {item.count}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0] truncate" title={label}>
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

export default LeadsStatsCards;
