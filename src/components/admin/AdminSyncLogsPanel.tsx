"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { Routes } from "kadesh/core/routes";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  ADMIN_PAGE_SIZE,
  SYNC_LOG_STATUS_FILTERS,
  type SyncLogStatusFilter,
} from "./constants";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import {
  ADMIN_SYNC_LOGS_QUERY,
  type AdminSyncLogsResponse,
} from "./company-ops-queries";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  AdminStatusBadge,
  formatPersonName,
  surfaceClass,
} from "./ui";

function zoneLabel(row: {
  lat: number | null;
  lng: number | null;
  radius: number | null;
}) {
  if (row.lat == null || row.lng == null) return "—";
  const coords = `${row.lat.toFixed(3)}, ${row.lng.toFixed(3)}`;
  return row.radius != null ? `${coords} · ${row.radius} km` : coords;
}

export default function AdminSyncLogsPanel() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SyncLogStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const where = useMemo(() => {
    const parts: Record<string, unknown>[] = [];
    if (status === "failed") parts.push({ success: { equals: false } });
    if (status === "ok") parts.push({ success: { equals: true } });

    const q = debouncedSearch.trim();
    if (q) {
      parts.push({
        OR: [
          { message: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { company: { name: { contains: q, mode: "insensitive" } } },
          { user: { name: { contains: q, mode: "insensitive" } } },
          { user: { email: { contains: q, mode: "insensitive" } } },
        ],
      });
    }

    if (parts.length === 0) return {};
    if (parts.length === 1) return parts[0];
    return { AND: parts };
  }, [debouncedSearch, status]);

  const { data, loading, error } = useQuery<AdminSyncLogsResponse>(
    ADMIN_SYNC_LOGS_QUERY,
    {
      variables: {
        where,
        take: ADMIN_PAGE_SIZE,
        skip: (page - 1) * ADMIN_PAGE_SIZE,
      },
      fetchPolicy: "network-only",
    },
  );

  const rows = data?.techLeadSyncLogs ?? [];
  const totalCount = data?.techLeadSyncLogsCount ?? 0;

  const openCompany = (companyId: string) => {
    const params = new URLSearchParams({
      tab: "empresas",
      empresa: companyId,
      detalle: "sync",
    });
    router.replace(`${Routes.panelAdmin}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-col gap-4" data-tour="admin-sync-logs">
      <div>
        <h2 className="text-lg font-semibold text-[#212121] dark:text-white">
          Sync (todas las empresas)
        </h2>
        <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
          Concentrado de cada corrida de Extracción B2B. Filtra por fallos para
          revisar errores.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar empresa, mensaje, categoría o usuario"
        />
        <AdminFilterChips
          label="Estado"
          options={[...SYNC_LOG_STATUS_FILTERS]}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Sin logs con ese filtro"
          description="Cambia el estado o borra la búsqueda."
        />
      ) : (
        <>
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
            {totalCount} corrida{totalCount === 1 ? "" : "s"}
            {status === "failed" ? " con error" : ""}
            {status === "ok" ? " OK" : ""}.
          </p>
          <div className={`${surfaceClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f5f5f5] text-xs font-semibold uppercase tracking-wide text-[#616161] dark:bg-[#2a2a2a] dark:text-[#b0b0b0]">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Creados</th>
                    <th className="px-4 py-3">Ya en BD</th>
                    <th className="px-4 py-3">Asignados</th>
                    <th className="px-4 py-3">Cuota</th>
                    <th className="px-4 py-3">Zona</th>
                    <th className="px-4 py-3">Mensaje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8e8] dark:divide-[#333]">
                  {rows.map((row) => {
                    const isExpanded = expandedId === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={
                          row.success
                            ? undefined
                            : "bg-red-500/[0.04] dark:bg-red-500/[0.08]"
                        }
                      >
                        <td className="px-4 py-3 whitespace-nowrap align-top text-[#616161] dark:text-[#b0b0b0]">
                          {formatDateShort(row.createdAt, true)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <AdminStatusBadge
                            label={row.success ? "OK" : "Falló"}
                            className={
                              row.success
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : "bg-red-500/15 text-red-700 dark:text-red-300"
                            }
                          />
                        </td>
                        <td className="px-4 py-3 align-top">
                          {row.company ? (
                            <button
                              type="button"
                              onClick={() => openCompany(row.company!.id)}
                              className="min-h-10 text-left font-medium text-orange-600 hover:underline dark:text-orange-400"
                            >
                              {row.company.name}
                            </button>
                          ) : (
                            <span className="text-[#9e9e9e]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-[#212121] dark:text-white">
                          {row.user ? (
                            <div>
                              <p>
                                {formatPersonName(
                                  row.user.name,
                                  row.user.lastName,
                                )}
                              </p>
                              <p className="text-xs text-[#9e9e9e]">
                                {row.user.email ?? ""}
                              </p>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-[#616161] dark:text-[#b0b0b0]">
                          {row.category ?? "—"}
                        </td>
                        <td className="px-4 py-3 align-top tabular-nums">
                          {row.created ?? 0}
                        </td>
                        <td className="px-4 py-3 align-top tabular-nums">
                          {row.alreadyInDb ?? 0}
                        </td>
                        <td className="px-4 py-3 align-top tabular-nums">
                          {row.syncedLeadsCount ?? 0}
                          {(row.skippedLowRating ?? 0) > 0 ? (
                            <span className="mt-0.5 block text-[11px] text-[#9e9e9e]">
                              −{row.skippedLowRating} rating
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 align-top tabular-nums text-xs text-[#9e9e9e]">
                          {row.syncedCount != null || row.leadLimit != null
                            ? `${row.syncedCount ?? "—"} / ${row.leadLimit ?? "—"}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap text-xs text-[#9e9e9e]">
                          {zoneLabel(row)}
                        </td>
                        <td className="px-4 py-3 align-top max-w-[280px]">
                          {row.message ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : row.id)
                              }
                              className="min-h-10 w-full text-left text-xs text-[#616161] hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:text-white"
                              title={row.message}
                            >
                              <span
                                className={
                                  isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"
                                }
                              >
                                {row.message}
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs text-[#9e9e9e]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <AdminPagination
            currentPage={page}
            pageSize={ADMIN_PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
