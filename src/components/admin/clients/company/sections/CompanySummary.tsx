"use client";

import { useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { PipelineBars, WeeklyBars } from "kadesh/components/panel/dashboard";
import { cn } from "kadesh/utils/cn";
import { formatDateShort } from "kadesh/utils/format-date";
import ActivityTimeline from "../../../activity/ActivityTimeline";
import { useActivityFeed } from "../../../activity/useActivityFeed";
import { CLIENT_SECTIONS } from "../../../constants";
import {
  AdminErrorState,
  AdminSectionCard,
  AdminStatTile,
  formatCredits,
} from "../../../ui";
import type { AdminCompanyInsights, AdminCompanyProfile } from "../../clients-queries";
import {
  daysSince,
  daysUntil,
  pipelineLabel,
  sortByPipeline,
  weeklyBuckets,
} from "../format";

type Alert = { tone: "danger" | "warning"; text: string };

/** Lo que el admin tiene que ver primero al abrir una empresa. */
function buildAlerts(company: AdminCompanyProfile, insights: AdminCompanyInsights | null): Alert[] {
  const alerts: Alert[] = [];
  const sub = company.subscriptions[0];
  if (sub?.status === "past_due") alerts.push({ tone: "danger", text: "El pago está vencido." });
  if (sub?.status === "unpaid") alerts.push({ tone: "danger", text: "La suscripción no está pagada." });
  if (sub?.status === "trialing") {
    const left = daysUntil(sub.currentPeriodEnd);
    if (left != null && left < 0) {
      alerts.push({
        tone: "danger",
        text: `La prueba terminó el ${formatDateShort(sub.currentPeriodEnd, false)} y no ha pagado.`,
      });
    } else if (left != null && left <= 3) {
      alerts.push({
        tone: "warning",
        text: `La prueba vence en ${left} día${left === 1 ? "" : "s"}.`,
      });
    }
  }
  if (!sub) alerts.push({ tone: "warning", text: "No tiene suscripción." });

  const period = company.creditPeriods[0];
  const total =
    (period?.planAllowance ?? sub?.planLeadLimit ?? 0) +
    (period?.bonusAllowance ?? company.purchasedBonusCredits ?? 0);
  if (total > 0 && (period?.used ?? 0) >= total) {
    alerts.push({ tone: "warning", text: "Ya no le quedan créditos este mes." });
  }

  if (insights) {
    if (insights.extraction.failed > 0) {
      alerts.push({
        tone: "warning",
        text: `${insights.extraction.failed} extracción${insights.extraction.failed === 1 ? "" : "es"} con error en ${insights.days} días.`,
      });
    }
    if (insights.checkoutFailures > 0) {
      alerts.push({
        tone: "warning",
        text: `${insights.checkoutFailures} intento${insights.checkoutFailures === 1 ? "" : "s"} de pago sin completar.`,
      });
    }
    if (insights.whatsapp.failed > 0) {
      alerts.push({
        tone: "warning",
        text: `${insights.whatsapp.failed} WhatsApp no enviado${insights.whatsapp.failed === 1 ? "" : "s"}.`,
      });
    }
    if (insights.calendarLastError) {
      alerts.push({ tone: "warning", text: `Google Calendar: ${insights.calendarLastError}` });
    }
    if (insights.followUpsOverdue > 0) {
      alerts.push({
        tone: "warning",
        text: `${insights.followUpsOverdue} seguimiento${insights.followUpsOverdue === 1 ? "" : "s"} vencido${insights.followUpsOverdue === 1 ? "" : "s"}.`,
      });
    }
    const idle = daysSince(insights.lastActivityAt);
    if (idle == null) {
      alerts.push({ tone: "warning", text: "Nadie del equipo ha hecho nada todavía." });
    } else if (idle >= 14) {
      alerts.push({ tone: "warning", text: `Sin actividad desde hace ${idle} días.` });
    }
  }
  return alerts;
}

export default function CompanySummary({
  company,
  insights,
  insightsError,
  onOpenSection,
}: {
  company: AdminCompanyProfile;
  insights: AdminCompanyInsights | null;
  insightsError: boolean;
  onOpenSection: (section: string) => void;
}) {
  const alerts = useMemo(() => buildAlerts(company, insights), [company, insights]);
  const feedInput = useMemo(() => ({ companyId: company.id, take: 8 }), [company.id]);
  const feed = useActivityFeed(feedInput);

  const pipelineBars = useMemo(
    () =>
      sortByPipeline(insights?.pipeline ?? []).map((row) => ({
        status: row.key,
        label: pipelineLabel(row.key),
        count: row.count,
        value: 0,
      })),
    [insights?.pipeline],
  );
  // Últimas 4 semanas completas: con 30 días la primera barra quedaba de 2 días.
  const creditWeeks = useMemo(
    () => weeklyBuckets((insights?.creditsByDay ?? []).slice(-28)),
    [insights?.creditsByDay],
  );
  const creditsSpent = (insights?.creditsByDay ?? []).reduce((sum, d) => sum + d.value, 0);
  const activities = (insights?.activitiesByType ?? []).reduce((sum, r) => sum + r.count, 0);
  const quotations = (insights?.quotationsByStatus ?? []).reduce((sum, r) => sum + r.count, 0);
  const days = insights?.days ?? 30;

  return (
    <div className="flex flex-col gap-4">
      <AdminSectionCard title="Alertas">
        {alerts.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
            Todo en orden: plan al corriente y con actividad reciente.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {alerts.map((alert) => (
              <li
                key={alert.text}
                className={cn(
                  "flex items-start gap-2 rounded-xl px-3 py-2 text-sm",
                  alert.tone === "danger"
                    ? "bg-red-500/10 text-red-800 dark:text-red-300"
                    : "bg-amber-500/10 text-amber-900 dark:text-amber-300",
                )}
              >
                <HugeiconsIcon icon={Alert02Icon} size={16} className="mt-0.5 shrink-0" />
                {alert.text}
              </li>
            ))}
          </ul>
        )}
      </AdminSectionCard>

      {insightsError ? (
        <AdminErrorState message="No se pudieron cargar las métricas de uso." />
      ) : (
        <AdminSectionCard
          title={`Uso en los últimos ${days} días`}
          description="Toca un número para ver el detalle."
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <AdminStatTile
              label="Leads"
              value={insights ? formatCredits(insights.leadsTotal) : "—"}
              hint={insights?.leadsWithoutOwner ? `${insights.leadsWithoutOwner} sin vendedor` : undefined}
              onClick={() => onOpenSection(CLIENT_SECTIONS.CRM)}
            />
            <AdminStatTile
              label="Extracciones"
              value={insights ? formatCredits(insights.extraction.runs) : "—"}
              hint={insights ? `${formatCredits(insights.extraction.created)} leads nuevos` : undefined}
              tone={insights?.extraction.failed ? "warning" : "default"}
              onClick={() => onOpenSection(CLIENT_SECTIONS.USAGE)}
            />
            <AdminStatTile
              label="Créditos gastados"
              value={insights ? formatCredits(creditsSpent) : "—"}
              onClick={() => onOpenSection(CLIENT_SECTIONS.USAGE)}
            />
            <AdminStatTile
              label="Llamadas a IA"
              value={insights ? formatCredits(insights.ai.calls) : "—"}
              hint={insights?.ai.credits ? `${formatCredits(insights.ai.credits)} créditos` : undefined}
              onClick={() => onOpenSection(CLIENT_SECTIONS.USAGE)}
            />
            <AdminStatTile
              label="Actividades CRM"
              value={insights ? formatCredits(activities) : "—"}
              hint={
                insights?.followUpsPending
                  ? `${insights.followUpsPending} seguimientos pendientes`
                  : undefined
              }
              onClick={() => onOpenSection(CLIENT_SECTIONS.CRM)}
            />
            <AdminStatTile
              label="Cotizaciones"
              value={insights ? formatCredits(quotations) : "—"}
              onClick={() => onOpenSection(CLIENT_SECTIONS.CRM)}
            />
            <AdminStatTile
              label="WhatsApp enviados"
              value={insights ? formatCredits(insights.whatsapp.outbound) : "—"}
              hint={insights?.whatsapp.inbound ? `${formatCredits(insights.whatsapp.inbound)} recibidos` : undefined}
              onClick={() => onOpenSection(CLIENT_SECTIONS.INTEGRATIONS)}
            />
            <AdminStatTile
              label="Equipo activo"
              value={
                insights
                  ? `${insights.team.filter((m) => m.lastActivityAt).length} / ${insights.team.length}`
                  : "—"
              }
              hint="con actividad en el periodo"
              onClick={() => onOpenSection(CLIENT_SECTIONS.TEAM)}
            />
          </div>
        </AdminSectionCard>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AdminSectionCard title="Pipeline" description="Leads de esta empresa por etapa.">
          <PipelineBars bars={pipelineBars} />
        </AdminSectionCard>
        <AdminSectionCard
          title="Créditos gastados por semana"
          description="Últimas 4 semanas · extracción + IA."
        >
          <WeeklyBars
            bars={creditWeeks}
            ariaLabel="Créditos gastados por semana"
            unitLabel="créditos"
          />
        </AdminSectionCard>
      </div>

      <AdminSectionCard
        title="Actividad reciente"
        action={
          <button
            type="button"
            onClick={() => onOpenSection(CLIENT_SECTIONS.ACTIVITY)}
            className="text-sm font-semibold text-orange-600 hover:underline dark:text-orange-400 cursor-pointer"
          >
            Ver toda
          </button>
        }
      >
        <ActivityTimeline
          items={feed.items}
          loading={feed.loading}
          error={feed.error}
          hasMore={false}
          loadingMore={false}
          onLoadMore={feed.loadMore}
          showCompany={false}
          bare
        />
      </AdminSectionCard>
    </div>
  );
}
