"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Chart01Icon,
  FileAttachmentIcon,
  FlashIcon,
  InformationCircleIcon,
  SparklesIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { ReferralLinkSection } from "kadesh/components/home";
import EmptyCompanySection from "kadesh/components/profile/sales/EmptyCompanySection";
import { KADESH_URIM_AI_NAME } from "kadesh/components/profile/ai/constants";
import { InfoTooltip } from "kadesh/components/shared";
import {
  PIPELINE_STATUS_COLORS,
  PROJECT_STATUS_CLASSES,
  QUOTATION_STATUS_COLORS,
} from "kadesh/constants/constans";
import { Routes } from "kadesh/core/routes";
import { formatCurrency } from "kadesh/utils/format-currency";
import { formatDate, formatDateShort } from "kadesh/utils/format-date";
import { cn } from "kadesh/utils/cn";
import type { SubscriptionData } from "kadesh/components/profile/sales/queries";
import { PipelineBars, ShareBars, WeeklyBars } from "./charts";
import { useCompanyDashboard } from "./useCompanyDashboard";
import type { DashboardStats } from "./aggregate";

type CompanyDashboardProps = {
  userId: string;
  userName: string;
  companyId: string | null;
  hasCompanyWideLeadScope: boolean;
  isAdminCompany: boolean;
  hasVendedorRole: boolean;
  canManageAi: boolean;
  hasAdminRole: boolean;
  subscription: SubscriptionData | null;
  referralCode: string;
  bank: string | null | undefined;
  clabe: string | null | undefined;
  cardNumber: string | null | undefined;
  onCompanyCreated: () => Promise<unknown>;
};

const panelClass =
  "rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm";

const kpiCellClass =
  "relative z-0 hover:z-30 focus-within:z-30 bg-white dark:bg-[#1e1e1e] px-3 py-3 overflow-visible";

function pipelineShort(status: string | null | undefined): string {
  if (!status) return "Sin etapa";
  return status.replace(/^\d+\s*-\s*/, "");
}

function formatPct(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(0)}%`;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-20 rounded-2xl bg-[#ececec] dark:bg-[#1e1e1e] animate-pulse" />
      <div className="h-24 rounded-2xl bg-[#ececec] dark:bg-[#1e1e1e] animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-52 rounded-2xl bg-[#ececec] dark:bg-[#1e1e1e] animate-pulse" />
        <div className="h-52 rounded-2xl bg-[#ececec] dark:bg-[#1e1e1e] animate-pulse" />
      </div>
    </div>
  );
}

function KpiCell({
  label,
  value,
  hint,
  delta,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: { value: number; suffix: string } | null;
  href?: string;
}) {
  const deltaPositive = (delta?.value ?? 0) >= 0;
  const content = (
    <>
      <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0] flex items-center gap-1">
        {label}
        {hint ? <InfoTooltip text={hint} /> : null}
      </p>
      <p className="mt-1 text-3xl leading-none font-semibold tabular-nums tracking-tight text-[#212121] dark:text-white">
        {value}
      </p>
      {delta !== undefined ? (
        delta == null || delta.value === 0 ? (
          <p className="mt-1 text-sm text-[#9e9e9e] dark:text-[#7a7a7a]">
            vs. mes anterior
          </p>
        ) : (
          <p
            className={cn(
              "mt-1 text-sm tabular-nums flex items-center gap-0.5",
              deltaPositive
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400",
            )}
          >
            <HugeiconsIcon
              icon={deltaPositive ? ArrowUp01Icon : ArrowDown01Icon}
              size={12}
            />
            {deltaPositive ? "+" : ""}
            {delta.value.toFixed(0)}
            {delta.suffix}
          </p>
        )
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-lg p-1 -m-1 hover:bg-[#f7f7f7] dark:hover:bg-[#2a2a2a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        {content}
      </Link>
    );
  }
  return <div>{content}</div>;
}

function SectionHead({
  title,
  href,
  hrefLabel,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-3">
      <h3 className="text-lg font-semibold text-[#212121] dark:text-white">
        {title}
      </h3>
      {href ? (
        <Link
          href={href}
          className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1"
        >
          {hrefLabel ?? "Ver todo"}
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
        </Link>
      ) : null}
    </div>
  );
}

function QuickActions({
  hasVendedorRole,
  canManageAi,
}: {
  hasVendedorRole: boolean;
  canManageAi: boolean;
}) {
  const actions = [
    { label: "Editar perfil", href: Routes.panelProfile, icon: UserIcon },
    { label: "Novedades", href: Routes.novedades, icon: FlashIcon },
    ...(canManageAi
      ? [
          {
            label: KADESH_URIM_AI_NAME,
            href: Routes.panelAi,
            icon: SparklesIcon,
            ai: true,
          },
        ]
      : []),
    ...(hasVendedorRole
      ? [
          {
            label: "Ver clientes",
            href: `${Routes.panel}?tab=clientes`,
            icon: Chart01Icon,
          },
          {
            label: "Planes",
            href: Routes.panelPlans,
            icon: FileAttachmentIcon,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 py-1.5 text-sm font-medium text-[#212121] dark:text-white hover:border-orange-500/60 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <span
            className={"ai" in action && action.ai ? "ai-urim-icon" : undefined}
          >
            <HugeiconsIcon icon={action.icon} size={16} />
          </span>
          {action.label}
        </Link>
      ))}
    </div>
  );
}

function AttentionList({ stats }: { stats: DashboardStats }) {
  const items: Array<{ label: string; detail: string; href: string }> = [];

  if (stats.overdueFollowUpsCount > 0) {
    items.push({
      label: `${stats.overdueFollowUpsCount} seguimientos vencidos`,
      detail: "Hay clientes esperando el siguiente contacto.",
      href: `${Routes.panel}?tab=calendar`,
    });
  }
  if (stats.unassignedLeads > 0) {
    items.push({
      label: `${stats.unassignedLeads} clientes sin vendedor`,
      detail: "Asígnarlos para que no se enfríen en el pipeline.",
      href: `${Routes.panel}?tab=clientes`,
    });
  }
  if (stats.expiringQuotations.length > 0) {
    items.push({
      label: `${stats.expiringQuotations.length} cotizaciones por vencer`,
      detail: "Vigencia en los próximos 7 días.",
      href: `${Routes.panel}?tab=cotizaciones`,
    });
  }

  if (items.length === 0) return null;

  return (
    <section className={panelClass}>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h3 className="text-lg font-semibold text-[#212121] dark:text-white">
          Requiere atención
        </h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="flex items-start gap-2.5 rounded-lg py-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <span className="mt-0.5 text-amber-600 dark:text-amber-400">
                <HugeiconsIcon icon={InformationCircleIcon} size={18} />
              </span>
              <span>
                <span className="block text-base font-medium text-[#212121] dark:text-white">
                  {item.label}
                </span>
                <span className="block text-sm text-[#616161] dark:text-[#b0b0b0]">
                  {item.detail}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CompanyDashboard({
  userId,
  userName,
  companyId,
  hasCompanyWideLeadScope,
  isAdminCompany,
  hasVendedorRole,
  canManageAi,
  hasAdminRole,
  subscription,
  referralCode,
  bank,
  clabe,
  cardNumber,
  onCompanyCreated,
}: CompanyDashboardProps) {
  const firstName = userName?.split(/\s+/)[0] || "Usuario";
  const todayLabel = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const { stats, loading, error, refetch, team, credits } = useCompanyDashboard(
    {
      companyId,
      userId,
      hasCompanyWideLeadScope,
      isAdminCompany,
    },
  );

  if (!companyId) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-gradient-to-br from-orange-500/10 to-orange-600/5 dark:from-orange-500/20 dark:to-transparent px-5 py-4">
          <h2 className="text-2xl font-bold text-[#212121] dark:text-white">
            Hola, {firstName}
          </h2>
          <p className="mt-0.5 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Crea tu empresa para ver el pulso de tus clientes, pipeline y
            cotizaciones.
          </p>
        </div>
        <EmptyCompanySection
          userId={userId}
          onSuccess={async () => {
            await onCompanyCreated();
          }}
        />
      </div>
    );
  }

  if (loading || !stats) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className={panelClass}>
        <h2 className="text-lg font-semibold text-[#212121] dark:text-white">
          No se pudo cargar el dashboard
        </h2>
        <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
          Revisa tu conexión e inténtalo de nuevo.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const remainingQuota = credits.remainingQuota;
  const leadLimit = credits.leadLimit;
  const planName = subscription?.planName ?? stats.planName ?? "Sin plan";
  const scopeLabel = hasCompanyWideLeadScope
    ? stats.companyName || "Tu empresa"
    : "Tus clientes asignados";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-gradient-to-br from-orange-500/10 to-orange-600/5 dark:from-orange-500/20 dark:to-transparent px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm capitalize text-[#616161] dark:text-[#b0b0b0]">
              {todayLabel}
            </p>
            <h2 className="mt-0.5 text-2xl font-bold text-[#212121] dark:text-white">
              Hola, {firstName}
            </h2>
            <p className="mt-0.5 text-sm text-[#616161] dark:text-[#b0b0b0]">
              {scopeLabel}
              {planName ? ` · ${planName}` : ""}
            </p>
          </div>
          <QuickActions
            hasVendedorRole={hasVendedorRole}
            canManageAi={canManageAi}
          />
        </div>
      </div>

      <section className={cn(panelClass, "overflow-visible")}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-[#ececec] dark:bg-[#2e2e2e] rounded-xl overflow-visible">
          <div className={kpiCellClass}>
            <KpiCell
              label="Clientes"
              value={String(stats.leadsCount)}
              hint="Leads de la empresa en el alcance actual."
              href={`${Routes.panel}?tab=clientes`}
            />
          </div>
          <div className={kpiCellClass}>
            <KpiCell
              label="Nuevos este mes"
              value={String(stats.leadsThisMonth)}
              hint={`El mes pasado: ${stats.leadsLastMonth}.`}
              delta={
                stats.leadsMonthDeltaPct == null
                  ? null
                  : { value: stats.leadsMonthDeltaPct, suffix: "%" }
              }
            />
          </div>
          <div className={kpiCellClass}>
            <KpiCell
              label="Pipeline abierto"
              value={formatCurrency(stats.openPipelineValue)}
              hint="Suma del valor estimado en etapas abiertas (sin cerrados ni descartados)."
            />
          </div>
          <div className={kpiCellClass}>
            <KpiCell
              label="Cerrados ganados"
              value={String(stats.wonLeads)}
              hint="Clientes en etapa Cerrado Ganado."
            />
          </div>
          <div className={cn(kpiCellClass, "col-span-2 lg:col-span-1")}>
            <KpiCell
              label="Tasa de cierre"
              value={formatPct(stats.closeRate)}
              hint="Ganados entre ganados + perdidos. La conversión sobre el total de leads es otra métrica."
            />
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1.5">
          <div className="flex items-baseline gap-2">
            <dt className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              Contactados
            </dt>
            <dd className="text-base font-semibold tabular-nums text-[#212121] dark:text-white">
              {stats.contactedLeads}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              Conversión
            </dt>
            <dd className="text-base font-semibold tabular-nums text-[#212121] dark:text-white">
              {formatPct(stats.conversionRate)}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              Valor ganado
            </dt>
            <dd className="text-base font-semibold tabular-nums text-[#212121] dark:text-white">
              {formatCurrency(stats.wonPipelineValue)}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              Seguimientos vencidos
            </dt>
            <dd className="text-base font-semibold tabular-nums text-[#212121] dark:text-white">
              {stats.overdueFollowUpsCount}
            </dd>
          </div>
        </dl>
      </section>

      <AttentionList stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <section className={cn(panelClass, "lg:col-span-3")}>
          <SectionHead
            title="Pipeline comercial"
            href={`${Routes.panel}?tab=clientes`}
            hrefLabel="Ir a clientes"
          />
          {stats.pipelineTruncated ? (
            <p className="mb-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
              Mostrando una muestra de{" "}
              {stats.pipelineBars.reduce((s, b) => s + b.count, 0)} de{" "}
              {stats.pipelineCount} estados.
            </p>
          ) : null}
          <PipelineBars bars={stats.pipelineBars} />
        </section>
        <section className={cn(panelClass, "lg:col-span-2")}>
          <SectionHead title="Altas por semana" />
          <WeeklyBars bars={stats.weeklyBars} />
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className={panelClass}>
          <SectionHead
            title="Agenda de seguimientos"
            href={`${Routes.panel}?tab=calendar`}
          />
          {stats.followUpsOverdue.length +
            stats.followUpsToday.length +
            stats.followUpsUpcoming.length ===
          0 ? (
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              No hay seguimientos pendientes en los próximos 7 días. Programa el
              siguiente contacto desde el cliente.
            </p>
          ) : (
            <ul className="space-y-2">
              {[
                ...stats.followUpsOverdue.map((task) => ({
                  task,
                  tone: "vencido" as const,
                })),
                ...stats.followUpsToday.map((task) => ({
                  task,
                  tone: "hoy" as const,
                })),
                ...stats.followUpsUpcoming.map((task) => ({
                  task,
                  tone: "próximo" as const,
                })),
              ]
                .slice(0, 8)
                .map(({ task, tone }) => (
                  <li
                    key={task.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      {task.businessLead ? (
                        <Link
                          href={Routes.panelLead(task.businessLead.id)}
                          className="text-base font-medium text-[#212121] dark:text-white hover:text-orange-600 dark:hover:text-orange-400 truncate block"
                        >
                          {task.businessLead.businessName}
                        </Link>
                      ) : (
                        <p className="text-base font-medium text-[#212121] dark:text-white">
                          Seguimiento
                        </p>
                      )}
                      <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                        {formatDateShort(task.scheduledDate, false)}
                        {task.assignedSeller
                          ? ` · ${task.assignedSeller.name}`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-xs font-medium rounded-full px-2 py-0.5",
                        tone === "vencido" &&
                          "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
                        tone === "hoy" &&
                          "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
                        tone === "próximo" &&
                          "bg-[#f3f3f3] text-[#616161] dark:bg-[#2a2a2a] dark:text-[#b0b0b0]",
                      )}
                    >
                      {tone === "vencido"
                        ? "Vencido"
                        : tone === "hoy"
                          ? "Hoy"
                          : "Próximo"}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className={panelClass}>
          <SectionHead
            title="Clientes recientes"
            href={`${Routes.panel}?tab=clientes`}
          />
          {stats.recentLeads.length === 0 ? (
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              Todavía no hay clientes. Extrae negocios desde Extracción B2B para
              llenar el pipeline.
            </p>
          ) : (
            <ul className="space-y-2">
              {stats.recentLeads.map((lead) => {
                const status = lead.status?.[0]?.pipelineStatus;
                return (
                  <li
                    key={lead.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={Routes.panelLead(lead.id)}
                        className="text-base font-medium text-[#212121] dark:text-white hover:text-orange-600 dark:hover:text-orange-400 truncate block"
                      >
                        {lead.businessName}
                      </Link>
                      <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-0.5 truncate">
                        {[lead.category, lead.city]
                          .filter(Boolean)
                          .join(" · ") || "Sin categoría"}
                        {" · "}
                        {formatDate(lead.createdAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-xs font-medium rounded-full px-2 py-0.5",
                        status
                          ? (PIPELINE_STATUS_COLORS[status] ??
                              "bg-[#f3f3f3] text-[#616161]")
                          : "bg-[#f3f3f3] text-[#616161] dark:bg-[#2a2a2a] dark:text-[#b0b0b0]",
                      )}
                    >
                      {pipelineShort(status)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className={panelClass}>
          <SectionHead title="Categorías" />
          <ShareBars
            items={stats.topCategories}
            emptyLabel="Sin categorías todavía."
          />
        </section>
        <section className={panelClass}>
          <SectionHead title="Ciudades" />
          <ShareBars
            items={stats.topCities}
            emptyLabel="Sin ciudades todavía."
          />
        </section>
        <section className={panelClass}>
          <SectionHead title="Origen del lead" />
          <ShareBars
            items={stats.topSources}
            emptyLabel="Sin fuentes todavía."
          />
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className={panelClass}>
          <SectionHead
            title="Cotizaciones"
            href={`${Routes.panel}?tab=cotizaciones`}
          />
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mb-3">
            {stats.quotationsCount} en total
            {stats.acceptedQuotationValue > 0
              ? ` · aceptadas ${formatCurrency(stats.acceptedQuotationValue)}`
              : ""}
          </p>
          {stats.quotationsCount === 0 ? (
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              Cuando envíes una cotización, aquí verás montos y estados.
            </p>
          ) : (
            <>
              <ShareBars
                items={stats.quotationStatus}
                emptyLabel="Sin cotizaciones."
              />
              <ul className="mt-3 space-y-2">
                {stats.recentQuotations.slice(0, 4).map((quotation) => (
                  <li
                    key={quotation.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <Link
                      href={Routes.panelQuotation(quotation.id)}
                      className="text-base font-medium text-[#212121] dark:text-white hover:text-orange-600 dark:hover:text-orange-400 truncate"
                    >
                      {quotation.quotationNumber}
                      {quotation.lead?.businessName
                        ? ` · ${quotation.lead.businessName}`
                        : ""}
                    </Link>
                    <span
                      className={cn(
                        "text-xs font-medium rounded-full px-2 py-0.5",
                        quotation.status
                          ? QUOTATION_STATUS_COLORS[
                              quotation.status as keyof typeof QUOTATION_STATUS_COLORS
                            ]
                          : "bg-[#f3f3f3] text-[#616161]",
                      )}
                    >
                      {formatCurrency(quotation.total ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className={panelClass}>
          <SectionHead
            title="Proyectos"
            href={`${Routes.panel}?tab=proyectos`}
          />
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mb-3">
            {stats.projectsCount} en total
          </p>
          {stats.projectsCount === 0 ? (
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              Los proyectos aparecen cuando cierras un cliente y das seguimiento
              al trabajo.
            </p>
          ) : (
            <>
              <ShareBars
                items={stats.projectStatus}
                emptyLabel="Sin proyectos."
              />
              <ul className="mt-3 space-y-2">
                {stats.recentProjects.slice(0, 4).map((project) => (
                  <li
                    key={project.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <Link
                      href={Routes.panelProject(project.id)}
                      className="text-base font-medium text-[#212121] dark:text-white hover:text-orange-600 dark:hover:text-orange-400 truncate"
                    >
                      {project.name}
                    </Link>
                    <span
                      className={cn(
                        "text-xs font-medium rounded-full px-2 py-0.5",
                        project.status
                          ? PROJECT_STATUS_CLASSES[project.status]
                          : "bg-[#f3f3f3] text-[#616161]",
                      )}
                    >
                      {project.status ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {isAdminCompany && team.length > 0 ? (
        <section className={panelClass}>
          <SectionHead
            title="Equipo comercial"
            href={`${Routes.panel}?tab=vendedores`}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-sm text-[#616161] dark:text-[#b0b0b0] border-b border-[#ececec] dark:border-[#2e2e2e]">
                  <th className="pb-2 font-medium">Vendedor</th>
                  <th className="pb-2 font-medium text-right tabular-nums">
                    Clientes
                  </th>
                  <th className="pb-2 font-medium text-right tabular-nums">
                    Seguimientos
                  </th>
                  <th className="pb-2 font-medium text-right tabular-nums">
                    Propuestas
                  </th>
                </tr>
              </thead>
              <tbody>
                {team.slice(0, 8).map((seller) => (
                  <tr
                    key={seller.id}
                    className="border-b border-[#f3f3f3] dark:border-[#2a2a2a] last:border-0"
                  >
                    <td className="py-2 text-[#212121] dark:text-white">
                      {[seller.name, seller.lastName].filter(Boolean).join(" ")}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {seller.businessLeadsAssignedCount ?? 0}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {seller.followUpTasksCount ?? 0}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {seller.proposalsCount ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className={panelClass}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#212121] dark:text-white">
              Créditos de extracción
            </h3>
            <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
              {credits.loading
                ? "Consultando saldo…"
                : remainingQuota == null
                  ? "No hay un periodo de créditos activo."
                  : `${remainingQuota} disponibles de ${leadLimit ?? "—"} este mes.`}
            </p>
          </div>
          <Link
            href={Routes.panelCredits}
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            Ver créditos
          </Link>
        </div>
        {remainingQuota != null && leadLimit != null && leadLimit > 0 ? (
          <div className="mt-3 h-2 rounded-full bg-[#f0f0f0] dark:bg-[#2a2a2a] overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                remainingQuota < 5
                  ? "bg-red-500"
                  : remainingQuota < 20
                    ? "bg-amber-500"
                    : "bg-orange-500",
              )}
              style={{
                width: `${Math.min(100, Math.max(4, (remainingQuota / leadLimit) * 100))}%`,
              }}
            />
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <ReferralLinkSection
          userId={userId}
          referralCode={referralCode}
          bank={bank}
          clabe={clabe}
          cardNumber={cardNumber}
        />
        <div className="flex justify-end">
          <Link
            href={`${Routes.panel}?tab=referidos`}
            className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1"
          >
            Ver referidos y comisiones
            <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
          </Link>
        </div>
      </section>

      {hasAdminRole ? (
        <div className="pt-1 flex justify-center">
          <Link
            href="/panel/clientes/admin"
            className="text-xs text-[#616161] dark:text-[#b0b0b0] underline decoration-dotted opacity-70 hover:opacity-100 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            Admin: verificar suscripciones (debug)
          </Link>
        </div>
      ) : null}
    </div>
  );
}
