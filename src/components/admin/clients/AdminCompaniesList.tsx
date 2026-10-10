"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  SUBSCRIPTION_STATUS_CLASSES,
  SUBSCRIPTION_STATUS_OPTIONS,
} from "kadesh/constants/constans";
import { formatDate, formatDateShort } from "kadesh/utils/format-date";
import {
  ADMIN_PAGE_SIZE,
  COMPANY_SORT_OPTIONS,
  COMPANY_STATUS_FILTERS,
  parseCompanySort,
  parseCompanyStatusFilter,
} from "../constants";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { useUrlSearch } from "../hooks/useUrlSearch";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminProgressBar,
  AdminSearchInput,
  AdminStatusBadge,
  formatCredits,
  formatPersonName,
  surfaceClass,
} from "../ui";
import {
  ADMIN_COMPANIES_LIST_QUERY,
  type AdminCompaniesListResponse,
  type AdminCompanyListItem,
} from "./clients-queries";

export function subscriptionStatusLabel(status: string | null | undefined) {
  if (!status) return "Sin plan";
  return SUBSCRIPTION_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function SubscriptionStatusBadge({ status }: { status: string | null | undefined }) {
  return (
    <AdminStatusBadge
      label={subscriptionStatusLabel(status)}
      className={
        (status && SUBSCRIPTION_STATUS_CLASSES[status]) ??
        "bg-[#e0e0e0] text-[#616161] dark:bg-[#3a3a3a] dark:text-[#b0b0b0]"
      }
    />
  );
}

function periodHint(company: AdminCompanyListItem) {
  if (company.trialEndsAt) return `Prueba hasta ${formatDateShort(company.trialEndsAt, false)}`;
  if (company.currentPeriodEnd) return `Renueva ${formatDateShort(company.currentPeriodEnd, false)}`;
  return null;
}

function CreditsCell({ company }: { company: AdminCompanyListItem }) {
  const total = company.creditsPlan + company.creditsBonus;
  return (
    <div className="min-w-[9rem]">
      <p className="text-sm tabular-nums text-[#212121] dark:text-white">
        {formatCredits(company.creditsRemaining)}
        <span className="text-[#9e9e9e]"> disp. de {formatCredits(total)}</span>
      </p>
      <div className="mt-1.5">
        <AdminProgressBar
          value={company.creditsUsed}
          max={total}
          label={`Créditos usados de ${company.name}`}
        />
      </div>
    </div>
  );
}

export default function AdminCompaniesList() {
  const { searchParams, setParams } = useAdminNavigation();
  const search = useUrlSearch();
  const status = parseCompanyStatusFilter(searchParams.get("estado"));
  const sort = parseCompanySort(searchParams.get("orden"));
  const page = Math.max(1, Number(searchParams.get("pagina")) || 1);

  const { data, loading, error } = useQuery<AdminCompaniesListResponse>(
    ADMIN_COMPANIES_LIST_QUERY,
    {
      variables: {
        input: {
          search: search.query || null,
          status,
          sort,
          take: ADMIN_PAGE_SIZE,
          skip: (page - 1) * ADMIN_PAGE_SIZE,
        },
      },
      fetchPolicy: "cache-and-network",
    },
  );

  const rows = data?.adminCompanies.items ?? [];
  const total = data?.adminCompanies.total ?? 0;
  const statusOptions = useMemo(() => {
    const counts = new Map(
      (data?.adminCompanies.statusCounts ?? []).map((c) => [c.key, c.count]),
    );
    return COMPANY_STATUS_FILTERS.map((option) => {
      const count = counts.get(option.value);
      return {
        value: option.value,
        label: count ? `${option.label} · ${count}` : option.label,
      };
    });
  }, [data?.adminCompanies.statusCounts]);

  // Entra al 360 conservando filtros y página en la URL: "atrás" vuelve igual.
  const openCompany = (id: string) =>
    setParams({ empresa: id, detalle: null, sub: null, persona: null }, "push");

  return (
    <div className="flex flex-col gap-4" data-tour="admin-clientes">
      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search.value}
          onChange={search.setValue}
          placeholder="Buscar empresa, correo o alguien de su equipo"
        />
        <AdminFilterChips
          label="Estado"
          options={statusOptions}
          value={status}
          onChange={(value) =>
            setParams({ estado: value === "all" ? null : value, pagina: null })
          }
        />
        <AdminFilterChips
          label="Orden"
          options={[...COMPANY_SORT_OPTIONS]}
          value={sort}
          onChange={(value) =>
            setParams({ orden: value === "recent" ? null : value, pagina: null })
          }
        />
      </div>

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No hay empresas que coincidan"
          description="Prueba otro estado o busca por el correo de alguien del equipo."
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3 md:hidden">
            {rows.map((company) => (
              <li key={company.id}>
                <button
                  type="button"
                  onClick={() => openCompany(company.id)}
                  className={`${surfaceClass} w-full p-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#212121] dark:text-white">
                        {company.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {company.owner
                          ? formatPersonName(company.owner.name, company.owner.lastName)
                          : "Sin equipo"}
                        {company.owner?.email ? ` · ${company.owner.email}` : ""}
                      </p>
                    </div>
                    <SubscriptionStatusBadge status={company.subscriptionStatus} />
                  </div>
                  <div className="mt-3">
                    <CreditsCell company={company} />
                  </div>
                  <p className="mt-3 text-xs text-[#616161] dark:text-[#b0b0b0]">
                    {company.planName ?? "Sin plan"} · {company.usersCount} en el equipo ·{" "}
                    {formatCredits(company.leadsCount)} leads
                  </p>
                  <p className="mt-1 text-xs text-[#9e9e9e]">
                    {company.lastLoginAt
                      ? `Último acceso: ${formatDate(company.lastLoginAt)}`
                      : "Nadie ha entrado"}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          <div className={`${surfaceClass} relative hidden overflow-x-auto md:block`}>
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-[#e8e8e8] text-xs uppercase tracking-wide text-[#616161] dark:border-[#333] dark:text-[#b0b0b0]">
                <tr>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Créditos del mes</th>
                  <th className="px-4 py-3">Equipo</th>
                  <th className="px-4 py-3">Leads</th>
                  <th className="px-4 py-3">Último acceso</th>
                  <th className="w-10 px-2 py-3">
                    <span className="sr-only">Abrir</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                {rows.map((company) => (
                  <tr
                    key={company.id}
                    onClick={() => openCompany(company.id)}
                    className="cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCompany(company.id);
                        }}
                        className="text-left font-semibold text-[#212121] hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded dark:text-white dark:hover:text-orange-400 cursor-pointer"
                      >
                        {company.name}
                      </button>
                      {company.isTest ? (
                        <AdminStatusBadge
                          label="Prueba interna"
                          className="ml-2 bg-black/5 px-2 py-0.5 text-[#616161] dark:bg-white/10 dark:text-[#b0b0b0]"
                        />
                      ) : null}
                      <p className="mt-0.5 text-xs text-[#9e9e9e]">
                        Alta {formatDateShort(company.createdAt, false)}
                        {company.owner?.email ? ` · ${company.owner.email}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-[#212121] dark:text-white">
                        {company.planName ?? "—"}
                      </p>
                      <div className="mt-1">
                        <SubscriptionStatusBadge status={company.subscriptionStatus} />
                      </div>
                      {periodHint(company) ? (
                        <p className="mt-1 text-xs text-[#9e9e9e]">{periodHint(company)}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <CreditsCell company={company} />
                    </td>
                    <td className="px-4 py-3 align-top tabular-nums text-[#212121] dark:text-white">
                      {company.usersCount}
                    </td>
                    <td className="px-4 py-3 align-top tabular-nums text-[#212121] dark:text-white">
                      {formatCredits(company.leadsCount)}
                    </td>
                    <td className="px-4 py-3 align-top text-[#616161] dark:text-[#b0b0b0]">
                      {company.lastLoginAt ? formatDate(company.lastLoginAt) : "Nunca"}
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
            totalCount={total}
            pageSize={ADMIN_PAGE_SIZE}
            currentPage={page}
            onPageChange={(next) => setParams({ pagina: next > 1 ? String(next) : null })}
          />
        </>
      )}
    </div>
  );
}
