"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { WeeklyBars } from "kadesh/components/panel/dashboard";
import { cn } from "kadesh/utils/cn";
import { AdminSectionCard, formatCredits } from "../../../ui";
import { formatMinutes } from "../format";
import {
  ADMIN_COMPANY_TRENDS_QUERY,
  type AdminBenchmarkMetric,
  type AdminCompanyTrendsResponse,
} from "../../ops-queries";

const WEEKS = 12;

const METRIC_LABELS: Record<string, string> = {
  activeMinutes: "Tiempo con el panel abierto",
  extractions: "Extracciones",
  crmChanges: "Cambios en el CRM",
  activitiesLogged: "Actividades registradas",
  quotationsCreated: "Cotizaciones creadas",
};

function value(key: string, amount: number) {
  return key === "activeMinutes" ? formatMinutes(amount) : formatCredits(amount);
}

/** Arriba / abajo de la mediana de su plan, con un margen para no marcar diferencias chicas. */
function comparison(metric: AdminBenchmarkMetric): { label: string; tone: string } | null {
  if (metric.median == null) return null;
  if (metric.median === 0 && metric.company === 0) {
    return { label: "Igual", tone: "bg-black/5 text-[#616161] dark:bg-white/10 dark:text-[#b0b0b0]" };
  }
  const ratio = metric.median === 0 ? Infinity : metric.company / metric.median;
  if (ratio >= 1.2) {
    return { label: "Arriba", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" };
  }
  if (ratio <= 0.8) {
    return { label: "Abajo", tone: "bg-amber-500/15 text-amber-800 dark:text-amber-300" };
  }
  return { label: "En la media", tone: "bg-black/5 text-[#616161] dark:bg-white/10 dark:text-[#b0b0b0]" };
}

/**
 * Tendencia de 12 semanas (resumen diario) y comparación de las últimas 4 semanas contra la
 * mediana de las empresas con el mismo plan.
 */
export default function TrendsCard({ companyId }: { companyId: string }) {
  const { data, error } = useQuery<AdminCompanyTrendsResponse>(ADMIN_COMPANY_TRENDS_QUERY, {
    variables: { companyId, weeks: WEEKS },
    fetchPolicy: "cache-and-network",
  });
  const trends = data?.adminCompanyTrends ?? null;

  const bars = useMemo(
    () =>
      (trends?.weeks ?? []).map((week) => ({
        weekStart: week.weekStart,
        label: new Date(`${week.weekStart}T12:00:00`).toLocaleDateString("es-MX", {
          day: "numeric",
          month: "short",
        }),
        count: week.activeMinutes,
      })),
    [trends?.weeks],
  );

  if (error || !trends) return null;

  if (!trends.ready) {
    return (
      <AdminSectionCard title="Tendencia" description="Últimas 12 semanas y comparación con su plan.">
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          Todavía no hay resumen diario de uso. Se arma cada noche; para llenar semanas pasadas se
          corre <code className="rounded bg-black/5 px-1 dark:bg-white/10">pnpm usage:rollup</code> en
          el back.
        </p>
      </AdminSectionCard>
    );
  }

  return (
    <AdminSectionCard
      title="Tendencia"
      description="Minutos con el panel abierto por semana (últimas 12)."
    >
      <WeeklyBars bars={bars} ariaLabel="Minutos con el panel abierto por semana" unitLabel="minutos" />

      <div className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#9e9e9e]">
          Últimas 4 semanas contra su plan
        </h4>
        <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
          {trends.planName
            ? trends.peers >= 3
              ? `Mediana de ${trends.peers} empresas con el plan ${trends.planName}.`
              : `Hay ${trends.peers} empresa${trends.peers === 1 ? "" : "s"} más con el plan ${trends.planName}: muy pocas para comparar.`
            : "Sin plan para comparar."}
        </p>
        <div className="relative mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="text-xs text-[#616161] dark:text-[#b0b0b0]">
              <tr>
                <th className="py-2 pr-3 font-medium">Métrica</th>
                <th className="py-2 pr-3 font-medium">Esta empresa</th>
                <th className="py-2 pr-3 font-medium">Mediana del plan</th>
                <th className="py-2 font-medium">
                  <span className="sr-only">Comparación</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
              {trends.benchmark.map((metric) => {
                const verdict = comparison(metric);
                return (
                  <tr key={metric.key}>
                    <td className="py-2 pr-3 text-[#212121] dark:text-white">
                      {METRIC_LABELS[metric.key] ?? metric.key}
                    </td>
                    <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-[#212121] dark:text-white">
                      {value(metric.key, metric.company)}
                    </td>
                    <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                      {metric.median == null ? "—" : value(metric.key, metric.median)}
                    </td>
                    <td className="py-2">
                      {verdict ? (
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", verdict.tone)}>
                          {verdict.label}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminSectionCard>
  );
}
