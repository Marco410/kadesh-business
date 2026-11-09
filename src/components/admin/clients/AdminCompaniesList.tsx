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
import { useUser } from "kadesh/utils/UserContext";
import {
  ADMIN_PAGE_SIZE,
  COMPANY_OWNER_FILTERS,
  COMPANY_SORT_OPTIONS,
  COMPANY_STATUS_FILTERS,
  parseCompanyOwnerFilter,
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
import { lastAccessAt } from "./company/format";
import { HealthBadge, HealthSignals } from "../analytics/HealthBadge";
import { adminErrorText } from "../errors";

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
        "bg-dash-surface-3 text-dash-muted"
      }
    />
  );
}

/** "Cuenta de Marco" si tiene dueño de cuenta en Kadesh. */
function managerHint(company: AdminCompanyListItem) {
  const manager = company.accountManager;
  return manager ? `Cuenta de ${formatPersonName(manager.name, manager.lastName)}` : null;
}

/** Último login o último latido del panel, lo más reciente. */
function formatLastAccess(company: AdminCompanyListItem, empty: string, prefix = "") {
  const at = lastAccessAt(company.lastLoginAt, company.lastSeenAt);
  return at ? `${prefix}${formatDate(at)}` : empty;
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
      <p className="text-sm tabular-nums text-dash-ink">
        {formatCredits(company.creditsRemaining)}
        <span className="text-dash-faint"> disp. de {formatCredits(total)}</span>
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
  const owner = parseCompanyOwnerFilter(searchParams.get("cuentas"));
  const page = Math.max(1, Number(searchParams.get("pagina")) || 1);
  const { user } = useUser();
  const accountManagerId = owner === "mias" ? user?.id ?? null : null;

  const { data, loading, error } = useQuery<AdminCompaniesListResponse>(
    ADMIN_COMPANIES_LIST_QUERY,
    {
      variables: {
        input: {
          search: search.query || null,
          status,
          sort,
          accountManagerId,
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
        <AdminFilterChips
          label="Cuentas"
          options={[...COMPANY_OWNER_FILTERS]}
          value={owner}
          onChange={(value) =>
            setParams({ cuentas: value === "todas" ? null : value, pagina: null })
          }
        />
      </div>

      {error ? (
        <AdminErrorState message={adminErrorText(error, "No se pudo cargar la lista de negocios.")} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No hay empresas que coincidan"
          description={
            owner === "mias"
              ? "Todavía no tienes cuentas asignadas. Asígnalas desde el 360 de cada empresa."
              : "Prueba otro estado o busca por el correo de alguien del equipo."
          }
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
                      <p className="font-semibold text-dash-ink">
                        {company.name}
                        {company.suspendedAt ? (
                          <span className="ml-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                            · Suspendida
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-dash-muted">
                        {company.owner
                          ? formatPersonName(company.owner.name, company.owner.lastName)
                          : "Sin equipo"}
                        {company.owner?.email ? ` · ${company.owner.email}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <SubscriptionStatusBadge status={company.subscriptionStatus} />
                      {company.health ? (
                        <HealthBadge score={company.health.score} label={company.health.label} showLabel />
                      ) : null}
                    </div>
                  </div>
                  {company.health?.flags.length ? (
                    <div className="mt-2">
                      <HealthSignals flags={company.health.flags} compact />
                    </div>
                  ) : null}
                  <div className="mt-3">
                    <CreditsCell company={company} />
                  </div>
                  <p className="mt-3 text-xs text-dash-muted">
                    {company.planName ?? "Sin plan"} · {company.usersCount} en el equipo ·{" "}
                    {formatCredits(company.leadsCount)} leads
                  </p>
                  <p className="mt-1 text-xs text-dash-faint">
                    {formatLastAccess(company, "Nadie ha entrado", "Último acceso: ")}
                    {managerHint(company) ? ` · ${managerHint(company)}` : ""}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          <div className={`${surfaceClass} relative hidden overflow-x-auto md:block`}>
            <table className="w-full min-w-[1020px] text-left text-sm">
              <thead className="border-b border-dash-line text-dash-muted text-[12px] font-semibold uppercase tracking-[0.04em] bg-dash-surface-2/60">
                <tr>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Salud</th>
                  <th className="px-4 py-3">Créditos del mes</th>
                  <th className="px-4 py-3">Equipo</th>
                  <th className="px-4 py-3">Leads</th>
                  <th className="px-4 py-3">Último acceso</th>
                  <th className="w-10 px-2 py-3">
                    <span className="sr-only">Abrir</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-line">
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
                        className="text-left font-semibold text-dash-ink hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded dark:hover:text-orange-400 cursor-pointer"
                      >
                        {company.name}
                      </button>
                      {company.isTest ? (
                        <AdminStatusBadge
                          label="Prueba interna"
                          className="ml-2 bg-dash-surface-2 px-2 py-0.5 text-dash-muted"
                        />
                      ) : null}
                      {company.suspendedAt ? (
                        <AdminStatusBadge
                          label="Suspendida"
                          className="ml-2 bg-red-500/15 px-2 py-0.5 text-red-700 dark:text-red-300"
                        />
                      ) : null}
                      <p className="mt-0.5 text-xs text-dash-faint">
                        Alta {formatDateShort(company.createdAt, false)}
                        {company.owner?.email ? ` · ${company.owner.email}` : ""}
                      </p>
                      {managerHint(company) ? (
                        <p className="mt-0.5 text-xs text-dash-faint">{managerHint(company)}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-dash-ink">
                        {company.planName ?? "—"}
                      </p>
                      <div className="mt-1">
                        <SubscriptionStatusBadge status={company.subscriptionStatus} />
                      </div>
                      {periodHint(company) ? (
                        <p className="mt-1 text-xs text-dash-faint">{periodHint(company)}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {company.health ? (
                        <>
                          <HealthBadge score={company.health.score} label={company.health.label} />
                          {company.health.flags.length ? (
                            <div className="mt-1.5">
                              <HealthSignals flags={company.health.flags} compact />
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-xs text-dash-faint">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <CreditsCell company={company} />
                    </td>
                    <td className="px-4 py-3 align-top tabular-nums text-dash-ink">
                      {company.usersCount}
                    </td>
                    <td className="px-4 py-3 align-top tabular-nums text-dash-ink">
                      {formatCredits(company.leadsCount)}
                    </td>
                    <td className="px-4 py-3 align-top text-dash-muted">
                      {formatLastAccess(company, "Nunca")}
                    </td>
                    <td className="px-2 py-3 align-top text-dash-faint">
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
