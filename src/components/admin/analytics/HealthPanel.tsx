"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { formatDate, formatDateShort } from "kadesh/utils/format-date";
import { useUser } from "kadesh/utils/UserContext";
import { cn } from "kadesh/utils/cn";
import {
  ADMIN_PAGE_SIZE,
  COMPANY_OWNER_FILTERS,
  HEALTH_COMPONENTS,
  HEALTH_LEVELS,
  HEALTH_SIGNALS,
  HEALTH_SORT_OPTIONS,
  parseCompanyOwnerFilter,
  parseHealthSort,
} from "../constants";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { useUrlSearch } from "../hooks/useUrlSearch";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  AdminStatTile,
  formatPersonName,
  surfaceClass,
} from "../ui";
import { SubscriptionStatusBadge } from "../clients/AdminCompaniesList";
import {
  ADMIN_HEALTH_QUERY,
  type AdminCompanyHealth,
  type AdminHealthResponse,
} from "./analytics-queries";
import { HealthBadge, HealthSignals, HealthTrend } from "./HealthBadge";
import HowHealthWorks from "./HowHealthWorks";

/** Cada parte ocupa un ancho según sus puntos máximos: la fila completa son los 100 puntos. */
const PARTS_GRID = { gridTemplateColumns: HEALTH_COMPONENTS.map((part) => `${part.max}fr`).join(" ") };

/**
 * Barras chicas de las 5 partes de la salud (puntos de su máximo). En la tabla los nombres van una
 * sola vez en el encabezado.
 */
function ComponentBars({
  health,
  showLabels = true,
}: {
  health: AdminCompanyHealth;
  showLabels?: boolean;
}) {
  return (
    <div className="grid gap-1" style={PARTS_GRID} aria-label="Partes de la salud">
      {HEALTH_COMPONENTS.map((part) => {
        const points = health.components[part.key];
        return (
          <div key={part.key} title={`${part.label}: ${points} de ${part.max}`} className="min-w-0">
            <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0] dark:bg-[#2a2a2a]">
              <div
                className={cn(
                  "h-full rounded-full",
                  points / part.max >= 0.7
                    ? "bg-emerald-500"
                    : points / part.max >= 0.4
                      ? "bg-amber-500"
                      : "bg-red-500",
                )}
                style={{ width: `${Math.max((points / part.max) * 100, points > 0 ? 6 : 0)}%` }}
              />
            </div>
            {showLabels ? (
              <p className="mt-1 truncate text-[10px] text-[#9e9e9e]">{part.label}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function teamLine(health: AdminCompanyHealth) {
  const team = `${health.activeUsers} de ${health.teamSize} entraron`;
  const seen = health.lastSeenAt ? `último acceso ${formatDate(health.lastSeenAt)}` : "nadie ha entrado";
  return `${team} · ${seen}`;
}

export default function HealthPanel() {
  const { searchParams, setParams, openCompany } = useAdminNavigation();
  const search = useUrlSearch();
  const { user } = useUser();
  const level = HEALTH_LEVELS.find((item) => item.slug === searchParams.get("nivel")) ?? null;
  const signal = HEALTH_SIGNALS.find((item) => item.slug === searchParams.get("senal")) ?? null;
  const sort = parseHealthSort(searchParams.get("orden"));
  const owner = parseCompanyOwnerFilter(searchParams.get("cuentas"));
  const page = Math.max(1, Number(searchParams.get("pagina")) || 1);

  const { data, loading, error } = useQuery<AdminHealthResponse>(ADMIN_HEALTH_QUERY, {
    variables: {
      input: {
        search: search.query || null,
        label: level?.value ?? null,
        flag: signal?.value ?? null,
        sort,
        accountManagerId: owner === "mias" ? user?.id ?? null : null,
        take: ADMIN_PAGE_SIZE,
        skip: (page - 1) * ADMIN_PAGE_SIZE,
      },
    },
    fetchPolicy: "cache-and-network",
  });
  const result = data?.adminHealth;
  const rows = result?.items ?? [];
  const counts = useMemo(
    () => new Map((result?.counts ?? []).map((row) => [row.key, row.count])),
    [result?.counts],
  );
  const count = (key: string) => (result ? counts.get(key) ?? 0 : "—");

  const toggle = (param: "nivel" | "senal", slug: string, active: boolean) =>
    setParams({ [param]: active ? null : slug, pagina: null });

  if (error) return <AdminErrorState message={error.message} />;

  if (result && !result.ready) {
    return (
      <AdminEmptyState
        title="Todavía no hay datos para calcular la salud"
        description="La salud sale del resumen diario de uso, que se arma cada noche. Para llenar semanas pasadas corre pnpm usage:rollup en el back."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
        Salud de 0 a 100 de cada cuenta viva (activa, en prueba o con pago pendiente), con lo que
        hizo en las últimas 4 semanas
        {result?.computedThrough
          ? `, hasta el ${formatDateShort(`${result.computedThrough}T12:00:00`, false)}`
          : ""}
        . Sirve para decidir a quién llamar primero.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {HEALTH_LEVELS.map((item) => (
          <AdminStatTile
            key={item.slug}
            label={item.label}
            value={count(item.value)}
            tone={
              level?.slug === item.slug
                ? item.value === "risk"
                  ? "danger"
                  : item.value === "watch"
                    ? "warning"
                    : "success"
                : "default"
            }
            onClick={() => toggle("nivel", item.slug, level?.slug === item.slug)}
          />
        ))}
        {HEALTH_SIGNALS.map((item) => (
          <AdminStatTile
            key={item.slug}
            label={item.label}
            value={count(item.value)}
            hint={item.value === "churn_risk" ? "Pueden irse" : "Pueden comprar más"}
            tone={signal?.slug === item.slug ? (item.value === "churn_risk" ? "danger" : "success") : "default"}
            onClick={() => toggle("senal", item.slug, signal?.slug === item.slug)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search.value}
          onChange={search.setValue}
          placeholder="Buscar empresa, correo o alguien de su equipo"
        />
        <AdminFilterChips
          label="Nivel"
          options={[{ value: "todas", label: "Todos" }, ...HEALTH_LEVELS.map((l) => ({ value: l.slug, label: l.label }))]}
          value={level?.slug ?? "todas"}
          onChange={(value) => setParams({ nivel: value === "todas" ? null : value, pagina: null })}
        />
        <AdminFilterChips
          label="Señal"
          options={[{ value: "todas", label: "Todas" }, ...HEALTH_SIGNALS.map((s) => ({ value: s.slug, label: s.label }))]}
          value={signal?.slug ?? "todas"}
          onChange={(value) => setParams({ senal: value === "todas" ? null : value, pagina: null })}
        />
        <AdminFilterChips
          label="Orden"
          options={[...HEALTH_SORT_OPTIONS]}
          value={sort}
          onChange={(value) => setParams({ orden: value === "risk" ? null : value, pagina: null })}
        />
        <AdminFilterChips
          label="Cuentas"
          options={[...COMPANY_OWNER_FILTERS]}
          value={owner}
          onChange={(value) => setParams({ cuentas: value === "todas" ? null : value, pagina: null })}
        />
      </div>

      {loading && rows.length === 0 ? (
        <AdminLoadingRows />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No hay cuentas con estos filtros"
          description={
            owner === "mias"
              ? "No tienes cuentas asignadas con estos filtros."
              : "Prueba otro nivel o quita la señal."
          }
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3 lg:hidden">
            {rows.map((health) => (
              <li key={health.companyId}>
                <button
                  type="button"
                  onClick={() => openCompany(health.companyId)}
                  className={cn(surfaceClass, "w-full p-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#212121] dark:text-white">{health.companyName}</p>
                      <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {health.planName ?? "Sin plan"}
                      </p>
                    </div>
                    <HealthBadge score={health.score} label={health.label} showLabel />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <SubscriptionStatusBadge status={health.subscriptionStatus} />
                    <HealthTrend trend={health.trend} changePct={health.changePct} />
                  </div>
                  {health.flags.length ? (
                    <div className="mt-3">
                      <HealthSignals flags={health.flags} />
                    </div>
                  ) : null}
                  <div className="mt-3">
                    <ComponentBars health={health} />
                  </div>
                  <p className="mt-2 text-xs text-[#9e9e9e]">{teamLine(health)}</p>
                </button>
              </li>
            ))}
          </ul>

          <div className={cn(surfaceClass, "relative hidden overflow-x-auto lg:block")}>
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="border-b border-[#e8e8e8] text-xs uppercase tracking-wide text-[#616161] dark:border-[#333] dark:text-[#b0b0b0]">
                <tr>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Salud</th>
                  <th className="px-4 py-3">Señales</th>
                  <th className="w-80 px-4 py-3">
                    <span className="sr-only">Partes de la salud</span>
                    <span aria-hidden className="grid gap-1 text-[10px] normal-case tracking-normal" style={PARTS_GRID}>
                      {HEALTH_COMPONENTS.map((part) => (
                        <span key={part.key} className="truncate" title={part.hint}>
                          {part.label}
                        </span>
                      ))}
                    </span>
                  </th>
                  <th className="px-4 py-3">Equipo</th>
                  <th className="w-10 px-2 py-3">
                    <span className="sr-only">Abrir</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                {rows.map((health) => (
                  <tr
                    key={health.companyId}
                    onClick={() => openCompany(health.companyId)}
                    className="cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCompany(health.companyId);
                        }}
                        className="rounded text-left font-semibold text-[#212121] hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:text-white dark:hover:text-orange-400 cursor-pointer"
                      >
                        {health.companyName}
                      </button>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                          {health.planName ?? "Sin plan"}
                        </span>
                        <SubscriptionStatusBadge status={health.subscriptionStatus} />
                      </div>
                      {health.accountManager ? (
                        <p className="mt-1 text-xs text-[#9e9e9e]">
                          Cuenta de {formatPersonName(health.accountManager.name, health.accountManager.lastName)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <HealthBadge score={health.score} label={health.label} showLabel />
                      <div className="mt-1">
                        <HealthTrend trend={health.trend} changePct={health.changePct} />
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-3 align-top">
                      {health.flags.length ? (
                        <HealthSignals flags={health.flags} />
                      ) : (
                        <span className="text-xs text-[#9e9e9e]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <ComponentBars health={health} showLabels={false} />
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-[#616161] dark:text-[#b0b0b0]">
                      <p className="tabular-nums">
                        {health.activeUsers} de {health.teamSize} entraron
                      </p>
                      <p className="mt-0.5 text-[#9e9e9e]">
                        {health.lastSeenAt ? formatDate(health.lastSeenAt) : "Nadie ha entrado"}
                      </p>
                    </td>
                    <td className="px-2 py-3 align-top text-[#9e9e9e]">
                      <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            totalCount={result?.total ?? 0}
            pageSize={ADMIN_PAGE_SIZE}
            currentPage={page}
            onPageChange={(next) => setParams({ pagina: next > 1 ? String(next) : null })}
          />
        </>
      )}

      <HowHealthWorks />
    </div>
  );
}
