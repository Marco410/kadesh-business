"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { formatDateShort } from "kadesh/utils/format-date";
import { ADMIN_PAGE_SIZE } from "../../../../constants";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  AdminPagination,
  AdminStatTile,
  AdminStatusBadge,
  formatCredits,
  formatMoney,
  formatPersonName,
  surfaceClass,
} from "../../../../ui";
import type { AdminCompanyInsights } from "../../../clients-queries";
import {
  ADMIN_COMPANY_QUOTATIONS_QUERY,
  type AdminCompanyQuotationsResponse,
} from "../../../crm-queries";
import { quotationStatusClass, quotationStatusLabel } from "../../format";

export default function QuotationsView({
  companyId,
  insights,
}: {
  companyId: string;
  insights: AdminCompanyInsights | null;
}) {
  const [page, setPage] = useState(1);
  const variables = useMemo(
    () => ({
      where: { company: { id: { equals: companyId } } },
      take: ADMIN_PAGE_SIZE,
      skip: (page - 1) * ADMIN_PAGE_SIZE,
    }),
    [companyId, page],
  );
  const { data, loading, error } = useQuery<AdminCompanyQuotationsResponse>(
    ADMIN_COMPANY_QUOTATIONS_QUERY,
    { variables, fetchPolicy: "cache-and-network" },
  );
  const rows = data?.saasQuotations ?? [];
  const total = data?.saasQuotationsCount ?? 0;
  const byStatus = new Map((insights?.quotationsByStatus ?? []).map((s) => [s.key, s]));
  const tile = (key: string, label: string) => {
    const s = byStatus.get(key);
    return (
      <AdminStatTile
        label={label}
        value={formatCredits(s?.count ?? 0)}
        hint={s?.amount ? formatMoney(s.amount, "MXN") : undefined}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tile("draft", "Borradores")}
        {tile("sent", "Enviadas")}
        {tile("accepted", "Aceptadas")}
        {tile("rejected", "Rechazadas")}
      </div>

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows rows={5} />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Sin cotizaciones"
          description="Cuando el equipo cree cotizaciones, aparecen aquí con su estado y monto."
        />
      ) : (
        <>
          <div className={`${surfaceClass} relative overflow-x-auto`}>
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-[#e8e8e8] text-xs uppercase tracking-wide text-[#616161] dark:border-[#333] dark:text-[#b0b0b0]">
                <tr>
                  <th className="px-4 py-3">Cotización</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Fechas</th>
                  <th className="px-4 py-3">Hizo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                {rows.map((q) => {
                  const owner = q.assignedSeller ?? q.createdBy;
                  return (
                    <tr key={q.id}>
                      <td className="px-4 py-3 font-medium text-[#212121] dark:text-white">
                        #{q.quotationNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                        {q.lead?.businessName ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <AdminStatusBadge
                          label={quotationStatusLabel(q.status)}
                          className={quotationStatusClass(q.status)}
                        />
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[#212121] dark:text-white">
                        {formatMoney(q.total, q.currency)}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#616161] dark:text-[#b0b0b0]">
                        Creada {formatDateShort(q.createdAt, false)}
                        {q.sentAt ? <span className="block">Enviada {formatDateShort(q.sentAt, false)}</span> : null}
                        {q.acceptedAt ? (
                          <span className="block">Aceptada {formatDateShort(q.acceptedAt, false)}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                        {owner ? formatPersonName(owner.name, owner.lastName) : "—"}
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
