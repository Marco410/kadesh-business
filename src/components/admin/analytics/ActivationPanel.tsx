"use client";

import { useQuery } from "@apollo/client";
import { cn } from "kadesh/utils/cn";
import { ANALYTICS_DAY_OPTIONS, parseAnalyticsDays } from "../constants";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminSectionCard,
} from "../ui";
import { monthLabel } from "../clients/company/format";
import { HELP } from "./help";
import ViewGuide from "./ViewGuide";
import {
  ADMIN_ACTIVATION_FUNNEL_QUERY,
  type AdminActivationFunnelResponse,
} from "./analytics-queries";

function formatDays(days: number | null) {
  if (days == null) return null;
  if (days < 1) return "el mismo día";
  const rounded = Math.round(days);
  return `${rounded} día${rounded === 1 ? "" : "s"} (mediana)`;
}

const pct = (part: number, total: number) => (total ? `${Math.round((part / total) * 100)}%` : "—");

/**
 * De las empresas que se registraron en el periodo, cuántas llegaron a cada paso. Cada paso se
 * cuenta por separado (hay quien paga sin cotizar), así que no siempre baja de uno a otro.
 */
export default function ActivationPanel() {
  const { searchParams, setParams } = useAdminNavigation();
  const days = parseAnalyticsDays(searchParams.get("dias"));
  const { data, loading, error } = useQuery<AdminActivationFunnelResponse>(
    ADMIN_ACTIVATION_FUNNEL_QUERY,
    { variables: { input: { days: Number(days) } }, fetchPolicy: "cache-and-network" },
  );
  const funnel = data?.adminActivationFunnel;

  return (
    <div className="flex flex-col gap-4">
      <ViewGuide>
        De las empresas que se registraron en el periodo, qué parte llegó a cada paso y cuánto
        tardó. Un paso con porcentaje bajo es donde se atoran: ahí conviene ayudarles (tutorial,
        llamada, correo). Las más recientes han tenido menos tiempo: compáralas por mes abajo.
      </ViewGuide>
      <AdminFilterChips
        label="Registradas en"
        options={[...ANALYTICS_DAY_OPTIONS]}
        value={days}
        onChange={(value) => setParams({ dias: value === "90" ? null : value })}
      />

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && !funnel ? (
        <AdminLoadingRows rows={6} />
      ) : !funnel || funnel.cohortSize === 0 ? (
        <AdminEmptyState
          title="No hay registros en este periodo"
          description="Elige un periodo más largo."
        />
      ) : (
        <>
          <AdminSectionCard
            title="Pasos de activación"
            help={HELP.activation}
            description={`${funnel.cohortSize} empresa${funnel.cohortSize === 1 ? "" : "s"} registrada${funnel.cohortSize === 1 ? "" : "s"}.`}
          >
            <ol className="flex flex-col gap-3">
              {funnel.steps.map((step) => (
                <li key={step.key}>
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <span className="text-sm font-medium text-[#212121] dark:text-white">{step.label}</span>
                    <span className="text-sm tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                      <strong className="text-[#212121] dark:text-white">{Math.round(step.pct)}%</strong> ·{" "}
                      {step.companies}
                      {step.key !== "signup" && formatDays(step.medianDays) ? ` · ${formatDays(step.medianDays)}` : ""}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#f0f0f0] dark:bg-[#2a2a2a]">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        step.key === "paid" ? "bg-emerald-500" : "bg-orange-500",
                      )}
                      style={{ width: `${Math.max(step.pct, step.companies > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-[#9e9e9e]">
              Primer contacto = registró una actividad, mandó un WhatsApp o movió un lead de etapa.
              Pagó = cobro exitoso (plan o recarga) o plan con costo activo.
            </p>
          </AdminSectionCard>

          <AdminSectionCard
            title="Por mes de registro"
            description="Cuántas de cada mes llegaron a cada paso."
            help={HELP.activationByMonth}
          >
            <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Mes</th>
                    <th className="py-2 pr-3 font-medium">Registradas</th>
                    <th className="py-2 pr-3 font-medium">Extracción</th>
                    <th className="py-2 pr-3 font-medium">Contacto</th>
                    <th className="py-2 pr-3 font-medium">Cotización</th>
                    <th className="py-2 font-medium">Pagó</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                  {funnel.byMonth.map((row) => {
                    const [year, month] = row.month.split("-").map(Number);
                    return (
                      <tr key={row.month}>
                        <td className="whitespace-nowrap py-2 pr-3 capitalize text-[#212121] dark:text-white">
                          {monthLabel(year, month)}
                        </td>
                        <td className="py-2 pr-3 tabular-nums text-[#212121] dark:text-white">{row.companies}</td>
                        {[row.extraction, row.contact, row.quotation, row.paid].map((value, index) => (
                          <td key={index} className="whitespace-nowrap py-2 pr-3 tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                            <span className="text-[#212121] dark:text-white">{pct(value, row.companies)}</span>{" "}
                            <span className="text-xs">({value})</span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </AdminSectionCard>
        </>
      )}
    </div>
  );
}
