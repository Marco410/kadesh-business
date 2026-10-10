"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { formatDateShort } from "kadesh/utils/format-date";
import { ADMIN_PAGE_SIZE, CREDIT_LEDGER_TYPE_LABELS } from "../../../../constants";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  AdminPagination,
  AdminProgressBar,
  AdminSectionCard,
  formatCredits,
  surfaceClass,
} from "../../../../ui";
import {
  ADMIN_COMPANY_CREDIT_PERIODS_QUERY,
  ADMIN_COMPANY_LEDGER_QUERY,
  type AdminCompanyCreditPeriodsResponse,
  type AdminCompanyLedgerResponse,
} from "../../../usage-queries";
import { monthLabel } from "../../format";

/** Cupo y gasto por mes, y cada movimiento de créditos (altas, recargas, gasto sync/IA). */
export default function CreditsView({ companyId }: { companyId: string }) {
  const [page, setPage] = useState(1);
  const companyWhere = useMemo(
    () => ({ company: { id: { equals: companyId } } }),
    [companyId],
  );

  const periods = useQuery<AdminCompanyCreditPeriodsResponse>(
    ADMIN_COMPANY_CREDIT_PERIODS_QUERY,
    { variables: { where: companyWhere }, fetchPolicy: "cache-and-network" },
  );
  const ledger = useQuery<AdminCompanyLedgerResponse>(ADMIN_COMPANY_LEDGER_QUERY, {
    variables: {
      where: companyWhere,
      take: ADMIN_PAGE_SIZE,
      skip: (page - 1) * ADMIN_PAGE_SIZE,
    },
    fetchPolicy: "cache-and-network",
  });

  const periodRows = periods.data?.saasCompanyCreditPeriods ?? [];
  const rows = ledger.data?.saasCompanyCreditLedgers ?? [];
  const total = ledger.data?.saasCompanyCreditLedgersCount ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <AdminSectionCard title="Por mes" description="Cupo del plan + extra, y cuánto se usó.">
        {periods.error ? (
          <AdminErrorState message={periods.error.message} />
        ) : periods.loading && periodRows.length === 0 ? (
          <AdminLoadingRows rows={3} />
        ) : periodRows.length === 0 ? (
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
            Todavía no hay meses registrados. El primero se abre cuando usan o consultan créditos.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {periodRows.map((p) => {
              const plan = p.planAllowance ?? 0;
              const bonus = p.bonusAllowance ?? 0;
              const used = p.used ?? 0;
              return (
                <li key={p.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium capitalize text-[#212121] dark:text-white">
                      {monthLabel(p.year, p.month)}
                    </p>
                    <p className="text-xs tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                      {formatCredits(used)} usados de {formatCredits(plan + bonus)}
                      {bonus ? ` (${formatCredits(bonus)} extra)` : ""}
                    </p>
                  </div>
                  <div className="mt-1.5">
                    <AdminProgressBar
                      value={used}
                      max={plan + bonus}
                      label={`Créditos usados en ${monthLabel(p.year, p.month)}`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminSectionCard>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[#212121] dark:text-white">Movimientos</h3>
        {ledger.error ? (
          <AdminErrorState message={ledger.error.message} />
        ) : ledger.loading && rows.length === 0 ? (
          <AdminLoadingRows />
        ) : rows.length === 0 ? (
          <AdminEmptyState
            title="Sin movimientos de créditos"
            description="Cuando gasten o recarguen, aparecen aquí."
          />
        ) : (
          <>
            <div className={`${surfaceClass} relative overflow-x-auto`}>
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-[#e8e8e8] text-xs uppercase tracking-wide text-[#616161] dark:border-[#333] dark:text-[#b0b0b0]">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Monto</th>
                    <th className="px-4 py-3">Saldo</th>
                    <th className="px-4 py-3">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                        {formatDateShort(row.createdAt, true)}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#212121] dark:text-white">
                        {CREDIT_LEDGER_TYPE_LABELS[row.type] ?? row.type}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold tabular-nums ${
                          row.amount < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {row.amount > 0 ? "+" : ""}
                        {formatCredits(row.amount)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[#212121] dark:text-white">
                        {row.balanceAfter != null ? formatCredits(row.balanceAfter) : "—"}
                      </td>
                      <td className="max-w-[280px] truncate px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                        {row.notes ?? "—"}
                      </td>
                    </tr>
                  ))}
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
    </div>
  );
}
