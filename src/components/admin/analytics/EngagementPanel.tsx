"use client";

import { useQuery } from "@apollo/client";
import { ShareBars } from "kadesh/components/panel/dashboard";
import { formatDateShort } from "kadesh/utils/format-date";
import { cn } from "kadesh/utils/cn";
import { PANEL_SECTION_LABELS, PRODUCT_MODULE_LABELS } from "../constants";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminSectionCard,
  AdminStatTile,
  formatCredits,
} from "../ui";
import { ADMIN_ENGAGEMENT_QUERY, type AdminEngagementResponse } from "./analytics-queries";
import { HELP } from "./help";
import ViewGuide from "./ViewGuide";

const DAY_OPTIONS = [
  { value: "30", label: "30 días" },
  { value: "60", label: "60 días" },
  { value: "90", label: "90 días" },
] as const;

const dayLabel = (day: string) => formatDateShort(`${day}T12:00:00`, false);

/** Barras por día sin etiqueta en cada una (con 30–90 días no caben): fechas de los extremos abajo. */
function DailyBars({ series }: { series: Array<{ day: string; users: number }> }) {
  const max = Math.max(1, ...series.map((point) => point.users));
  if (series.length === 0) return null;
  return (
    <div>
      <div className="flex h-32 items-end gap-px sm:gap-0.5" role="img" aria-label="Personas activas por día">
        {series.map((point) => (
          <div
            key={point.day}
            title={`${dayLabel(point.day)}: ${point.users} persona${point.users === 1 ? "" : "s"}`}
            className={cn(
              "flex-1 rounded-t-sm",
              point.users > 0 ? "bg-orange-500/85 dark:bg-orange-400/80" : "bg-[#e8e8e8] dark:bg-[#2a2a2a]",
            )}
            style={{ height: `${Math.max((point.users / max) * 100, point.users > 0 ? 6 : 2)}%` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-[#9e9e9e]">
        <span>{dayLabel(series[0].day)}</span>
        <span>{dayLabel(series[series.length - 1].day)}</span>
      </div>
    </div>
  );
}

function adoptionClass(ratio: number) {
  if (ratio >= 0.6) return "text-emerald-700 dark:text-emerald-400";
  if (ratio >= 0.3) return "text-[#212121] dark:text-white";
  return "text-[#9e9e9e]";
}

export default function EngagementPanel() {
  const { searchParams, setParams } = useAdminNavigation();
  const days = DAY_OPTIONS.find((option) => option.value === searchParams.get("dias"))?.value ?? "30";
  const { data, loading, error } = useQuery<AdminEngagementResponse>(ADMIN_ENGAGEMENT_QUERY, {
    variables: { input: { days: Number(days) } },
    fetchPolicy: "cache-and-network",
  });
  const engagement = data?.adminEngagement;

  if (error) return <AdminErrorState message={error.message} />;
  if (loading && !engagement) return <AdminLoadingRows rows={6} />;
  if (!engagement || !engagement.ready) {
    return (
      <AdminEmptyState
        title="Todavía no hay datos de uso"
        description="Se llenan con el tiempo que la gente tiene el panel abierto y con el resumen diario (pnpm usage:rollup en el back)."
      />
    );
  }

  const moduleKeys = engagement.plans[0]?.modules.map((module) => module.key) ?? [];
  const sections = engagement.sections.slice(0, 10).map((section) => ({
    key: section.key,
    label: `${PANEL_SECTION_LABELS[section.key] ?? section.key} · ${section.users} persona${section.users === 1 ? "" : "s"}`,
    count: section.views,
  }));

  return (
    <div className="flex flex-col gap-4">
      <ViewGuide note={`Datos hasta el ${dayLabel(engagement.through)}; hoy no cuenta porque va a medias.`}>
        Cuánta gente usa Kadesh y qué usa. Cuenta personas con el panel abierto, sin cuentas de prueba
        ni el equipo de Kadesh. Abajo, qué módulos aprovecha cada plan y qué secciones se abren más.
      </ViewGuide>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <AdminStatTile label="Activas al día" value={engagement.dau.toLocaleString("es-MX")} hint="Promedio de 30 días" help={HELP.dau} />
        <AdminStatTile label="En la semana" value={formatCredits(engagement.wau)} hint="Últimos 7 días" help={HELP.wau} />
        <AdminStatTile label="En el mes" value={formatCredits(engagement.mau)} hint="Últimos 30 días" help={HELP.mau} />
        <AdminStatTile
          label="Qué tanto vuelven"
          help={HELP.stickiness}
          value={`${Math.round(engagement.stickiness * 100)}%`}
          hint="Activas al día ÷ en el mes"
        />
        <AdminStatTile label="Empresas (7 días)" value={formatCredits(engagement.activeCompanies7d)} help={HELP.activeCompanies7d} />
        <AdminStatTile label="Empresas (30 días)" value={formatCredits(engagement.activeCompanies30d)} help={HELP.activeCompanies30d} />
      </div>

      <AdminSectionCard
        title="Personas activas por día"
        help={HELP.dailyActive}
        action={
          <AdminFilterChips
            options={[...DAY_OPTIONS]}
            value={days}
            onChange={(value) => setParams({ dias: value === "30" ? null : value })}
          />
        }
      >
        <DailyBars series={engagement.series} />
      </AdminSectionCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
        <AdminSectionCard
          title="Módulos que usa cada plan"
          help={HELP.modules}
          description="Empresas activas o en prueba que usaron cada módulo en los últimos 30 días."
        >
          {engagement.plans.length === 0 ? (
            <p className="text-sm text-[#9e9e9e]">No hay empresas activas o en prueba.</p>
          ) : (
            <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Plan</th>
                    {moduleKeys.map((key) => (
                      <th key={key} className="py-2 pr-3 font-medium">
                        {PRODUCT_MODULE_LABELS[key] ?? key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                  {engagement.plans.map((plan) => (
                    <tr key={plan.planName}>
                      <td className="whitespace-nowrap py-2 pr-3 text-[#212121] dark:text-white">
                        {plan.planName}
                        <span className="ml-1 text-xs text-[#9e9e9e]">({plan.companies})</span>
                      </td>
                      {plan.modules.map((module) => {
                        const ratio = plan.companies ? module.companies / plan.companies : 0;
                        return (
                          <td
                            key={module.key}
                            title={`${module.companies} de ${plan.companies}`}
                            className={cn("py-2 pr-3 tabular-nums font-medium", adoptionClass(ratio))}
                          >
                            {Math.round(ratio * 100)}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          title="Secciones más abiertas"
          description="Veces que se abrió cada sección en los últimos 30 días."
          help={HELP.sections}
        >
          <ShareBars items={sections} emptyLabel="Todavía no hay visitas registradas." />
        </AdminSectionCard>
      </div>
    </div>
  );
}
