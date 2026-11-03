"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowRight01Icon,
  Building06Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CreditCardIcon,
  Search01Icon,
  Stethoscope02Icon,
  Task01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Reveal, greetingFor } from "kadesh/components/app-shell";
import { formatDate } from "kadesh/utils/format-date";
import { useIsClient } from "kadesh/utils/useIsClient";
import { useUser } from "kadesh/utils/UserContext";
import { cn } from "kadesh/utils/cn";
import { SUBSCRIPTION_STATUS } from "kadesh/constants/constans";
import { ADMIN_OVERVIEW_QUERY, type AdminOverviewResponse } from "./queries";
import {
  ADMIN_TABS,
  ATTENTION_REASON_LABELS,
  CLIENTS_VISTAS,
  PET_PLACE_CLAIM_STATUS,
  PET_PLACE_CLAIM_STATUS_CLASSES,
  PET_PLACE_CLAIM_STATUS_LABELS,
  PET_PLACE_SERVICE_STATUS,
  PET_PLACE_SERVICE_STATUS_CLASSES,
  PET_PLACE_SERVICE_STATUS_LABELS,
  type AdminTab,
} from "./constants";
import ActivityTimeline from "./activity/ActivityTimeline";
import { HELP } from "./analytics/help";
import {
  ADMIN_OPS_SUMMARY_QUERY,
  type AdminAttentionItem,
  type AdminOpsSummaryResponse,
} from "./activity/activity-queries";
import { useActivityFeed } from "./activity/useActivityFeed";
import { useAdminNavigation } from "./hooks/useAdminNavigation";
import {
  AdminButton,
  AdminErrorState,
  AdminSectionCard,
  AdminStatTile,
  AdminStatusBadge,
  formatCredits,
  formatMoney,
  formatPersonName,
} from "./ui";

const SEVERITY_ICON_CLASS: Record<AdminAttentionItem["severity"], string> = {
  high: "text-red-600 dark:text-red-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-dash-muted",
};

/** Cuántas filas de "Requiere atención" se ven antes de "Ver más". */
const ATTENTION_PREVIEW = 5;

const rowButton =
  "flex w-full min-h-12 cursor-pointer items-center gap-3 rounded-[14px] bg-dash-surface-2 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-dash-surface-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";

function SkeletonRows({ count, height = "h-12" }: { count: number; height?: string }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("dash-shimmer rounded-[14px]", height)} />
      ))}
    </div>
  );
}

function LinkButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-full px-3 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-500/10"
    >
      {label}
      <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
    </button>
  );
}

/**
 * Cuántos leads del mes salieron de la base de Kadesh (ya existían) contra los que se tuvieron
 * que buscar. Reutilizar es lo que ahorra llamadas pagadas a Google Maps / INEGI.
 */
function SearchSavingsCard({
  reused,
  created,
  loading,
  index,
}: {
  reused: number;
  created: number;
  loading: boolean;
  index: number;
}) {
  const total = reused + created;
  const pct = total > 0 ? Math.round((reused / total) * 100) : 0;
  return (
    <AdminSectionCard
      index={index}
      title="Ahorro en búsquedas"
      description="Negocios que ya estaban en Kadesh: se entregan desde la base, sin pagarle otra vez a Google Maps ni a INEGI."
    >
      {loading ? (
        <SkeletonRows count={1} height="h-20" />
      ) : total === 0 ? (
        <p className="text-sm text-dash-muted">Todavía no hay extracciones este mes.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-dash-soft">
            <span className="mr-1 block text-[2.25rem] font-bold leading-none tracking-[-0.045em] tabular-nums text-dash-ink">
              {pct}%
            </span>
            de los leads del mes salieron de la base:{" "}
            <strong className="tabular-nums text-dash-ink">{formatCredits(reused)}</strong> de{" "}
            <span className="tabular-nums">{formatCredits(total)}</span>.
          </p>
          <div
            role="img"
            aria-label={`${pct}% desde la base, ${100 - pct}% nuevos`}
            className="flex h-3 w-full gap-1 overflow-hidden"
          >
            <div className="dashboard-bar-grow h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
            <div className="dash-hatch h-full flex-1 rounded-full bg-orange-50 text-orange-300 dark:bg-orange-500/10 dark:text-orange-500/50" />
          </div>
          <ul className="flex flex-col gap-1.5 text-[13px] text-dash-muted">
            <li className="flex items-center gap-2">
              <span aria-hidden className="size-2 rounded-full bg-green-500" />
              Desde la base (sin pagar API): <strong className="tabular-nums text-dash-ink">{formatCredits(reused)}</strong>
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="size-2 rounded-full bg-orange-400" />
              Nuevos (Google Maps o INEGI): <strong className="tabular-nums text-dash-ink">{formatCredits(created)}</strong>
            </li>
          </ul>
        </div>
      )}
    </AdminSectionCard>
  );
}

/** Tarjeta de saludo: cómo va todo en una oración y atajos (estilo del Resumen de ICARM). */
function GreetingCard({
  summary,
  loading,
  activeCompanies,
  attentionCount,
  pendingPlaces,
  pendingServices,
  onOpenTab,
}: {
  summary: AdminOpsSummaryResponse["adminOpsSummary"] | undefined;
  loading: boolean;
  activeCompanies: number;
  attentionCount: number;
  pendingPlaces: number | null;
  pendingServices: number | null;
  onOpenTab: (tab: AdminTab, vista?: string) => void;
}) {
  const { user } = useUser();
  const mounted = useIsClient();
  const { goTo } = useAdminNavigation();
  const name = user?.name?.split(" ")[0] ?? "";
  const greeting = mounted ? greetingFor(new Date()) : "Hola";

  return (
    <Reveal
      as="section"
      className="relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-dash-line bg-dash-surface bg-[radial-gradient(60%_120%_at_100%_0%,rgba(247,148,94,0.13),transparent_60%)] p-6 shadow-dash xl:p-8"
    >
      <h2 className="text-[clamp(1.6rem,1.2rem+1.6vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.04em] text-dash-ink">
        {greeting}
        {name ? `, ${name}` : ""}.
      </h2>
      <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-dash-soft">
        {loading && !summary ? (
          "Cargando cómo va Kadesh…"
        ) : (
          <>
            <strong className="font-semibold tabular-nums text-dash-ink">{formatCredits(activeCompanies)}</strong>{" "}
            empresa{activeCompanies === 1 ? "" : "s"} activa{activeCompanies === 1 ? "" : "s"},{" "}
            <strong className="font-semibold tabular-nums text-dash-ink">{formatCredits(summary?.newUsers7d ?? 0)}</strong>{" "}
            registros en 7 días y{" "}
            <strong className="font-semibold tabular-nums text-dash-ink">{formatCredits(summary?.syncs24h ?? 0)}</strong>{" "}
            extracciones en 24 h.{" "}
            {attentionCount > 0 ? (
              <span className="font-semibold text-red-700 dark:text-red-400">
                {attentionCount} {attentionCount === 1 ? "cosa necesita" : "cosas necesitan"} atención.
              </span>
            ) : (
              <span className="font-semibold text-green-700 dark:text-green-400">Todo en orden.</span>
            )}
          </>
        )}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <AdminButton variant="dark" icon={Search01Icon} onClick={() => goTo(ADMIN_TABS.CLIENTS)}>
          Buscar cliente
        </AdminButton>
        <AdminButton variant="outline" onClick={() => onOpenTab(ADMIN_TABS.PET_PLACES)}>
          Kadesh Pet
        </AdminButton>
      </div>

      <div className="mt-auto pt-6">
        <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-dash-muted">Esperan revisión</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onOpenTab(ADMIN_TABS.PET_PLACES, "fichas")}
            className="flex cursor-pointer flex-col items-start rounded-[14px] bg-dash-surface-2 px-3.5 py-3 text-left transition-colors hover:bg-dash-surface-3"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-dash-muted">Fichas Pet</span>
            <span className="mt-0.5 text-[22px] font-bold leading-none tabular-nums text-dash-ink">{pendingPlaces ?? "—"}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenTab(ADMIN_TABS.PET_PLACES, "servicios")}
            className="flex cursor-pointer flex-col items-start rounded-[14px] bg-dash-surface-2 px-3.5 py-3 text-left transition-colors hover:bg-dash-surface-3"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-dash-muted">Servicios</span>
            <span className="mt-0.5 text-[22px] font-bold leading-none tabular-nums text-dash-ink">{pendingServices ?? "—"}</span>
          </button>
          <button
            type="button"
            onClick={() => goTo(ADMIN_TABS.CLIENTS, { estado: SUBSCRIPTION_STATUS.TRIALING })}
            className={cn(
              "flex cursor-pointer flex-col items-start rounded-[14px] px-3.5 py-3 text-left transition-colors",
              summary?.trialsEndingSoon
                ? "bg-dash-ink text-dash-on-ink hover:opacity-90"
                : "bg-dash-surface-2 hover:bg-dash-surface-3",
            )}
          >
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.06em]",
                summary?.trialsEndingSoon ? "opacity-70" : "text-dash-muted",
              )}
            >
              Pruebas por vencer
            </span>
            <span className="mt-0.5 text-[22px] font-bold leading-none tabular-nums">
              {summary ? summary.trialsEndingSoon : "—"}
            </span>
          </button>
        </div>
      </div>
    </Reveal>
  );
}

function AttentionCard({
  items,
  loading,
}: {
  items: AdminAttentionItem[];
  loading: boolean;
}) {
  const { openCompany } = useAdminNavigation();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, ATTENTION_PREVIEW);

  return (
    <AdminSectionCard
      index={1}
      title="Requiere atención"
      description="Pagos, pruebas, créditos, errores y riesgo de baja."
      help={HELP.attention}
    >
      {loading ? (
        <SkeletonRows count={4} />
      ) : items.length === 0 ? (
        <p className="flex items-center gap-2 py-2 text-sm font-semibold text-green-700 dark:text-green-400">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
          Todo en orden. Las empresas están al corriente.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {visible.map((item) => (
              <li key={`${item.companyId}-${item.reason}`}>
                <button type="button" onClick={() => openCompany(item.companyId)} className={rowButton}>
                  <HugeiconsIcon icon={Alert02Icon} size={18} className={cn("shrink-0", SEVERITY_ICON_CLASS[item.severity])} />
                  <span className="min-w-0 flex-1 leading-snug">
                    <span className="font-semibold text-dash-ink">{item.companyName}</span>
                    <span className="text-dash-soft">
                      {" · "}
                      {ATTENTION_REASON_LABELS[item.reason] ?? item.reason}
                    </span>
                    {item.detail || item.at ? (
                      <span className="mt-0.5 block truncate text-[13px] text-dash-muted">
                        {item.detail ?? (item.at ? formatDate(item.at) : "")}
                      </span>
                    ) : null}
                  </span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="shrink-0 text-dash-faint" />
                </button>
              </li>
            ))}
          </ul>
          {items.length > ATTENTION_PREVIEW ? (
            <div className="mt-2">
              <LinkButton
                label={expanded ? "Ver menos" : `Ver ${items.length - ATTENTION_PREVIEW} más`}
                onClick={() => setExpanded((value) => !value)}
              />
            </div>
          ) : null}
        </>
      )}
    </AdminSectionCard>
  );
}

/** Inicio de Operaciones: saludo, lo que requiere atención, KPIs, actividad y colas de Kadesh Pet. */
export default function AdminOverview({
  onOpenTab,
  onReviewPlace,
  onReviewService,
}: {
  onOpenTab: (tab: AdminTab, vista?: string) => void;
  onReviewPlace: (placeId: string) => void;
  onReviewService: (serviceId: string) => void;
}) {
  const { goTo, openCompany } = useAdminNavigation();
  const { data: opsData, loading: opsLoading, error: opsError } = useQuery<AdminOpsSummaryResponse>(
    ADMIN_OPS_SUMMARY_QUERY,
    { fetchPolicy: "cache-and-network" },
  );
  const { data, loading, error } = useQuery<AdminOverviewResponse>(ADMIN_OVERVIEW_QUERY, {
    fetchPolicy: "network-only",
    variables: {
      pendingWhere: { claimStatus: { equals: PET_PLACE_CLAIM_STATUS.PENDING } },
      verifiedWhere: { verified: { equals: true } },
      pendingServiceWhere: { status: { equals: PET_PLACE_SERVICE_STATUS.PENDING } },
    },
  });
  const feedInput = useMemo(() => ({ take: 8 }), []);
  const feed = useActivityFeed(feedInput);

  const summary = opsData?.adminOpsSummary;
  const opsPending = opsLoading && !summary;
  const statusCount = (key: string) => summary?.statusCounts.find((s) => s.key === key)?.count ?? 0;
  const num = (n: number | undefined) => (opsPending ? "—" : (n ?? 0));
  const mrr = summary?.mrr ?? [];
  const attention = summary?.attention ?? [];
  const activeCompanies = statusCount(SUBSCRIPTION_STATUS.ACTIVE);
  const pendingPlaces = data?.pendingPetPlaces ?? [];
  const pendingServices = data?.pendingPetPlaceServices ?? [];

  const mrrValue =
    opsPending ? "—" : mrr.length === 0 ? 0 : mrr.length === 1 ? mrr[0].amount : mrr.map((m) => formatMoney(m.amount, m.currency)).join(" · ");
  const mrrCurrency = mrr[0]?.currency ?? "MXN";

  return (
    <div className="flex flex-col gap-4">
      {opsError ? <AdminErrorState message="No se pudieron cargar los indicadores de operación." /> : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <GreetingCard
          summary={summary}
          loading={opsLoading}
          activeCompanies={activeCompanies}
          attentionCount={attention.length}
          pendingPlaces={data ? (data.pendingPlaces ?? 0) : null}
          pendingServices={data ? (data.pendingServices ?? 0) : null}
          onOpenTab={onOpenTab}
        />
        <AttentionCard items={attention} loading={opsPending} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Reveal index={2} className="h-full">
          <AdminStatTile
            variant="dark"
            icon={Building06Icon}
            label="Empresas activas"
            help={HELP.activeCompanies}
            value={num(activeCompanies)}
            hint={summary ? `de ${formatCredits(summary.companiesTotal)} empresa${summary.companiesTotal === 1 ? "" : "s"}` : undefined}
            onClick={() => goTo(ADMIN_TABS.CLIENTS, { estado: SUBSCRIPTION_STATUS.ACTIVE })}
          />
        </Reveal>
        <Reveal index={3} className="h-full">
          <AdminStatTile
            variant="tint"
            icon={CreditCardIcon}
            label="MRR estimado"
            help={HELP.mrr}
            value={mrrValue}
            formatValue={(n) => formatMoney(n, mrrCurrency)}
            hint="Planes activos, a mes"
          />
        </Reveal>
        <Reveal index={4} className="h-full">
          <AdminStatTile
            icon={UserGroupIcon}
            label="Registros · 7 días"
            help={HELP.signups}
            value={num(summary?.newUsers7d)}
            hint={summary ? `${summary.newCompanies7d} empresa${summary.newCompanies7d === 1 ? " nueva" : "s nuevas"}` : undefined}
            onClick={() => goTo(ADMIN_TABS.CLIENTS, { vista: CLIENTS_VISTAS.PEOPLE })}
          />
        </Reveal>
        <Reveal index={5} className="h-full">
          <AdminStatTile
            icon={Clock01Icon}
            label="Extracciones · 24 h"
            help={HELP.extractions24h}
            value={num(summary?.syncs24h)}
            tone={summary?.failedSyncs24h ? "warning" : "default"}
            hint={summary?.failedSyncs24h ? `${summary.failedSyncs24h} con error` : "Sin errores"}
            onClick={() =>
              goTo(ADMIN_TABS.ACTIVITY, { tipo: "extraccion", error: summary?.failedSyncs24h ? "1" : null })
            }
          />
        </Reveal>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Reveal index={6} className="h-full">
          <AdminStatTile
            label="En prueba"
            help={HELP.trialCompanies}
            value={num(statusCount(SUBSCRIPTION_STATUS.TRIALING))}
            tone={summary?.trialsEndingSoon ? "warning" : "default"}
            hint={
              summary?.trialsEndingSoon
                ? `${summary.trialsEndingSoon} vence${summary.trialsEndingSoon === 1 ? "" : "n"} en ≤3 días`
                : undefined
            }
            onClick={() => goTo(ADMIN_TABS.CLIENTS, { estado: SUBSCRIPTION_STATUS.TRIALING })}
          />
        </Reveal>
        <Reveal index={7} className="h-full">
          <AdminStatTile
            label="Pagos con problema"
            help={HELP.paymentIssues}
            value={num(summary?.paymentIssues)}
            tone={summary?.paymentIssues ? "danger" : "default"}
            hint="Vencidas o no pagadas"
            onClick={() => goTo(ADMIN_TABS.CLIENTS, { estado: SUBSCRIPTION_STATUS.PAST_DUE })}
          />
        </Reveal>
        <Reveal index={8} className="h-full">
          <AdminStatTile
            label="Con acceso · 7 días"
            help={HELP.activeUsers7d}
            value={num(summary?.activeUsers7d)}
            hint="Personas que entraron"
            onClick={() => goTo(ADMIN_TABS.CLIENTS, { vista: CLIENTS_VISTAS.PEOPLE })}
          />
        </Reveal>
        <Reveal index={8} className="h-full">
          <AdminStatTile
            label="Créditos del mes"
            help={HELP.creditsMonth}
            value={num(summary?.creditsConsumedMonth)}
            hint={
              summary
                ? `${formatCredits(summary.aiCalls7d)} llamada${summary.aiCalls7d === 1 ? "" : "s"} a IA en 7 días`
                : "Extracción e IA"
            }
            onClick={() => goTo(ADMIN_TABS.ACTIVITY, { tipo: "ia" })}
          />
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:items-start">
        <AdminSectionCard
          index={2}
          title="Actividad reciente"
          action={<LinkButton label="Ver toda" onClick={() => goTo(ADMIN_TABS.ACTIVITY)} />}
        >
          <ActivityTimeline
            items={feed.items}
            loading={feed.loading}
            error={feed.error}
            hasMore={false}
            loadingMore={false}
            onLoadMore={feed.loadMore}
            onOpenCompany={(companyId) => openCompany(companyId)}
            bare
          />
        </AdminSectionCard>
        <SearchSavingsCard
          index={3}
          reused={summary?.leadsReusedMonth ?? 0}
          created={summary?.leadsCreatedMonth ?? 0}
          loading={opsPending}
        />
      </div>

      {error ? <AdminErrorState message="No se pudieron cargar las fichas por revisar." /> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <AdminSectionCard
          index={4}
          title="Reclamos por revisar"
          description="Alguien pidió una ficha de Kadesh Pet. Confirma que es suya antes de verificarla."
          action={<LinkButton label="Ver todas" onClick={() => onOpenTab(ADMIN_TABS.PET_PLACES, "fichas")} />}
        >
          {loading ? (
            <SkeletonRows count={3} height="h-16" />
          ) : pendingPlaces.length === 0 ? (
            <p className="py-4 text-sm text-dash-muted">No hay fichas en revisión. Las nuevas solicitudes aparecerán aquí.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pendingPlaces.map((place) => (
                <li key={place.id}>
                  <button type="button" onClick={() => onReviewPlace(place.id)} className={rowButton}>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-dash-surface text-orange-700 dark:text-orange-300">
                      <HugeiconsIcon icon={Stethoscope02Icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-dash-ink">{place.name}</span>
                      <span className="mt-0.5 block truncate text-[13px] text-dash-muted">
                        {[place.municipality, place.state].filter(Boolean).join(", ") || "Sin ubicación"}
                        {" · "}
                        {formatPersonName(place.user?.name, place.user?.lastName)}
                      </span>
                    </span>
                    <AdminStatusBadge
                      label={PET_PLACE_CLAIM_STATUS_LABELS[place.claimStatus ?? ""] ?? "Sin estado"}
                      className={PET_PLACE_CLAIM_STATUS_CLASSES[place.claimStatus ?? ""]}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          index={5}
          title="Servicios por aprobar"
          description="Un dueño pidió un servicio que no estaba en el catálogo. Al aprobarlo se marca en su ficha."
          action={<LinkButton label="Ver todos" onClick={() => onOpenTab(ADMIN_TABS.PET_PLACES, "servicios")} />}
        >
          {loading ? (
            <SkeletonRows count={3} height="h-16" />
          ) : pendingServices.length === 0 ? (
            <p className="py-4 text-sm text-dash-muted">No hay servicios pendientes.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pendingServices.map((service) => (
                <li key={service.id}>
                  <button type="button" onClick={() => onReviewService(service.id)} className={rowButton}>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-dash-surface text-orange-700 dark:text-orange-300">
                      <HugeiconsIcon icon={Task01Icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-dash-ink">{service.name ?? "Servicio"}</span>
                      <span className="mt-0.5 block truncate text-[13px] text-dash-muted">
                        {service.requestedFor?.name ?? "Sin clínica"}
                        {" · "}
                        {formatPersonName(service.requestedBy?.name, service.requestedBy?.lastName)}
                      </span>
                    </span>
                    <AdminStatusBadge
                      label={PET_PLACE_SERVICE_STATUS_LABELS[service.status ?? ""] ?? "Pendiente"}
                      className={PET_PLACE_SERVICE_STATUS_CLASSES[service.status ?? ""]}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AdminSectionCard>
      </div>
    </div>
  );
}
