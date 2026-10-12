"use client";

import { useQuery } from "@apollo/client";
import { cn } from "kadesh/utils/cn";
import { HEALTH_COMPONENTS } from "../constants";
import { AdminSectionCard } from "../ui";
import { ADMIN_HEALTH_QUERY, type AdminHealthResponse } from "./analytics-queries";
import { HealthBadge, HealthSignals, HealthTrend } from "./HealthBadge";

/** Salud de la empresa en el 360: puntaje, tendencia, señales y de dónde sale cada punto. */
export default function CompanyHealthCard({ companyId }: { companyId: string }) {
  const { data, error } = useQuery<AdminHealthResponse>(ADMIN_HEALTH_QUERY, {
    variables: { input: { companyId } },
    fetchPolicy: "cache-and-network",
  });
  const result = data?.adminHealth;
  const health = result?.items[0];

  // Sin resumen diario la salud saldría en ceros: mejor no mostrarla.
  if (error || !result?.ready || !health) return null;

  return (
    <AdminSectionCard
      title="Salud"
      description={`Últimas ${result.windowDays / 7} semanas. Riesgo de baja y oportunidad de venta salen de aquí.`}
      action={<HealthBadge score={health.score} label={health.label} showLabel />}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <HealthTrend trend={health.trend} changePct={health.changePct} />
          <span className="text-xs text-[#9e9e9e]">contra las 2 semanas anteriores</span>
        </div>
        {health.flags.length ? <HealthSignals flags={health.flags} /> : null}
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {HEALTH_COMPONENTS.map((part) => {
            const points = health.components[part.key];
            const ratio = points / part.max;
            return (
              <li key={part.key} className="min-w-0" title={part.hint}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-[#616161] dark:text-[#b0b0b0]">{part.label}</span>
                  <span className="tabular-nums text-[#212121] dark:text-white">
                    {points}/{part.max}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#f0f0f0] dark:bg-[#2a2a2a]">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      ratio >= 0.7 ? "bg-emerald-500" : ratio >= 0.4 ? "bg-amber-500" : "bg-red-500",
                    )}
                    style={{ width: `${Math.max(ratio * 100, points > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </AdminSectionCard>
  );
}
