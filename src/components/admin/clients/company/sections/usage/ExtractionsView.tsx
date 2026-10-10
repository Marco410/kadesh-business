"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { formatDateShort } from "kadesh/utils/format-date";
import { ADMIN_PAGE_SIZE, SYNC_STATUS_FILTERS, type SyncStatusFilter } from "../../../../constants";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminStatTile,
  AdminStatusBadge,
  formatCredits,
  formatPersonName,
  surfaceClass,
} from "../../../../ui";
import type { AdminCompanyInsights } from "../../../clients-queries";
import { ADMIN_SYNC_LOGS_QUERY, type AdminSyncLogsResponse } from "../../../usage-queries";

function zoneLabel(row: { lat: number | null; lng: number | null; radius: number | null }) {
  if (row.lat == null || row.lng == null) return "—";
  const coords = `${row.lat.toFixed(3)}, ${row.lng.toFixed(3)}`;
  return row.radius != null ? `${coords} · ${row.radius} km` : coords;
}

/** Cada corrida de Extracción B2B (Google Maps o INEGI) de esta empresa. */
export default function ExtractionsView({
  companyId,
  insights,
}: {
  companyId: string;
  insights: AdminCompanyInsights | null;
}) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SyncStatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const where = useMemo(() => {
    const base = { company: { id: { equals: companyId } } };
    if (status === "failed") return { AND: [base, { success: { equals: false } }] };
    if (status === "ok") return { AND: [base, { success: { equals: true } }] };
    return base;
  }, [companyId, status]);

  const { data, loading, error } = useQuery<AdminSyncLogsResponse>(ADMIN_SYNC_LOGS_QUERY, {
    variables: { where, take: ADMIN_PAGE_SIZE, skip: (page - 1) * ADMIN_PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });
  const rows = data?.techLeadSyncLogs ?? [];
  const total = data?.techLeadSyncLogsCount ?? 0;
  const extraction = insights?.extraction;
  const leadsTotal = (extraction?.created ?? 0) + (extraction?.alreadyInDb ?? 0);
  const reusedPct = leadsTotal > 0 ? Math.round(((extraction?.alreadyInDb ?? 0) / leadsTotal) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      {extraction ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <AdminStatTile
            label={`Extracciones (${insights?.days ?? 30} días)`}
            value={formatCredits(extraction.runs)}
            hint={extraction.failed ? `${extraction.failed} con error` : "Sin errores"}
            tone={extraction.failed ? "warning" : "default"}
          />
          <AdminStatTile label="Leads nuevos" value={formatCredits(extraction.created)} hint="Se buscaron en Google o INEGI" />
          <AdminStatTile
            label="Desde la base"
            value={formatCredits(extraction.alreadyInDb)}
            hint="Ya existían: sin pagar API"
            tone={extraction.alreadyInDb ? "success" : "default"}
          />
          <AdminStatTile
            label="Ahorro"
            value={leadsTotal ? `${reusedPct}%` : "—"}
            hint="de los leads salieron de la base"
          />
        </div>
      ) : null}
      <AdminFilterChips
        label="Estado"
        options={[...SYNC_STATUS_FILTERS]}
        value={status}
        onChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
      />
      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Sin extracciones con ese filtro"
          description="Cada corrida de Extracción B2B queda registrada aquí."
        />
      ) : (
        <>
          <div className={`${surfaceClass} relative overflow-x-auto`}>
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="whitespace-nowrap border-b border-[#e8e8e8] text-xs uppercase tracking-wide text-[#616161] dark:border-[#333] dark:text-[#b0b0b0]">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Persona</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Zona</th>
                  <th className="px-4 py-3">Nuevos</th>
                  <th className="px-4 py-3">Desde la base</th>
                  <th className="px-4 py-3">Cupo</th>
                  <th className="px-4 py-3">Mensaje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                {rows.map((row) => {
                  const expanded = expandedId === row.id;
                  return (
                    <tr
                      key={row.id}
                      className={row.success ? undefined : "bg-red-500/[0.04] dark:bg-red-500/[0.06]"}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                        {formatDateShort(row.createdAt, true)}
                      </td>
                      <td className="px-4 py-3">
                        <AdminStatusBadge
                          label={row.success ? "OK" : "Falló"}
                          className={
                            row.success
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "bg-red-500/15 text-red-700 dark:text-red-300"
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-[#212121] dark:text-white">
                        {row.user ? formatPersonName(row.user.name, row.user.lastName) : "—"}
                      </td>
                      <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                        {row.category || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {zoneLabel(row)}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{row.created ?? 0}</td>
                      <td className="px-4 py-3 tabular-nums">{row.alreadyInDb ?? 0}</td>
                      <td className="px-4 py-3 text-xs tabular-nums text-[#9e9e9e]">
                        {row.syncedCount != null || row.leadLimit != null
                          ? `${row.syncedCount ?? "—"} / ${row.leadLimit ?? "—"}`
                          : "—"}
                      </td>
                      <td className="max-w-[260px] px-4 py-3 text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {row.message ? (
                          <button
                            type="button"
                            onClick={() => setExpandedId(expanded ? null : row.id)}
                            className={`text-left hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer ${expanded ? "" : "line-clamp-1"}`}
                          >
                            {row.message}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <AdminPagination
            totalCount={total}
            pageSize={ADMIN_PAGE_SIZE}
            currentPage={page}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
