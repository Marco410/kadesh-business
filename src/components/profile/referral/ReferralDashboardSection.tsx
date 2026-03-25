"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, Chart01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import {
  REFERRED_USERS_QUERY,
  REFERRAL_COMMISSIONS_QUERY,
  type ReferredUsersResponse,
  type ReferralCommissionsResponse,
  type CommissionStatus,
  type CommissionType,
} from "./queries";
import { USER_COMPANY_CATEGORIES_QUERY, UserCompanyCategoriesResponse, UserCompanyCategoriesVariables } from "../sales/queries";
import { ReferralLinkSection } from "kadesh/components/home";

type SubTab = "users" | "commissions";

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount) + " MXN";
}

/**
 * Fecha legible en es-MX. Evita mostrar epoch (31 dic 1969) cuando el backend envía null/0/vacío.
 */
function formatDate(
  dateStr: string | null | undefined,
  options?: { emptyLabel?: string },
): string {
  const empty = options?.emptyLabel ?? "—";
  if (dateStr == null || String(dateStr).trim() === "") return empty;
  const d = new Date(dateStr);
  const t = d.getTime();
  if (Number.isNaN(t) || t <= 0) return empty;
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_CONFIG: Record<CommissionStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  PAID: {
    label: "Pagado",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  },
};

const TYPE_CONFIG: Record<CommissionType, { className: string }> = {
  UPFRONT: { className: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400" },
  RECURRING: {
    className: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  },
};

interface SummaryCardProps {
  label: string;
  amount: number;
  currency: string;
  highlight?: boolean;
  color?: "amber" | "emerald";
  className?: string;
}

function SummaryCard({ label, amount, currency, highlight, color, className }: SummaryCardProps) {
  const borderAndBg = highlight
    ? "border-orange-200/60 dark:border-orange-500/20 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-[#1e1e1e]"
    : color === "amber"
      ? "border-amber-200/60 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5"
      : color === "emerald"
        ? "border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5"
        : "border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e]";

  const amountColor = highlight
    ? "text-orange-600 dark:text-orange-400"
    : color === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : color === "emerald"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-[#212121] dark:text-white";

  return (
    <div className={`rounded-xl border p-4 ${borderAndBg} ${className ?? ""}`}>
      <p className="text-xs text-[#616161] dark:text-[#9e9e9e] mb-1">{label}</p>
      <p className={`text-lg font-bold ${amountColor}`}>{formatCurrency(amount, currency)}</p>
    </div>
  );
}

function ReferredUsersTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);

  const { data, loading } = useQuery<ReferredUsersResponse>(REFERRED_USERS_QUERY, {
    variables: { where: { referredBy: { id: { equals: userId } } } },
    skip: !userId,
  });

  const users = data?.users ?? [];
  const totalPages = Math.max(1, Math.ceil(users.length / REFERRED_USERS_PAGE_SIZE));
  const paginatedUsers = users.slice(
    (page - 1) * REFERRED_USERS_PAGE_SIZE,
    page * REFERRED_USERS_PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [userId]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mb-4">
          <HugeiconsIcon icon={UserAdd01Icon} size={26} />
        </div>
        <p className="font-semibold text-[#212121] dark:text-white">Sin referidos aún</p>
        <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e] max-w-xs">
          Comparte tu enlace de referido para comenzar a ganar comisiones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#616161] dark:text-[#9e9e9e]">
        <span className="font-medium text-[#424242] dark:text-[#e0e0e0]">{users.length}</span>{" "}
        {users.length === 1 ? "usuario registrado" : "usuarios registrados"} con tu código
        <span className="text-[#9e9e9e] dark:text-[#616161]"> · más recientes primero</span>
      </p>
      <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto_auto] gap-4 px-5 py-2.5 border-b border-[#f0f0f0] dark:border-[#2a2a2a] bg-[#fafafa] dark:bg-[#161616] text-[10px] font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#616161]">
          <span>Referido</span>
          <span className="text-right sm:text-left whitespace-nowrap">Último acceso</span>
          <span className="text-right sm:text-left whitespace-nowrap">Registro</span>
        </div>
        <ul className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
          {paginatedUsers.map((user) => (
            <li key={user.id}>
              <div className="flex flex-col gap-3 px-5 py-4 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#9e9e9e]">
                    <HugeiconsIcon icon={UserIcon} size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#212121] dark:text-white truncate">
                      {user.name?.trim() || "Sin nombre"}
                    </p>
                    <p className="text-xs text-[#616161] dark:text-[#9e9e9e] truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex sm:contents flex-wrap gap-4 pl-[52px] sm:pl-0">
                  <div className="min-w-[8.5rem]">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#9e9e9e] dark:text-[#616161] sm:hidden">
                      Último acceso
                    </p>
                    <p className="text-sm text-[#424242] dark:text-[#e0e0e0] tabular-nums">
                      {formatDate(user.lastLoginAt, { emptyLabel: "Sin ingresos aún" })}
                    </p>
                  </div>
                  <div className="min-w-[8.5rem]">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#9e9e9e] dark:text-[#616161] sm:hidden">
                      Registro
                    </p>
                    <p className="text-sm text-[#424242] dark:text-[#e0e0e0] tabular-nums">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {totalPages > 1 && (
          <div className="flex flex-col gap-2 border-t border-[#f0f0f0] dark:border-[#2a2a2a] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#9e9e9e] dark:text-[#616161]">
              {(page - 1) * REFERRED_USERS_PAGE_SIZE + 1}–
              {Math.min(page * REFERRED_USERS_PAGE_SIZE, users.length)} de {users.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] px-3 py-1.5 text-xs font-medium text-[#424242] dark:text-[#bdbdbd] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              <span className="px-2 text-xs text-[#616161] dark:text-[#9e9e9e]">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] px-3 py-1.5 text-xs font-medium text-[#424242] dark:text-[#bdbdbd] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const PAGE_SIZE = 15;
const REFERRED_USERS_PAGE_SIZE = 10;

function CommissionsTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);

  const { data, loading } = useQuery<ReferralCommissionsResponse>(REFERRAL_COMMISSIONS_QUERY, {
    variables: { where: { referrer: { id: { equals: userId } } }, orderBy: [{ createdAt: "desc" }] },
    skip: !userId,
  });

  const commissions = data?.saasReferralCommissions ?? [];
  const currency = commissions[0]?.currency ?? "mxn";
  const totalPages = Math.max(1, Math.ceil(commissions.length / PAGE_SIZE));
  const paginated = commissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  type TotalsKey = "pending" | "paid" | "cancelled" | "total";
  const totals = commissions.reduce<Record<TotalsKey, number>>(
    (acc, c) => {
      const key = c.status.toLowerCase() as "pending" | "paid" | "cancelled";
      acc[key] += c.amount;
      acc.total += c.amount;
      return acc;
    },
    { pending: 0, paid: 0, cancelled: 0, total: 0 },
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!commissions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mb-4">
          <HugeiconsIcon icon={Chart01Icon} size={26} />
        </div>
        <p className="font-semibold text-[#212121] dark:text-white">Sin comisiones aún</p>
        <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e] max-w-xs">
          Tus comisiones aparecerán aquí una vez que tus referidos se suscriban.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SummaryCard
          label="Total generado"
          amount={totals.total}
          currency={currency}
          highlight
        />
        <SummaryCard
          label="Pendiente de pago"
          amount={totals.pending}
          currency={currency}
          color="amber"
        />
        <SummaryCard
          label="Pagado"
          amount={totals.paid}
          currency={currency}
          color="emerald"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f0f0f0] dark:border-[#2a2a2a] bg-[#fafafa] dark:bg-[#161616]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#616161]">
                  Referido
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#616161]">
                  Plan
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#616161]">
                  Tipo
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#616161]">
                  Estado
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#616161] hidden sm:table-cell">
                  Período
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#616161] hidden md:table-cell">
                  Fecha de creación
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#616161]">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
              {paginated.map((commission) => {
                const statusCfg = STATUS_CONFIG[commission.status] ?? STATUS_CONFIG.PENDING;
                const typeCfg = TYPE_CONFIG[commission.type] ?? TYPE_CONFIG.RECURRING;
                const typeLabel =
                  commission.type === "UPFRONT"
                    ? "Primer pago"
                    : `Período ${commission.periodIndex}`;
                const periodRange =
                  commission.periodStart || commission.periodEnd
                    ? `${commission.periodStart ? formatDate(commission.periodStart) : "—"} → ${commission.periodEnd ? formatDate(commission.periodEnd) : "—"}`
                    : "—";

                return (
                  <tr key={commission.id} className="hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-5 py-3.5">
                      {commission.referredUser.name} {commission.referredUser.lastName}
                    </td>
                    <td className="px-5 py-3.5">
                      {commission.plan.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeCfg.className}`}>
                        {typeLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#616161] dark:text-[#9e9e9e] hidden sm:table-cell whitespace-nowrap">
                      {periodRange}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#616161] dark:text-[#9e9e9e] hidden md:table-cell whitespace-nowrap">
                      {formatDate(commission.createdAt ?? "")}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-[#212121] dark:text-white whitespace-nowrap">
                      {formatCurrency(commission.amount, commission.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#f0f0f0] dark:border-[#2a2a2a] px-5 py-3.5">
            <p className="text-xs text-[#9e9e9e] dark:text-[#616161]">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, commissions.length)} de{" "}
              {commissions.length} comisiones
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] px-3 py-1.5 text-xs font-medium text-[#424242] dark:text-[#bdbdbd] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "…" ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-xs text-[#9e9e9e]">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p as number)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        page === p
                          ? "bg-orange-500 text-white shadow-sm"
                          : "border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#424242] dark:text-[#bdbdbd] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] px-3 py-1.5 text-xs font-medium text-[#424242] dark:text-[#bdbdbd] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ReferralDashboardSectionProps {
  userId: string;
}

export default function ReferralDashboardSection({ userId }: ReferralDashboardSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("users");
  const subTabs: { key: SubTab; label: string; icon: typeof UserIcon }[] = [
    { key: "users", label: "Mis referidos", icon: UserIcon },
    { key: "commissions", label: "Mis comisiones", icon: Chart01Icon },
  ];

  const { data: userData } = useQuery<
      UserCompanyCategoriesResponse,
      UserCompanyCategoriesVariables
    >(USER_COMPANY_CATEGORIES_QUERY, {
      variables: { where: { id: userId } },
      skip: !userId,
    });

  return (
    <div className="flex flex-col gap-5">
      <ReferralLinkSection
        userId={userId}
        referralCode={userData?.user?.referralCode ?? ""}
        bank={userData?.user?.bank}
        clabe={userData?.user?.clabe}
        cardNumber={userData?.user?.cardNumber}
      />

      <div
        className="flex w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-1 gap-1 shadow-sm"
        role="tablist"
        aria-label="Vista de referidos"
      >
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeSubTab === tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 min-w-0 ${
              activeSubTab === tab.key
                ? "bg-orange-500 text-white shadow-sm"
                : "text-[#616161] dark:text-[#9e9e9e] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
            }`}
          >
            <HugeiconsIcon icon={tab.icon} size={16} className="shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>


      {activeSubTab === "users" ? (
        <ReferredUsersTab userId={userId} />
      ) : (
        <CommissionsTab userId={userId} />
      )}
    </div>
  );
}
