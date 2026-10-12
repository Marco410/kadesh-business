"use client";

import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { formatDateShort } from "kadesh/utils/format-date";
import { cn } from "kadesh/utils/cn";
import { ANALYTICS_DAY_OPTIONS, parseAnalyticsDays } from "../constants";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminSectionCard,
  AdminStatTile,
  InfoTip,
  formatMoney,
  surfaceClass,
} from "../ui";
import { pipelineLabel } from "../clients/company/format";
import { ADMIN_SALES_VELOCITY_QUERY, type AdminSalesVelocityResponse } from "./analytics-queries";
import { HELP } from "./help";
import { formatDays, formatHours, formatMinutes, formatRate, formatShare } from "./velocity-format";
import ViewGuide from "./ViewGuide";

/** Etapas de cierre: de ahí ya no se avanza ni se pierde. */
const FINAL_STAGES = new Set([
  "11 - Propuesta Rechazada",
  "12 - Cerrado Ganado",
  "13 - Cerrado Perdido",
  "14 - Descartado",
]);

/** Encabezado de tabla con su ayuda. */
function Th({ label, help, className }: { label: string; help?: string; className?: string }) {
  return (
    <th className={cn("py-2 pr-3 font-medium", className)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {help ? <InfoTip label={label}>{help}</InfoTip> : null}
      </span>
    </th>
  );
}


/**
 * Analítica → Ventas: velocidad comercial de todas las empresas (historial de etapas, actividades
 * y WhatsApp). Cada número trae su ayuda (ⓘ) porque no todos en el equipo leen métricas.
 */
export default function SalesVelocityPanel() {
  const { searchParams, setParams, openCompany } = useAdminNavigation();
  const days = parseAnalyticsDays(searchParams.get("dias"));
  const { data, loading, error } = useQuery<AdminSalesVelocityResponse>(ADMIN_SALES_VELOCITY_QUERY, {
    variables: { input: { days: Number(days) } },
    fetchPolicy: "cache-and-network",
  });
  const v = data?.adminSalesVelocity;

  return (
    <div className="flex flex-col gap-4">
      <ViewGuide
        note={v?.dataSince ? `Datos desde el ${formatDateShort(v.dataSince, false)}.` : "Todavía no hay historial de etapas."}
      >
        {HELP.salesHowTo}
      </ViewGuide>
      <AdminFilterChips
        label="Periodo"
        options={[...ANALYTICS_DAY_OPTIONS]}
        value={days}
        onChange={(value) => setParams({ dias: value === "90" ? null : value })}
      />

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && !v ? (
        <AdminLoadingRows rows={6} />
      ) : !v || !v.dataSince ? (
        <AdminEmptyState
          title="Todavía no hay historial de etapas"
          description="Se guarda desde esta versión cada vez que un lead cambia de etapa. Para recuperar lo que ya estaba registrado, corre pnpm pipeline:backfill en el back."
        />
      ) : (
        <>
          <AdminSectionCard title="Cierre" description={`Tratos que se cerraron en los últimos ${v.days} días.`}>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <AdminStatTile
                label="Tasa de cierre"
                value={formatRate(v.winRate)}
                hint={`${v.won} ganados · ${v.lost} perdidos`}
                help={HELP.winRate}
              />
              <AdminStatTile
                label="Ciclo de venta"
                value={formatDays(v.medianCycleDays)}
                hint={v.cycleSample ? `${v.cycleSample} trato${v.cycleSample === 1 ? "" : "s"} medidos` : "Sin tratos medidos"}
                help={HELP.salesCycle}
              />
              <AdminStatTile label="Valor ganado" value={formatMoney(v.wonValue, "MXN")} help={HELP.wonValue} />
              <AdminStatTile
                label="Estancados"
                value={v.stalled}
                hint="Sin moverse en 14 días o más"
                tone={v.stalled ? "warning" : "default"}
                help={HELP.stalled}
              />
            </div>
          </AdminSectionCard>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
            <AdminSectionCard title="Primer contacto" description={`${v.newLeads} leads entraron al pipeline en el periodo.`}>
              <div className="grid grid-cols-2 gap-2">
                <AdminStatTile
                  label="Tiempo al primer contacto"
                  value={formatHours(v.medianFirstContactHours)}
                  hint={`${v.contacted} contactados`}
                  help={HELP.firstContact}
                />
                <AdminStatTile
                  label="Contactados en 48 h"
                  value={formatShare(v.contactedWithin2Days, v.newLeads)}
                  hint={`${v.contactedWithin2Days} de ${v.newLeads}`}
                  help={HELP.contacted2d}
                />
              </div>
            </AdminSectionCard>
            <AdminSectionCard title="WhatsApp" description={`${v.whatsappInbound} mensajes de leads en el periodo.`}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <AdminStatTile
                  label="Tiempo de respuesta"
                  value={formatMinutes(v.whatsappMedianResponseMinutes)}
                  hint={`${v.whatsappAnswered} contestados`}
                  help={HELP.waResponse}
                />
                <AdminStatTile
                  label="Contestados en 1 h"
                  value={formatShare(v.whatsappAnsweredWithin1h, v.whatsappInbound)}
                  hint={`${v.whatsappAnsweredWithin1h} de ${v.whatsappInbound}`}
                  help={HELP.waWithin1h}
                />
                <AdminStatTile
                  label="Los leads contestan"
                  value={formatShare(v.whatsappReplied, v.whatsappConversations)}
                  hint={`${v.whatsappReplied} de ${v.whatsappConversations} conversaciones`}
                  help={HELP.waReplyRate}
                />
              </div>
            </AdminSectionCard>
          </div>

          <AdminSectionCard title="Etapas del pipeline" help={HELP.salesStages}>
            {v.stages.length === 0 ? (
              <p className="text-sm text-[#9e9e9e]">Ningún lead cambió de etapa en el periodo.</p>
            ) : (
              <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                    <tr>
                      <Th label="Etapa" />
                      <Th label="Entraron" help={HELP.stageEntered} />
                      <Th label="Avanzaron" help={HELP.stageAdvanced} />
                      <Th label="Se perdieron" help={HELP.stageLost} />
                      <Th label="Días en la etapa" help={HELP.stageDays} />
                      <Th label="Estancados" help={HELP.stageStalled} className="pr-0" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                    {v.stages.map((row) => (
                      <tr key={row.stage}>
                        <td className="py-2 pr-3 text-[#212121] dark:text-white">{pipelineLabel(row.stage)}</td>
                        <td className="py-2 pr-3 tabular-nums text-[#212121] dark:text-white">{row.entered}</td>
                        <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                          {FINAL_STAGES.has(row.stage) ? (
                            "—"
                          ) : (
                            <>
                              <span className="text-[#212121] dark:text-white">{formatShare(row.advanced, row.entered)}</span>{" "}
                              <span className="text-xs">({row.advanced})</span>
                            </>
                          )}
                        </td>
                        <td className="py-2 pr-3 tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                          {FINAL_STAGES.has(row.stage) ? "—" : row.lost}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                          {formatDays(row.medianDays)}
                        </td>
                        <td
                          className={cn(
                            "py-2 tabular-nums",
                            row.stalled ? "font-semibold text-amber-700 dark:text-amber-300" : "text-[#9e9e9e]",
                          )}
                        >
                          {row.stalled}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminSectionCard>

          <AdminSectionCard title="Por empresa" help={HELP.salesCompanies}>
            {v.companies.length === 0 ? (
              <p className="text-sm text-[#9e9e9e]">Ninguna empresa movió leads en el periodo.</p>
            ) : (
              <>
                <ul className="flex flex-col gap-2 md:hidden">
                  {v.companies.map((company) => (
                    <li key={company.companyId}>
                      <button
                        type="button"
                        onClick={() => openCompany(company.companyId)}
                        className={cn(surfaceClass, "w-full p-3 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400")}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#212121] dark:text-white">{company.companyName}</span>
                          {company.stalled ? (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                              {company.stalled} estancados
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-xs text-[#616161] dark:text-[#b0b0b0]">
                          Cierre {formatRate(company.winRate)} · ciclo {formatDays(company.medianCycleDays)} · primer
                          contacto {formatHours(company.medianFirstContactHours)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="relative hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      <tr>
                        <Th label="Empresa" />
                        <Th label="Leads nuevos" help={HELP.stageEntered} />
                        <Th label="Ganados" />
                        <Th label="Tasa de cierre" help={HELP.winRate} />
                        <Th label="Ciclo de venta" help={HELP.salesCycle} />
                        <Th label="Primer contacto" help={HELP.firstContact} />
                        <Th label="Estancados" help={HELP.stalled} />
                        <th className="w-8">
                          <span className="sr-only">Abrir</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                      {v.companies.map((company) => (
                        <tr
                          key={company.companyId}
                          onClick={() => openCompany(company.companyId)}
                          className="cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/5"
                        >
                          <td className="py-2 pr-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompany(company.companyId);
                              }}
                              className="rounded text-left font-semibold text-[#212121] hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:text-white dark:hover:text-orange-400 cursor-pointer"
                            >
                              {company.companyName}
                            </button>
                          </td>
                          <td className="py-2 pr-3 tabular-nums">{company.entered}</td>
                          <td className="py-2 pr-3 tabular-nums">{company.won}</td>
                          <td className="py-2 pr-3 tabular-nums">{formatRate(company.winRate)}</td>
                          <td className="whitespace-nowrap py-2 pr-3 tabular-nums">{formatDays(company.medianCycleDays)}</td>
                          <td className="whitespace-nowrap py-2 pr-3 tabular-nums">{formatHours(company.medianFirstContactHours)}</td>
                          <td
                            className={cn(
                              "py-2 pr-3 tabular-nums",
                              company.stalled ? "font-semibold text-amber-700 dark:text-amber-300" : "text-[#9e9e9e]",
                            )}
                          >
                            {company.stalled}
                          </td>
                          <td className="py-2 text-[#9e9e9e]">
                            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </AdminSectionCard>
        </>
      )}
    </div>
  );
}
