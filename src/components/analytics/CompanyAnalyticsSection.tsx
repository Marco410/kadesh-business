"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { InfoTip } from "kadesh/components/shared";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  formatDays,
  formatHours,
  formatMinutes,
  formatRate,
  formatShare,
} from "kadesh/utils/sales-velocity-format";
import { ANALYTICS_HELP as HELP } from "./help";
import {
  COMPANY_ANALYTICS_QUERY,
  type CompanyAnalyticsResponse,
} from "./queries";

const PERIODS = [
  { days: 30, label: "30 días" },
  { days: 90, label: "90 días" },
  { days: 180, label: "6 meses" },
  { days: 365, label: "1 año" },
] as const;

/** Etapas de cierre: de ahí ya no se avanza ni se pierde. */
const FINAL_STAGES = new Set([
  "11 - Propuesta Rechazada",
  "12 - Cerrado Ganado",
  "13 - Cerrado Perdido",
  "14 - Descartado",
]);

const cardClass =
  "rounded-2xl border border-[#e0e0e0] bg-white p-4 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-5";

const stageLabel = (stage: string) => stage.replace(/^\d+\s*-\s*/, "");

const money = (amount: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);

function Card({
  title,
  description,
  help,
  children,
}: {
  title: string;
  description?: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <section className={cardClass}>
      <h3 className="flex items-center gap-1 text-base font-semibold text-[#212121] dark:text-white">
        {title}
        {help ? <InfoTip label={title}>{help}</InfoTip> : null}
      </h3>
      {description ? (
        <p className="mt-0.5 text-sm text-[#616161] dark:text-[#b0b0b0]">
          {description}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  help,
  warning = false,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  help: string;
  warning?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border px-3 py-2 pr-8",
        warning
          ? "border-amber-300 dark:border-amber-600"
          : "border-[#e8e8e8] dark:border-[#333]",
      )}
    >
      <span className="absolute right-2 top-1.5">
        <InfoTip label={label}>{help}</InfoTip>
      </span>
      <p className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums text-[#212121] dark:text-white">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-[#9e9e9e]">{hint}</p> : null}
    </div>
  );
}

function Th({ label, help }: { label: string; help?: string }) {
  return (
    <th className="py-2 pr-3 font-medium">
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        {label}
        {help ? <InfoTip label={label}>{help}</InfoTip> : null}
      </span>
    </th>
  );
}

/**
 * Analítica de ventas del cliente (módulo `analytics`). Solo datos de su empresa; quien no puede ver
 * al equipo ve solo sus leads. Cada número trae su ayuda (ⓘ) y la sección empieza con instrucciones.
 */
export default function CompanyAnalyticsSection() {
  const [days, setDays] = useState<number>(90);
  const { data, loading, error } = useQuery<CompanyAnalyticsResponse>(
    COMPANY_ANALYTICS_QUERY,
    {
      variables: { input: { days } },
      fetchPolicy: "cache-and-network",
    },
  );
  const a = data?.companyAnalytics;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-[#212121] dark:text-white">
          Analítica
        </h2>
        <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e]">
          {a?.scope === "own"
            ? "Tus números de venta: solo los leads que tienes asignados."
            : "Los números de venta de todo tu equipo."}
        </p>
      </div>

      <div
        data-tour="analytics-guide"
        className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-[#424242] dark:border-orange-900/60 dark:bg-orange-500/10 dark:text-[#e0e0e0]"
      >
        <p className="font-semibold text-[#212121] dark:text-white">
          Cómo leer esta sección
        </p>
        <p className="mt-1">{HELP.guide}</p>
        <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
          {a?.dataSince
            ? `Datos desde el ${formatDateShort(a.dataSince, false)}. `
            : ""}
          Toca el ícono ⓘ de cada número para saber qué es.
        </p>
      </div>

      <div
        role="group"
        aria-label="Periodo"
        data-tour="analytics-period"
        className="flex flex-wrap items-center gap-2"
      >
        <span className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
          Periodo
        </span>
        {PERIODS.map((period) => (
          <button
            key={period.days}
            type="button"
            aria-pressed={days === period.days}
            onClick={() => setDays(period.days)}
            className={cn(
              "h-11 rounded-lg border px-3 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:h-9",
              days === period.days
                ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                : "border-transparent bg-black/5 text-[#616161] hover:bg-black/10 dark:bg-white/5 dark:text-[#b0b0b0] dark:hover:bg-white/10",
            )}
          >
            {period.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error.graphQLErrors[0]?.message ??
            "No se pudo cargar la analítica. Intenta de nuevo."}
        </div>
      ) : loading && !a ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-[#ececec] dark:bg-[#2a2a2a]"
            />
          ))}
        </div>
      ) : !a || !a.dataSince ? (
        <div className={cn(cardClass, "py-10 text-center")}>
          <p className="font-semibold text-[#212121] dark:text-white">
            Todavía no hay datos
          </p>
          <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Los números empiezan a salir cuando mueves tus leads de etapa en
            Clientes.
          </p>
        </div>
      ) : (
        <>
          <div data-tour="analytics-kpis" className="flex flex-col gap-5">
            <Card
              title="Cierre"
              description={`Tratos que cerraste en los últimos ${a.days} días.`}
            >
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <Stat
                  label="Tasa de cierre"
                  value={formatRate(a.winRate)}
                  hint={`${a.won} ${a.won === 1 ? "ganado" : "ganados"} · ${a.lost} ${a.lost === 1 ? "perdido" : "perdidos"}`}
                  help={HELP.winRate}
                />
                <Stat
                  label="Ciclo de venta"
                  value={formatDays(a.medianCycleDays)}
                  help={HELP.salesCycle}
                />
                <Stat
                  label="Valor ganado"
                  value={money(a.wonValue)}
                  help={HELP.wonValue}
                />
                <Stat
                  label="Estancados"
                  value={a.stalled}
                  hint="Sin moverse en 14 días o más"
                  help={HELP.stalled}
                  warning={a.stalled > 0}
                />
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:items-start">
              <Card
                title="Primer contacto"
                description={`${a.newLeads} leads nuevos en el periodo.`}
              >
                <div className="grid grid-cols-2 gap-2">
                  <Stat
                    label="Tiempo al primer contacto"
                    value={formatHours(a.medianFirstContactHours)}
                    hint={`${a.contacted} contactados`}
                    help={HELP.firstContact}
                  />
                  <Stat
                    label="Contactados en 48 h"
                    value={formatShare(a.contactedWithin2Days, a.newLeads)}
                    hint={`${a.contactedWithin2Days} de ${a.newLeads}`}
                    help={HELP.contacted2d}
                  />
                </div>
              </Card>
              <Card
                title="WhatsApp"
                description={`${a.whatsappInbound} mensajes de clientes en el periodo.`}
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Stat
                    label="Tiempo de respuesta"
                    value={formatMinutes(a.whatsappMedianResponseMinutes)}
                    help={HELP.waResponse}
                  />
                  <Stat
                    label="Contestados en 1 h"
                    value={formatShare(
                      a.whatsappAnsweredWithin1h,
                      a.whatsappInbound,
                    )}
                    hint={`${a.whatsappAnsweredWithin1h} de ${a.whatsappInbound}`}
                    help={HELP.waWithin1h}
                  />
                  <Stat
                    label="Te contestan"
                    value={formatShare(
                      a.whatsappReplied,
                      a.whatsappConversations,
                    )}
                    hint={`${a.whatsappReplied} de ${a.whatsappConversations}`}
                    help={HELP.waReplyRate}
                  />
                </div>
              </Card>
            </div>
          </div>

          <Card title="Etapas de tu pipeline" help={HELP.stages}>
            {a.stages.length === 0 ? (
              <p className="text-sm text-[#9e9e9e]">
                Ningún lead cambió de etapa en el periodo.
              </p>
            ) : (
              <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                    <tr>
                      <Th label="Etapa" />
                      <Th label="Entraron" help={HELP.stageEntered} />
                      <Th label="Avanzaron" help={HELP.stageAdvanced} />
                      <Th label="Se perdieron" help={HELP.stageLost} />
                      <Th label="Días en la etapa" help={HELP.stageDays} />
                      <Th label="Estancados" help={HELP.stageStalled} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                    {a.stages.map((row) => {
                      const final = FINAL_STAGES.has(row.stage);
                      return (
                        <tr key={row.stage}>
                          <td className="py-2 pr-3 text-[#212121] dark:text-white">
                            {stageLabel(row.stage)}
                          </td>
                          <td className="py-2 pr-3 tabular-nums text-[#212121] dark:text-white">
                            {row.entered}
                          </td>
                          <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                            {final
                              ? "—"
                              : `${formatShare(row.advanced, row.entered)} (${row.advanced})`}
                          </td>
                          <td className="py-2 pr-3 tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                            {final ? "—" : row.lost}
                          </td>
                          <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                            {formatDays(row.medianDays)}
                          </td>
                          <td
                            className={cn(
                              "py-2 tabular-nums",
                              row.stalled
                                ? "font-semibold text-amber-700 dark:text-amber-300"
                                : "text-[#9e9e9e]",
                            )}
                          >
                            {row.stalled}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {a.scope === "team" ? (
            <Card title="Tu equipo" help={HELP.team}>
              {a.sellers.length === 0 ? (
                <p className="text-sm text-[#9e9e9e]">
                  Nadie movió leads en el periodo.
                </p>
              ) : (
                <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      <tr>
                        <Th label="Vendedor" />
                        <Th label="Leads nuevos" help={HELP.stageEntered} />
                        <Th label="Primer contacto" help={HELP.firstContact} />
                        <Th label="Ganados" />
                        <Th label="Tasa de cierre" help={HELP.winRate} />
                        <Th label="Estancados" help={HELP.stalled} />
                        <Th label="Actividades" />
                        <Th label="WhatsApp" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                      {a.sellers.map((seller) => (
                        <tr key={seller.userId ?? "sin-vendedor"}>
                          <td className="py-2 pr-3 font-medium text-[#212121] dark:text-white">
                            {seller.name}
                          </td>
                          <td className="py-2 pr-3 tabular-nums">
                            {seller.entered}
                          </td>
                          <td className="whitespace-nowrap py-2 pr-3 tabular-nums">
                            {formatHours(seller.medianFirstContactHours)}
                          </td>
                          <td className="py-2 pr-3 tabular-nums">
                            {seller.won}
                          </td>
                          <td className="py-2 pr-3 tabular-nums">
                            {formatRate(seller.winRate)}
                          </td>
                          <td
                            className={cn(
                              "py-2 pr-3 tabular-nums",
                              seller.stalled
                                ? "font-semibold text-amber-700 dark:text-amber-300"
                                : "",
                            )}
                          >
                            {seller.stalled}
                          </td>
                          <td className="py-2 pr-3 tabular-nums">
                            {seller.activities}
                          </td>
                          <td className="py-2 tabular-nums">
                            {seller.whatsappSent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          ) : null}

          <div data-tour="analytics-stalled">
            <Card title="Tratos estancados" help={HELP.stalledList}>
              {a.stalledDeals.length === 0 ? (
                <p className="text-sm text-[#9e9e9e]">
                  Ningún trato lleva más de 14 días sin moverse. ¡Bien!
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                  {a.stalledDeals.map((deal, index) => {
                    const content = (
                      <>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-[#212121] dark:text-white">
                            {deal.leadName}
                          </span>
                          <span className="block text-xs text-[#616161] dark:text-[#b0b0b0]">
                            {stageLabel(deal.stage)} · {deal.days} días sin
                            moverse
                            {deal.sellerName ? ` · ${deal.sellerName}` : ""}
                          </span>
                        </span>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          size={16}
                          className="shrink-0 text-[#9e9e9e]"
                        />
                      </>
                    );
                    return (
                      <li key={`${deal.businessLeadId ?? "lead"}-${index}`}>
                        {deal.businessLeadId ? (
                          <Link
                            href={Routes.panelLead(deal.businessLeadId)}
                            className="flex min-h-11 items-center justify-between gap-3 py-2 hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded"
                          >
                            {content}
                          </Link>
                        ) : (
                          <div className="flex min-h-11 items-center justify-between gap-3 py-2">
                            {content}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
