"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { formatDate } from "kadesh/utils/format-date";
import {
  ADMIN_OVERVIEW_QUERY,
  type AdminOverviewResponse,
} from "./queries";
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
  AdminErrorState,
  AdminSectionCard,
  AdminStatTile,
  AdminStatusBadge,
  formatCredits,
  formatMoney,
  formatPersonName,
  surfaceClass,
} from "./ui";
import { cn } from "kadesh/utils/cn";
import { SUBSCRIPTION_STATUS } from "kadesh/constants/constans";

const SEVERITY_CLASS: Record<AdminAttentionItem["severity"], string> = {
  high: "bg-red-500/15 text-red-700 dark:text-red-300",
  medium: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  low: "bg-black/5 text-[#616161] dark:bg-white/10 dark:text-[#b0b0b0]",
};

/**
 * Cuántos leads del mes salieron de la base de Kadesh (ya existían) contra los que se tuvieron
 * que buscar. Reutilizar es lo que ahorra llamadas pagadas a Google Maps / INEGI.
 */
function SearchSavingsCard({
  reused,
  created,
  loading,
}: {
  reused: number;
  created: number;
  loading: boolean;
}) {
  const total = reused + created;
  const pct = total > 0 ? Math.round((reused / total) * 100) : 0;
  return (
    <AdminSectionCard
      title="Ahorro en búsquedas"
      description="Cuando un negocio ya está en Kadesh se le da al cliente desde la base, sin pagarle otra vez a Google Maps ni a INEGI."
    >
      {loading ? (
        <div className="h-16 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" aria-hidden />
      ) : total === 0 ? (
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          Todavía no hay extracciones este mes.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[#212121] dark:text-white">
            <span className="text-2xl font-bold tabular-nums">{pct}%</span>{" "}
            de los leads de este mes salieron de la base:{" "}
            <strong className="tabular-nums">{formatCredits(reused)}</strong> de{" "}
            <span className="tabular-nums">{formatCredits(total)}</span>.
          </p>
          <div
            role="img"
            aria-label={`${pct}% desde la base, ${100 - pct}% nuevos`}
            className="flex h-3 w-full overflow-hidden rounded-full bg-[#f0f0f0] dark:bg-[#2a2a2a]"
          >
            <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
            <div className="h-full bg-orange-400" style={{ width: `${100 - pct}%` }} />
          </div>
          <ul className="flex flex-col gap-1 text-xs text-[#616161] dark:text-[#b0b0b0] sm:flex-row sm:gap-4">
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-500" />
              Desde la base (sin pagar API): {formatCredits(reused)}
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="h-2 w-2 rounded-full bg-orange-400" />
              Nuevos (se buscaron en Google Maps o INEGI): {formatCredits(created)}
            </li>
          </ul>
        </div>
      )}
    </AdminSectionCard>
  );
}

/** KPIs del SaaS, lo que requiere atención y la actividad más reciente. */
function OpsSummary() {
  const { goTo, openCompany } = useAdminNavigation();
  const { data, loading, error } = useQuery<AdminOpsSummaryResponse>(ADMIN_OPS_SUMMARY_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  const feedInput = useMemo(() => ({ take: 8 }), []);
  const feed = useActivityFeed(feedInput);
  const summary = data?.adminOpsSummary;
  const statusCount = (key: string) =>
    summary?.statusCounts.find((s) => s.key === key)?.count ?? 0;
  const value = (n: number | undefined) => (loading && !summary ? "—" : formatCredits(n ?? 0));
  const mrr = summary?.mrr ?? [];

  if (error) {
    return <AdminErrorState message="No se pudieron cargar los indicadores de operación." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AdminStatTile
          label="Empresas activas"
          help={HELP.activeCompanies}
          value={value(statusCount(SUBSCRIPTION_STATUS.ACTIVE))}
          hint={
            summary
              ? `de ${formatCredits(summary.companiesTotal)} empresa${summary.companiesTotal === 1 ? "" : "s"}`
              : undefined
          }
          onClick={() => goTo(ADMIN_TABS.CLIENTS, { estado: SUBSCRIPTION_STATUS.ACTIVE })}
        />
        <AdminStatTile
          label="En prueba"
          help={HELP.trialCompanies}
          value={value(statusCount(SUBSCRIPTION_STATUS.TRIALING))}
          hint={
            summary?.trialsEndingSoon
              ? `${summary.trialsEndingSoon} vence${summary.trialsEndingSoon === 1 ? "" : "n"} en ≤3 días`
              : undefined
          }
          tone={summary?.trialsEndingSoon ? "warning" : "default"}
          onClick={() => goTo(ADMIN_TABS.CLIENTS, { estado: SUBSCRIPTION_STATUS.TRIALING })}
        />
        <AdminStatTile
          label="Pagos con problema"
          help={HELP.paymentIssues}
          value={value(summary?.paymentIssues)}
          hint="Vencidas o no pagadas"
          tone={summary?.paymentIssues ? "danger" : "default"}
          onClick={() => goTo(ADMIN_TABS.CLIENTS, { estado: SUBSCRIPTION_STATUS.PAST_DUE })}
        />
        <AdminStatTile
          label="MRR estimado"
          help={HELP.mrr}
          value={
            mrr.length === 0
              ? loading && !summary
                ? "—"
                : formatMoney(0, "MXN")
              : mrr.map((m) => formatMoney(m.amount, m.currency)).join(" · ")
          }
          hint="Planes activos, a mes"
        />
        <AdminStatTile
          label="Registros (7 días)"
          help={HELP.signups}
          value={value(summary?.newUsers7d)}
          hint={
            summary
              ? `${summary.newCompanies7d} empresa${summary.newCompanies7d === 1 ? " nueva" : "s nuevas"}`
              : undefined
          }
          onClick={() => goTo(ADMIN_TABS.CLIENTS, { vista: CLIENTS_VISTAS.PEOPLE })}
        />
        <AdminStatTile
          label="Con acceso (7 días)"
          help={HELP.activeUsers7d}
          value={value(summary?.activeUsers7d)}
          hint="Personas que entraron"
          onClick={() => goTo(ADMIN_TABS.CLIENTS, { vista: CLIENTS_VISTAS.PEOPLE })}
        />
        <AdminStatTile
          label="Extracciones (24 h)"
          help={HELP.extractions24h}
          value={value(summary?.syncs24h)}
          hint={summary?.failedSyncs24h ? `${summary.failedSyncs24h} con error` : "Sin errores"}
          tone={summary?.failedSyncs24h ? "warning" : "default"}
          onClick={() =>
            goTo(ADMIN_TABS.ACTIVITY, {
              tipo: "extraccion",
              error: summary?.failedSyncs24h ? "1" : null,
            })
          }
        />
        <AdminStatTile
          label="Créditos del mes"
          help={HELP.creditsMonth}
          value={value(summary?.creditsConsumedMonth)}
          hint={
            summary
              ? `${formatCredits(summary.aiCalls7d)} llamada${summary.aiCalls7d === 1 ? "" : "s"} a IA en 7 días`
              : "Extracción e IA"
          }
          onClick={() => goTo(ADMIN_TABS.ACTIVITY, { tipo: "ia" })}
        />
      </div>

      <SearchSavingsCard
        reused={summary?.leadsReusedMonth ?? 0}
        created={summary?.leadsCreatedMonth ?? 0}
        loading={loading && !summary}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <AdminSectionCard
          title="Requiere atención"
          description="Empresas con pagos, pruebas, créditos o errores que revisar."
          help={HELP.attention}
        >
          {loading && !summary ? (
            <div className="space-y-2" aria-hidden>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
              ))}
            </div>
          ) : (summary?.attention ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-[#616161] dark:text-[#b0b0b0]">
              Nada pendiente. Las empresas están al corriente.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {summary!.attention.map((item) => (
                <li key={`${item.companyId}-${item.reason}`}>
                  <button
                    type="button"
                    onClick={() => openCompany(item.companyId)}
                    className="flex w-full items-start justify-between gap-3 rounded-xl border border-[#e8e8e8] p-3 text-left transition-colors hover:border-orange-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-[#333] dark:hover:border-orange-500 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#212121] dark:text-white">
                        {item.companyName}
                      </p>
                      <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {item.detail ?? ""}
                        {item.at && !item.detail ? formatDate(item.at) : ""}
                      </p>
                    </div>
                    <AdminStatusBadge
                      label={ATTENTION_REASON_LABELS[item.reason] ?? item.reason}
                      className={cn("shrink-0", SEVERITY_CLASS[item.severity])}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          title="Actividad reciente"
          action={
            <button
              type="button"
              onClick={() => goTo(ADMIN_TABS.ACTIVITY)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline dark:text-orange-400 cursor-pointer"
            >
              Ver toda
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
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
            onOpenCompany={(companyId) => openCompany(companyId)}
            bare
          />
        </AdminSectionCard>
      </div>
    </div>
  );
}

export default function AdminOverview({
  onOpenTab,
  onReviewPlace,
  onReviewService,
}: {
  onOpenTab: (tab: AdminTab, vista?: string) => void;
  onReviewPlace: (placeId: string) => void;
  onReviewService: (serviceId: string) => void;
}) {
  const { data, loading, error } = useQuery<AdminOverviewResponse>(
    ADMIN_OVERVIEW_QUERY,
    {
      fetchPolicy: "network-only",
      variables: {
        pendingWhere: {
          claimStatus: { equals: PET_PLACE_CLAIM_STATUS.PENDING },
        },
        verifiedWhere: { verified: { equals: true } },
        pendingServiceWhere: {
          status: { equals: PET_PLACE_SERVICE_STATUS.PENDING },
        },
      },
    },
  );

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <OpsSummary />
        <AdminErrorState message="No se pudieron cargar las fichas por revisar." />
      </div>
    );
  }

  const pending = data?.pendingPetPlaces ?? [];

  return (
    <div className="flex flex-col gap-6">
      <OpsSummary />

      <section className={cn(surfaceClass, "p-4 sm:p-5")}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#212121] dark:text-white">
              Reclamos por revisar
            </h2>
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
              Alguien pidió la ficha. Confirma que es suya antes de verificarla.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenTab(ADMIN_TABS.PET_PLACES, "fichas")}
            className="hidden sm:inline-flex h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
          >
            Ver todas
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse"
              />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <p className="py-8 text-sm text-center text-[#616161] dark:text-[#b0b0b0]">
            No hay fichas en revisión. Las nuevas solicitudes aparecerán aquí.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pending.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => onReviewPlace(place.id)}
                  className="w-full rounded-xl border border-[#e8e8e8] dark:border-[#333] p-3 text-left hover:border-orange-300 dark:hover:border-orange-500 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#212121] dark:text-white truncate">
                        {place.name}
                      </p>
                      <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                        {[place.municipality, place.state]
                          .filter(Boolean)
                          .join(", ") || "Sin ubicación"}
                        {" · "}
                        {formatPersonName(place.user?.name, place.user?.lastName)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <AdminStatusBadge
                        label={
                          PET_PLACE_CLAIM_STATUS_LABELS[place.claimStatus ?? ""] ??
                          "Sin estado"
                        }
                        className={
                          PET_PLACE_CLAIM_STATUS_CLASSES[place.claimStatus ?? ""]
                        }
                      />
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        Revisar
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={cn(surfaceClass, "p-4 sm:p-5")}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#212121] dark:text-white">
              Servicios por aprobar
            </h2>
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
              Un dueño pidió un servicio que no estaba en el catálogo. Al
              aprobarlo, se marca en su ficha.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenTab(ADMIN_TABS.PET_PLACES, "servicios")}
            className="hidden sm:inline-flex h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
          >
            Ver todos
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse"
              />
            ))}
          </div>
        ) : (data?.pendingPetPlaceServices ?? []).length === 0 ? (
          <p className="py-8 text-sm text-center text-[#616161] dark:text-[#b0b0b0]">
            No hay servicios pendientes.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {(data?.pendingPetPlaceServices ?? []).map((service) => (
              <li key={service.id}>
                <button
                  type="button"
                  onClick={() => onReviewService(service.id)}
                  className="w-full rounded-xl border border-[#e8e8e8] dark:border-[#333] p-3 text-left hover:border-orange-300 dark:hover:border-orange-500 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#212121] dark:text-white truncate">
                        {service.name ?? "Servicio"}
                      </p>
                      <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                        {service.requestedFor?.name ?? "Sin clínica"}
                        {" · "}
                        {formatPersonName(
                          service.requestedBy?.name,
                          service.requestedBy?.lastName,
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <AdminStatusBadge
                        label={
                          PET_PLACE_SERVICE_STATUS_LABELS[service.status ?? ""] ??
                          "Pendiente"
                        }
                        className={
                          PET_PLACE_SERVICE_STATUS_CLASSES[service.status ?? ""]
                        }
                      />
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        Revisar
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
