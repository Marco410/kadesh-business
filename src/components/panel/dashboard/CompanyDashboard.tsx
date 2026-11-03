"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  CalendarIcon,
  Chart01Icon,
  FileAttachmentIcon,
  FileIcon,
  FlashIcon,
  FolderIcon,
  InformationCircleIcon,
  SparklesIcon,
  UserIcon,
  UserMultiple02Icon,
  WorkIcon,
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
import {
  canAccessNavTab,
  type NavAccessContext,
} from "kadesh/components/profile/usuarios/can";
import { useUser } from "kadesh/utils/UserContext";
import type { SubscriptionData } from "kadesh/components/profile/sales/queries";
import { PipelineBars, ShareBars, WeeklyBars } from "./charts";
import { DailyDigestCard } from "./DailyDigestCard";
import { useCompanyDashboard } from "./useCompanyDashboard";
import type { DashboardStats } from "./aggregate";
import {
  DASHBOARD_EASE,
  dashboardTransition,
  dashboardViewport,
  fadeUpVariants,
  staggerContainer,
} from "./motion";

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
  "h-full rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-dash md:p-6";

const kpiCellClass =
  "relative z-0 hover:z-30 focus-within:z-30 h-full bg-dash-surface px-3 py-3 overflow-visible";

function pipelineShort(status: string | null | undefined): string {
  if (!status) return "Sin etapa";
  return status.replace(/^\d+\s*-\s*/, "");
}

function formatPct(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(0)}%`;
}

const MotionLink = motion.create(Link);

function DashboardInView({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("h-full min-h-0", className)}
      variants={fadeUpVariants(reduce)}
      initial="hidden"
      whileInView="show"
      viewport={dashboardViewport}
      transition={dashboardTransition(reduce, delay)}
    >
      {children}
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <motion.div
      className="space-y-4"
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-20 rounded-2xl dark:bg-[#1e1e1e] dash-shimmer" />
      <div className="h-24 rounded-2xl dark:bg-[#1e1e1e] dash-shimmer" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-52 rounded-2xl dark:bg-[#1e1e1e] dash-shimmer" />
        <div className="h-52 rounded-2xl dark:bg-[#1e1e1e] dash-shimmer" />
      </div>
    </motion.div>
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
      <p className="text-[13px] font-medium text-dash-muted flex items-center gap-1">
        {label}
        {hint ? <InfoTooltip text={hint} /> : null}
      </p>
      <p className="mt-1.5 text-[1.75rem] leading-none font-bold tabular-nums tracking-[-0.045em] text-dash-ink sm:text-[2rem]">
        {value}
      </p>
      {delta !== undefined ? (
        delta == null || delta.value === 0 ? (
          <p className="mt-1 text-sm text-dash-faint dark:text-[#7a7a7a]">
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
        className="block rounded-[14px] p-1.5 -m-1.5 hover:bg-dash-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
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
    <div className="flex items-center justify-between gap-3 mb-4">
      <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-dash-ink">
        {title}
      </h3>
      {href ? (
        <Link
          href={href}
          className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-500/10"
        >
          {hrefLabel ?? "Ver todo"}
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
        </Link>
      ) : null}
    </div>
  );
}

function QuickActions({ navCtx }: { navCtx: NavAccessContext }) {
  const { user } = useUser();
  const reduce = useReducedMotion();
  const canTab = (tab: string) => canAccessNavTab(user, tab, navCtx);

  type Action = {
    label: string;
    href: string;
    icon: typeof UserIcon;
    ai?: boolean;
  };

  const actions: Action[] = [
    ...(canTab("profile")
      ? [{ label: "Editar perfil", href: Routes.panelProfile, icon: UserIcon }]
      : []),
    { label: "Novedades", href: Routes.novedades, icon: FlashIcon },
    ...(canTab("ai")
      ? [
          {
            label: KADESH_URIM_AI_NAME,
            href: Routes.panelAi,
            icon: SparklesIcon,
            ai: true,
          },
        ]
      : []),
    ...(canTab("clientes")
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
    ...(canTab("cotizaciones")
      ? [
          {
            label: "Cotizaciones",
            href: `${Routes.panel}?tab=cotizaciones`,
            icon: FileIcon,
          },
        ]
      : []),
    ...(canTab("proyectos")
      ? [
          {
            label: "Proyectos",
            href: `${Routes.panel}?tab=proyectos`,
            icon: FolderIcon,
          },
        ]
      : []),
    ...(canTab("calendar")
      ? [
          {
            label: "Calendario",
            href: `${Routes.panel}?tab=calendar`,
            icon: CalendarIcon,
          },
        ]
      : []),
    ...(canTab("workspaces")
      ? [
          {
            label: "Espacios",
            href: `${Routes.panel}?tab=workspaces`,
            icon: WorkIcon,
          },
        ]
      : []),
    ...(canTab("usuarios")
      ? [
          {
            label: "Usuarios",
            href: `${Routes.panel}?tab=usuarios`,
            icon: UserMultiple02Icon,
          },
        ]
      : []),
  ];

  return (
    <motion.div
      className="flex flex-wrap gap-2"
      variants={staggerContainer(reduce, 0.06)}
      initial="hidden"
      animate="show"
    >
      {actions.map((action) => (
        <motion.div
          key={action.href}
          variants={fadeUpVariants(reduce)}
          transition={dashboardTransition(reduce)}
        >
          <MotionLink
            href={action.href}
            whileHover={reduce ? undefined : { y: -1 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.12, ease: DASHBOARD_EASE }}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-dash-line-strong bg-dash-surface px-3.5 text-sm font-semibold text-dash-ink transition-colors hover:border-orange-400"
          >
            <span className={action.ai ? "ai-urim-icon" : undefined}>
              <HugeiconsIcon icon={action.icon} size={16} />
            </span>
            {action.label}
          </MotionLink>
        </motion.div>
      ))}
    </motion.div>
  );
}

function AttentionList({
  stats,
  navCtx,
}: {
  stats: DashboardStats;
  navCtx: NavAccessContext;
}) {
  const { user } = useUser();
  const reduce = useReducedMotion();
  const items: Array<{ label: string; detail: string; href: string }> = [];

  if (
    stats.overdueFollowUpsCount > 0 &&
    canAccessNavTab(user, "calendar", navCtx)
  ) {
    items.push({
      label: `${stats.overdueFollowUpsCount} seguimientos vencidos`,
      detail: "Hay clientes esperando el siguiente contacto.",
      href: `${Routes.panel}?tab=calendar`,
    });
  }
  if (
    stats.unassignedLeads > 0 &&
    canAccessNavTab(user, "clientes", navCtx)
  ) {
    items.push({
      label: `${stats.unassignedLeads} clientes sin vendedor`,
      detail: "Asígnarlos para que no se enfríen en el pipeline.",
      href: `${Routes.panel}?tab=clientes`,
    });
  }
  if (
    stats.expiringQuotations.length > 0 &&
    canAccessNavTab(user, "cotizaciones", navCtx)
  ) {
    items.push({
      label: `${stats.expiringQuotations.length} cotizaciones por vencer`,
      detail: "Vigencia en los próximos 7 días.",
      href: `${Routes.panel}?tab=cotizaciones`,
    });
  }

  if (items.length === 0) return null;

  return (
    <DashboardInView>
      <section className={panelClass}>
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h3 className="text-lg font-semibold text-dash-ink">
            Requiere atención
          </h3>
        </div>
        <motion.ul
          className="space-y-1.5"
          variants={staggerContainer(reduce, 0)}
          initial="hidden"
          whileInView="show"
          viewport={dashboardViewport}
        >
          {items.map((item) => (
            <motion.li key={item.label} variants={fadeUpVariants(reduce)}>
              <Link
                href={item.href}
                className="flex items-start gap-2.5 rounded-lg py-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <span className="mt-0.5 text-amber-600 dark:text-amber-400">
                  <HugeiconsIcon icon={InformationCircleIcon} size={18} />
                </span>
                <span>
                  <span className="block text-base font-medium text-dash-ink">
                    {item.label}
                  </span>
                  <span className="block text-sm text-dash-muted">
                    {item.detail}
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </section>
    </DashboardInView>
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
  const { user } = useUser();
  const reduce = useReducedMotion();
  const navCtx: NavAccessContext = {
    hasVendedorRole,
    isAdminCompany,
    canManageAi,
  };
  const canClientes = canAccessNavTab(user, "clientes", navCtx);
  const canCalendar = canAccessNavTab(user, "calendar", navCtx);
  const canCotizaciones = canAccessNavTab(user, "cotizaciones", navCtx);
  const canProyectos = canAccessNavTab(user, "proyectos", navCtx);
  const canVendedores = canAccessNavTab(user, "vendedores", navCtx);

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
        <DashboardInView>
          <div className="rounded-3xl border border-dash-line bg-dash-surface bg-[radial-gradient(60%_120%_at_100%_0%,rgba(247,148,94,0.14),transparent_60%)] p-6 shadow-dash xl:p-8">
            <h2 className="text-2xl font-bold text-dash-ink">
              Hola, {firstName}
            </h2>
            <p className="mt-0.5 text-sm text-dash-muted">
              Crea tu empresa para ver el pulso de tus clientes, pipeline y
              cotizaciones.
            </p>
          </div>
        </DashboardInView>
        <DashboardInView delay={0.06}>
          <EmptyCompanySection
            userId={userId}
            onSuccess={async () => {
              await onCompanyCreated();
            }}
          />
        </DashboardInView>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <DashboardInView>
          <div className="rounded-3xl border border-dash-line bg-dash-surface bg-[radial-gradient(60%_120%_at_100%_0%,rgba(247,148,94,0.14),transparent_60%)] p-6 shadow-dash xl:p-8">
            <p className="text-[13px] font-semibold tracking-[0.02em] text-dash-muted first-letter:uppercase">
              {todayLabel}
            </p>
            <h2 className="mt-0.5 text-2xl font-bold text-dash-ink">
              Hola, {firstName}
            </h2>
          </div>
        </DashboardInView>
        <DashboardInView delay={0.04}>
          <DailyDigestCard
            companyId={companyId}
            navCtx={navCtx}
            canManageAi={canManageAi}
            isCompanyWide={hasCompanyWideLeadScope}
            remainingQuota={credits.remainingQuota}
            onGenerated={() => void credits.refetch()}
          />
        </DashboardInView>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <DashboardInView>
          <DailyDigestCard
            companyId={companyId}
            navCtx={navCtx}
            canManageAi={canManageAi}
            isCompanyWide={hasCompanyWideLeadScope}
            remainingQuota={credits.remainingQuota}
            onGenerated={() => void credits.refetch()}
          />
        </DashboardInView>
        <DashboardInView delay={0.05}>
          <div className={panelClass}>
            <h2 className="text-lg font-semibold text-dash-ink">
              No se pudo cargar el dashboard
            </h2>
            <p className="mt-1 text-sm text-dash-muted">
              Revisa tu conexión e inténtalo de nuevo.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-full dash-grad-accent px-4 py-2 text-sm font-medium text-white hover:shadow-dash-accent-lift shadow-dash-accent"
            >
              Reintentar
            </button>
          </div>
        </DashboardInView>
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
      <DashboardInView>
        <div className="rounded-3xl border border-dash-line bg-dash-surface bg-[radial-gradient(60%_120%_at_100%_0%,rgba(247,148,94,0.14),transparent_60%)] p-6 shadow-dash xl:p-8">
          <div className="flex flex-col gap-5">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold tracking-[0.02em] text-dash-muted first-letter:uppercase">
                {todayLabel}
              </p>
              <h2 className="mt-1 text-[clamp(1.6rem,1.2rem+1.6vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.04em] text-dash-ink">
                Hola, {firstName}.
              </h2>
              <p className="mt-0.5 text-sm text-dash-muted">
                {scopeLabel}
                {planName ? ` · ${planName}` : ""}
              </p>
            </div>
            <QuickActions navCtx={navCtx} />
          </div>
        </div>
      </DashboardInView>

      <DashboardInView delay={0.05}>
        <DailyDigestCard
          companyId={companyId}
          navCtx={navCtx}
          canManageAi={canManageAi}
          isCompanyWide={hasCompanyWideLeadScope}
          remainingQuota={remainingQuota}
          onGenerated={() => void credits.refetch()}
        />
      </DashboardInView>

      <DashboardInView delay={0.08}>
        <section className={cn(panelClass, "overflow-visible")}>
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-dash-surface-2 dark:bg-[#2e2e2e] rounded-xl overflow-visible"
            variants={staggerContainer(reduce, 0)}
            initial="hidden"
            whileInView="show"
            viewport={dashboardViewport}
          >
            <motion.div
              className={kpiCellClass}
              variants={fadeUpVariants(reduce)}
            >
              <KpiCell
                label="Clientes"
                value={String(stats.leadsCount)}
                hint="Leads de la empresa en el alcance actual."
                href={
                  canClientes
                    ? `${Routes.panel}?tab=clientes`
                    : undefined
                }
              />
            </motion.div>
            <motion.div
              className={kpiCellClass}
              variants={fadeUpVariants(reduce)}
            >
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
            </motion.div>
            <motion.div
              className={kpiCellClass}
              variants={fadeUpVariants(reduce)}
            >
              <KpiCell
                label="Pipeline abierto"
                value={formatCurrency(stats.openPipelineValue)}
                hint="Suma del valor estimado en etapas abiertas (sin cerrados ni descartados)."
              />
            </motion.div>
            <motion.div
              className={kpiCellClass}
              variants={fadeUpVariants(reduce)}
            >
              <KpiCell
                label="Cerrados ganados"
                value={String(stats.wonLeads)}
                hint="Clientes en etapa Cerrado Ganado."
              />
            </motion.div>
            <motion.div
              className={cn(kpiCellClass, "col-span-2 lg:col-span-1")}
              variants={fadeUpVariants(reduce)}
            >
              <KpiCell
                label="Tasa de cierre"
                value={formatPct(stats.closeRate)}
                hint="Ganados entre ganados + perdidos. La conversión sobre el total de leads es otra métrica."
              />
            </motion.div>
          </motion.div>
        <dl className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1.5">
          <div className="flex items-baseline gap-2">
            <dt className="text-sm text-dash-muted">
              Contactados
            </dt>
            <dd className="text-base font-semibold tabular-nums text-dash-ink">
              {stats.contactedLeads}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-sm text-dash-muted">
              Conversión
            </dt>
            <dd className="text-base font-semibold tabular-nums text-dash-ink">
              {formatPct(stats.conversionRate)}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-sm text-dash-muted">
              Valor ganado
            </dt>
            <dd className="text-base font-semibold tabular-nums text-dash-ink">
              {formatCurrency(stats.wonPipelineValue)}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-sm text-dash-muted">
              Seguimientos vencidos
            </dt>
            <dd className="text-base font-semibold tabular-nums text-dash-ink">
              {stats.overdueFollowUpsCount}
            </dd>
          </div>
        </dl>
        </section>
      </DashboardInView>

      <AttentionList stats={stats} navCtx={navCtx} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <DashboardInView className="lg:col-span-3">
        <section className={panelClass}>
          <SectionHead
            title="Pipeline comercial"
            href={
              canClientes ? `${Routes.panel}?tab=clientes` : undefined
            }
            hrefLabel="Ir a clientes"
          />
          {stats.pipelineTruncated ? (
            <p className="mb-2 text-sm text-dash-muted">
              Mostrando una muestra de{" "}
              {stats.pipelineBars.reduce((s, b) => s + b.count, 0)} de{" "}
              {stats.pipelineCount} estados.
            </p>
          ) : null}
          <PipelineBars bars={stats.pipelineBars} />
        </section>
        </DashboardInView>
        <DashboardInView className="lg:col-span-2" delay={0.05}>
        <section className={panelClass}>
          <SectionHead title="Altas por semana" />
          <WeeklyBars bars={stats.weeklyBars} />
        </section>
        </DashboardInView>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardInView>
        <section className={panelClass}>
          <SectionHead
            title="Agenda de seguimientos"
            href={
              canCalendar ? `${Routes.panel}?tab=calendar` : undefined
            }
          />
          {stats.followUpsOverdue.length +
            stats.followUpsToday.length +
            stats.followUpsUpcoming.length ===
          0 ? (
            <p className="text-sm text-dash-muted">
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
                      {task.businessLead && canClientes ? (
                        <Link
                          href={Routes.panelLead(task.businessLead.id)}
                          className="text-base font-medium text-dash-ink hover:text-orange-600 dark:hover:text-orange-400 truncate block"
                        >
                          {task.businessLead.businessName}
                        </Link>
                      ) : (
                        <p className="text-base font-medium text-dash-ink truncate">
                          {task.businessLead?.businessName ?? "Seguimiento"}
                        </p>
                      )}
                      <p className="text-sm text-dash-muted mt-0.5">
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
                          "bg-[#f3f3f3] text-dash-muted dark:bg-[#2a2a2a]",
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
        </DashboardInView>

        <DashboardInView delay={0.05}>
        <section className={panelClass}>
          <SectionHead
            title="Clientes recientes"
            href={
              canClientes ? `${Routes.panel}?tab=clientes` : undefined
            }
          />
          {stats.recentLeads.length === 0 ? (
            <p className="text-sm text-dash-muted">
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
                      {canClientes ? (
                        <Link
                          href={Routes.panelLead(lead.id)}
                          className="text-base font-medium text-dash-ink hover:text-orange-600 dark:hover:text-orange-400 truncate block"
                        >
                          {lead.businessName}
                        </Link>
                      ) : (
                        <p className="text-base font-medium text-dash-ink truncate">
                          {lead.businessName}
                        </p>
                      )}
                      <p className="text-sm text-dash-muted mt-0.5 truncate">
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
                              "bg-[#f3f3f3] text-dash-muted")
                          : "bg-[#f3f3f3] text-dash-muted dark:bg-[#2a2a2a]",
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
        </DashboardInView>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardInView>
        <section className={panelClass}>
          <SectionHead title="Categorías" />
          <ShareBars
            items={stats.topCategories}
            emptyLabel="Sin categorías todavía."
          />
        </section>
        </DashboardInView>
        <DashboardInView delay={0.04}>
        <section className={panelClass}>
          <SectionHead title="Ciudades" />
          <ShareBars
            items={stats.topCities}
            emptyLabel="Sin ciudades todavía."
          />
        </section>
        </DashboardInView>
        <DashboardInView delay={0.08}>
        <section className={panelClass}>
          <SectionHead title="Origen del lead" />
          <ShareBars
            items={stats.topSources}
            emptyLabel="Sin fuentes todavía."
          />
        </section>
        </DashboardInView>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardInView>
        <section className={panelClass}>
          <SectionHead
            title="Cotizaciones"
            href={
              canCotizaciones
                ? `${Routes.panel}?tab=cotizaciones`
                : undefined
            }
          />
          <p className="text-sm text-dash-muted mb-3">
            {stats.quotationsCount} en total
            {stats.acceptedQuotationValue > 0
              ? ` · aceptadas ${formatCurrency(stats.acceptedQuotationValue)}`
              : ""}
          </p>
          {stats.quotationsCount === 0 ? (
            <p className="text-sm text-dash-muted">
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
                    {canCotizaciones ? (
                      <Link
                        href={Routes.panelQuotation(quotation.id)}
                        className="text-base font-medium text-dash-ink hover:text-orange-600 dark:hover:text-orange-400 truncate"
                      >
                        {quotation.quotationNumber}
                        {quotation.lead?.businessName
                          ? ` · ${quotation.lead.businessName}`
                          : ""}
                      </Link>
                    ) : (
                      <span className="text-base font-medium text-dash-ink truncate">
                        {quotation.quotationNumber}
                        {quotation.lead?.businessName
                          ? ` · ${quotation.lead.businessName}`
                          : ""}
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium rounded-full px-2 py-0.5",
                        quotation.status
                          ? QUOTATION_STATUS_COLORS[
                              quotation.status as keyof typeof QUOTATION_STATUS_COLORS
                            ]
                          : "bg-[#f3f3f3] text-dash-muted",
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
        </DashboardInView>

        <DashboardInView delay={0.05}>
        <section className={panelClass}>
          <SectionHead
            title="Proyectos"
            href={
              canProyectos ? `${Routes.panel}?tab=proyectos` : undefined
            }
          />
          <p className="text-sm text-dash-muted mb-3">
            {stats.projectsCount} en total
          </p>
          {stats.projectsCount === 0 ? (
            <p className="text-sm text-dash-muted">
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
                    {canProyectos ? (
                      <Link
                        href={Routes.panelProject(project.id)}
                        className="text-base font-medium text-dash-ink hover:text-orange-600 dark:hover:text-orange-400 truncate"
                      >
                        {project.name}
                      </Link>
                    ) : (
                      <span className="text-base font-medium text-dash-ink truncate">
                        {project.name}
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium rounded-full px-2 py-0.5",
                        project.status
                          ? PROJECT_STATUS_CLASSES[project.status]
                          : "bg-[#f3f3f3] text-dash-muted",
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
        </DashboardInView>
      </div>

      {isAdminCompany && team.length > 0 ? (
        <DashboardInView>
        <section className={panelClass}>
          <SectionHead
            title="Equipo comercial"
            href={
              canVendedores
                ? `${Routes.panel}?tab=vendedores`
                : undefined
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-sm text-dash-muted border-b border-dash-line dark:border-[#2e2e2e]">
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
                    <td className="py-2 text-dash-ink">
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
        </DashboardInView>
      ) : null}

      <DashboardInView>
      <section className={panelClass}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-dash-ink">
              Créditos de extracción
            </h3>
            <p className="mt-1 text-sm text-dash-muted">
              {credits.loading
                ? "Consultando saldo…"
                : remainingQuota == null
                  ? "No hay un periodo de créditos activo."
                  : `${remainingQuota} disponibles de ${leadLimit ?? "—"} este mes.`}
            </p>
          </div>
          <Link
            href={Routes.panelCredits}
            className="inline-flex items-center justify-center rounded-full dash-grad-accent px-4 py-2 text-sm font-medium text-white hover:shadow-dash-accent-lift transition-colors shadow-dash-accent"
          >
            Ver créditos
          </Link>
        </div>
        {remainingQuota != null && leadLimit != null && leadLimit > 0 ? (
          <div className="mt-3 h-2 rounded-full bg-dash-surface-2 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full dashboard-bar-grow",
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
      </DashboardInView>

      <DashboardInView>
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
      </DashboardInView>

      {hasAdminRole ? (
        <div className="pt-1 flex justify-center">
          <Link
            href={Routes.panelAdmin}
            className="text-xs text-dash-muted underline decoration-dotted opacity-70 hover:opacity-100 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            Operaciones
          </Link>
        </div>
      ) : null}
    </div>
  );
}
