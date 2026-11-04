"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { formatDate } from "kadesh/utils/format-date";
import { cn } from "kadesh/utils/cn";
import { AppChip } from "../activity/ActivityContext";
import {
  ACTIVITY_APP_FILTERS,
  activityAppValue,
  pageLabel,
  parseActivityAppSlug,
} from "../constants";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminSearchInput,
  AdminStatusBadge,
  adminRowClass,
  adminTableClass,
  adminTableWrapClass,
  adminTdClass,
  adminTheadClass,
  adminThClass,
} from "../ui";
import {
  ADMIN_ERROR_ISSUES_QUERY,
  ERROR_ISSUE_STATUS_LABELS,
  ERROR_RANGE_FILTERS,
  ERROR_STATUS_FILTERS,
  errorOriginLabel,
  parseErrorRange,
  parseErrorStatus,
  type AdminErrorIssue,
  type AdminErrorIssuesResponse,
} from "./app-errors-queries";
import ErrorIssueDrawer from "./ErrorIssueDrawer";

const STATUS_TONES: Record<string, string> = {
  open: "bg-red-500/15 text-red-700 dark:text-red-300",
  resolved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  ignored: "bg-dash-surface-2 text-dash-soft",
};

function StatusBadge({ issue }: { issue: AdminErrorIssue }) {
  return (
    <AdminStatusBadge
      label={issue.reopened ? "Reabierto" : ERROR_ISSUE_STATUS_LABELS[issue.status]}
      className={cn("px-2 py-0.5", STATUS_TONES[issue.status])}
    />
  );
}

/**
 * Bandeja de Errores: lo que le falla a la gente (servidor y navegador), agrupado por error.
 * Cada fila dice cuántas veces pasó, a cuántas personas, en qué app y pantalla, y si ya se
 * resolvió. Al tocarla se abre el detalle con las ocurrencias y las acciones.
 */
export default function AdminErrorsPanel() {
  const { searchParams, setParams } = useAdminNavigation();
  const statusSlug = parseErrorStatus(searchParams.get("estado"));
  const rangeSlug = parseErrorRange(searchParams.get("rango"));
  const appSlug = parseActivityAppSlug(searchParams.get("app"));
  const openFingerprint = searchParams.get("huella");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const variables = useMemo(
    () => ({
      input: {
        status: ERROR_STATUS_FILTERS.find((item) => item.value === statusSlug)?.api ?? "open",
        days: ERROR_RANGE_FILTERS.find((item) => item.value === rangeSlug)?.days ?? 7,
        app: activityAppValue(appSlug),
        search: debouncedSearch.trim() || null,
        take: 100,
      },
    }),
    [statusSlug, rangeSlug, appSlug, debouncedSearch],
  );

  const { data, loading, error, refetch } = useQuery<AdminErrorIssuesResponse>(
    ADMIN_ERROR_ISSUES_QUERY,
    { variables, fetchPolicy: "cache-and-network" },
  );
  const items = data?.adminErrorIssues.items ?? [];
  const openCount = data?.adminErrorIssues.openCount ?? null;
  const selected = items.find((item) => item.fingerprint === openFingerprint) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-dash-ink">Errores</h2>
        <p className="mt-1 text-sm text-dash-muted">
          Lo que le falla a la gente en Kadesh Pet, Negocios y la app, agrupado por error. Incluye
          errores del servidor y del navegador (sin conexión, pantallas caídas).
          {openCount != null ? ` ${openCount.toLocaleString("es-MX")} abiertos en el periodo.` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar mensaje, operación o pantalla"
        />
        <AdminFilterChips
          label="Estado"
          options={ERROR_STATUS_FILTERS.map(({ value, label }) => ({ value, label }))}
          value={statusSlug}
          onChange={(value) => setParams({ estado: value === "abiertos" ? null : value })}
        />
        <AdminFilterChips
          label="App"
          options={ACTIVITY_APP_FILTERS}
          value={appSlug}
          onChange={(value) => setParams({ app: value === "todas" ? null : value })}
        />
        <AdminFilterChips
          label="Periodo"
          options={ERROR_RANGE_FILTERS.map(({ value, label }) => ({ value, label }))}
          value={rangeSlug}
          onChange={(value) => setParams({ rango: value === "7d" ? null : value })}
        />
      </div>

      {error ? (
        <AdminErrorState message="No se pudieron cargar los errores." />
      ) : loading && !data ? (
        <AdminLoadingRows rows={6} />
      ) : items.length === 0 ? (
        <AdminEmptyState
          title={statusSlug === "abiertos" ? "Sin errores abiertos" : "Sin errores con ese filtro"}
          description="Cuando a alguien le falle algo, aparece aquí agrupado."
        />
      ) : (
        <div className={adminTableWrapClass}>
          <table className={adminTableClass}>
            <thead className={adminTheadClass}>
              <tr>
                <th className={adminThClass}>Error</th>
                <th className={cn(adminThClass, "hidden md:table-cell")}>Dónde</th>
                <th className={cn(adminThClass, "text-right")}>Veces</th>
                <th className={cn(adminThClass, "hidden text-right sm:table-cell")}>Personas</th>
                <th className={cn(adminThClass, "hidden lg:table-cell")}>Última vez</th>
                <th className={adminThClass}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((issue) => (
                <tr
                  key={issue.fingerprint}
                  className={cn(adminRowClass, "cursor-pointer")}
                  onClick={() => setParams({ huella: issue.fingerprint }, "push")}
                >
                  <td className={cn(adminTdClass, "max-w-[22rem]")}>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setParams({ huella: issue.fingerprint }, "push");
                      }}
                      className="block w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    >
                      <span className="block truncate font-medium text-dash-ink">{issue.title}</span>
                      {issue.message ? (
                        <span className="mt-0.5 line-clamp-2 text-xs text-dash-muted">{issue.message}</span>
                      ) : null}
                      <span className="mt-0.5 block text-xs text-dash-faint">{errorOriginLabel(issue)}</span>
                    </button>
                  </td>
                  <td className={cn(adminTdClass, "hidden md:table-cell")}>
                    <div className="flex flex-col items-start gap-1">
                      <AppChip app={issue.app} />
                      {issue.page ? (
                        <span className="text-xs text-dash-muted" title={issue.page}>
                          {pageLabel(issue.page) ?? issue.page}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className={cn(adminTdClass, "text-right tabular-nums text-dash-ink")}>
                    {issue.count.toLocaleString("es-MX")}
                  </td>
                  <td className={cn(adminTdClass, "hidden text-right tabular-nums text-dash-soft sm:table-cell")}>
                    {issue.people.toLocaleString("es-MX")}
                    {issue.anonymous ? (
                      <span className="block text-[11px] text-dash-faint">+{issue.anonymous} sin sesión</span>
                    ) : null}
                  </td>
                  <td className={cn(adminTdClass, "hidden text-dash-soft lg:table-cell")}>
                    {formatDate(issue.lastSeen)}
                  </td>
                  <td className={adminTdClass}>
                    <StatusBadge issue={issue} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ErrorIssueDrawer
        issue={selected}
        onClose={() => setParams({ huella: null })}
        onChanged={() => {
          // El error puede salir del filtro actual (p. ej. Abiertos): se cierra y se recarga.
          setParams({ huella: null });
          void refetch();
        }}
      />
    </div>
  );
}
