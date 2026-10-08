"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  SUBSCRIPTION_STATUS_CLASSES,
  SUBSCRIPTION_STATUS_OPTIONS,
} from "kadesh/constants/constans";
import {
  ADMIN_PAGE_SIZE,
  COMPANY_DETAIL_SECTIONS,
  CREDIT_LEDGER_TYPE_LABELS,
  ROLE_LABELS,
  parseCompanyDetailSection,
  type CompanyDetailSection,
} from "./constants";
import { getCurrentCreditPeriodParts } from "./credits";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import {
  ADMIN_COMPANIES_QUERY,
  ADMIN_COMPANY_DETAIL_QUERY,
  ADMIN_COMPANY_LEDGER_QUERY,
  ADMIN_COMPANY_LEADS_QUERY,
  ADMIN_SYNC_LOGS_QUERY,
  type AdminCompaniesResponse,
  type AdminCompanyDetailResponse,
  type AdminCompanyLedgerResponse,
  type AdminCompanyLeadsResponse,
  type AdminCompanySyncLogsResponse,
} from "./company-ops-queries";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  AdminSegmented,
  AdminStatusBadge,
  formatCredits,
  formatPersonName,
  surfaceClass,
} from "./ui";

const DETAIL_ITEMS: Array<{ id: CompanyDetailSection; label: string }> = [
  { id: COMPANY_DETAIL_SECTIONS.RESUMEN, label: "Resumen" },
  { id: COMPANY_DETAIL_SECTIONS.CREDITS, label: "Créditos" },
  { id: COMPANY_DETAIL_SECTIONS.SYNC, label: "Sync" },
  { id: COMPANY_DETAIL_SECTIONS.LEADS, label: "Leads" },
];

function categoriesLabel(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return "Todas / sin límite";
  return value.map(String).join(", ");
}

function subscriptionStatusLabel(status: string | null | undefined) {
  if (!status) return "—";
  return (
    SUBSCRIPTION_STATUS_OPTIONS.find((o) => o.value === status)?.label ??
    status
  );
}

function AdminCompaniesList({
  onOpenCompany,
}: {
  onOpenCompany: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const period = getCurrentCreditPeriodParts();

  const where = useMemo(() => {
    const q = debouncedSearch.trim();
    if (!q) return {};
    return { name: { contains: q, mode: "insensitive" as const } };
  }, [debouncedSearch]);

  const { data, loading, error } = useQuery<AdminCompaniesResponse>(
    ADMIN_COMPANIES_QUERY,
    {
      variables: {
        where,
        take: ADMIN_PAGE_SIZE,
        skip: (page - 1) * ADMIN_PAGE_SIZE,
        year: period.year,
        month: period.month,
      },
      fetchPolicy: "network-only",
    },
  );

  const rows = data?.saasCompanies ?? [];
  const totalCount = data?.saasCompaniesCount ?? 0;

  return (
    <div className="flex flex-col gap-4" data-tour="admin-empresas">
      <div>
        <h2 className="text-lg font-semibold text-[#212121] dark:text-white">
          Empresas
        </h2>
        <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
          Créditos gastados, logs de sync y bolsa de leads por empresa.
        </p>
      </div>

      <AdminSearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Buscar por nombre de empresa"
      />

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No hay empresas que coincidan"
          description="Prueba otro nombre o borra la búsqueda."
        />
      ) : (
        <>
          <div className={`${surfaceClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f5f5f5] text-xs font-semibold uppercase tracking-wide text-[#616161] dark:bg-[#2a2a2a] dark:text-[#b0b0b0]">
                  <tr>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Créditos (mes)</th>
                    <th className="px-4 py-3">Leads</th>
                    <th className="px-4 py-3">Usuarios</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8e8] dark:divide-[#333]">
                  {rows.map((c) => {
                    const periodRow = c.creditPeriods[0];
                    const plan = periodRow?.planAllowance ?? 0;
                    const bonus =
                      periodRow?.bonusAllowance ??
                      c.purchasedBonusCredits ??
                      0;
                    const used = periodRow?.used ?? 0;
                    const remaining = Math.max(0, plan + bonus - used);
                    const sub = c.subscriptions[0];
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-[#fafafa] dark:hover:bg-[#252525]"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#212121] dark:text-white">
                            {c.name}
                          </p>
                          <p className="text-xs text-[#9e9e9e]">
                            Alta {formatDateShort(c.createdAt, false)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                          {sub?.planName ?? c.plan?.name ?? "—"}
                          {sub?.status ? (
                            <span className="mt-1 block">
                              <AdminStatusBadge
                                label={subscriptionStatusLabel(sub.status)}
                                className={
                                  SUBSCRIPTION_STATUS_CLASSES[sub.status] ??
                                  "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
                                }
                              />
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-[#212121] dark:text-white">
                          {formatCredits(remaining)} disp. ·{" "}
                          {formatCredits(used)} usados
                        </td>
                        <td className="px-4 py-3 tabular-nums text-[#212121] dark:text-white">
                          {c.leadsCount ?? 0}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-[#212121] dark:text-white">
                          {c.usersCount ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenCompany(c.id)}
                            className="inline-flex min-h-10 items-center rounded-xl bg-orange-500 px-3 text-sm font-semibold text-white hover:bg-orange-600"
                          >
                            Ver detalle
                          </button>
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

function CompanyResumen({ companyId }: { companyId: string }) {
  const period = getCurrentCreditPeriodParts();
  const { data, loading, error } = useQuery<AdminCompanyDetailResponse>(
    ADMIN_COMPANY_DETAIL_QUERY,
    {
      variables: {
        where: { id: companyId },
        year: period.year,
        month: period.month,
      },
      fetchPolicy: "network-only",
    },
  );
  const c = data?.saasCompany;

  if (error) return <AdminErrorState message={error.message} />;
  if (loading && !c) return <AdminLoadingRows rows={4} />;
  if (!c) {
    return (
      <AdminEmptyState
        title="No se encontró la empresa"
        description="Puede que la hayan borrado o el enlace esté mal."
      />
    );
  }

  const periodRow = c.creditPeriods[0];
  const plan = periodRow?.planAllowance ?? 0;
  const bonus =
    periodRow?.bonusAllowance ?? c.purchasedBonusCredits ?? 0;
  const used = periodRow?.used ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className={`${surfaceClass} p-4 space-y-3`}>
        <h3 className="text-sm font-semibold text-[#212121] dark:text-white">
          Empresa
        </h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-xs text-[#9e9e9e]">Nombre</dt>
            <dd className="font-medium text-[#212121] dark:text-white">
              {c.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#9e9e9e]">Plan actual</dt>
            <dd className="text-[#212121] dark:text-white">
              {c.plan?.name ?? "—"}
              {c.plan?.leadLimit != null
                ? ` · ${c.plan.leadLimit} créditos/mes`
                : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#9e9e9e]">Inicio suscripción</dt>
            <dd className="text-[#212121] dark:text-white">
              {c.subscriptionStartedAt
                ? formatDateShort(c.subscriptionStartedAt, false)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#9e9e9e]">Contacto</dt>
            <dd className="text-[#212121] dark:text-white">
              {[c.contactEmail, c.contactPhone].filter(Boolean).join(" · ") ||
                "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#9e9e9e]">Categorías Maps</dt>
            <dd className="text-[#212121] dark:text-white break-words">
              {categoriesLabel(c.allowedGooglePlaceCategories)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#9e9e9e]">Onboarding</dt>
            <dd className="text-[#616161] dark:text-[#b0b0b0] text-xs leading-relaxed">
              {c.onboardingMainOffer || c.onboardingIdealCustomer
                ? [
                    c.onboardingMainOffer,
                    c.onboardingIdealCustomer,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "Sin respuestas"}
            </dd>
          </div>
        </dl>
      </section>

      <section className={`${surfaceClass} p-4 space-y-3`}>
        <h3 className="text-sm font-semibold text-[#212121] dark:text-white">
          Uso este mes
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Leads", value: c.leadsCount ?? 0 },
            { label: "Usuarios", value: c.usersCount ?? 0 },
            { label: "Mov. créditos", value: c.creditLedgerEntriesCount ?? 0 },
            { label: "Syncs", value: c.leadSyncLogsCount ?? 0 },
            { label: "Créditos usados", value: used },
            { label: "Disponibles", value: Math.max(0, plan + bonus - used) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[#e8e8e8] px-3 py-2 dark:border-[#333]"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#9e9e9e]">
                {stat.label}
              </p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-[#212121] dark:text-white">
                {formatCredits(stat.value)}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
          Cupo mes: {formatCredits(plan)} plan + {formatCredits(bonus)} extra
          (recargas permanentes: {formatCredits(c.purchasedBonusCredits ?? 0)})
        </p>
      </section>

      <section className={`${surfaceClass} p-4 space-y-2 lg:col-span-2`}>
        <h3 className="text-sm font-semibold text-[#212121] dark:text-white">
          Personas ({c.users.length}
          {c.usersCount != null && c.usersCount > c.users.length
            ? ` de ${c.usersCount}`
            : ""}
          )
        </h3>
        {c.users.length === 0 ? (
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
            Sin usuarios.
          </p>
        ) : (
          <ul className="divide-y divide-[#e8e8e8] dark:divide-[#333]">
            {c.users.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-[#212121] dark:text-white">
                    {formatPersonName(u.name, u.lastName)}
                  </p>
                  <p className="text-xs text-[#9e9e9e]">{u.email ?? "—"}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {u.roles.map((r) => (
                    <AdminStatusBadge
                      key={r.name}
                      label={ROLE_LABELS[r.name] ?? r.name}
                      className="bg-[#f0f0f0] text-[#616161] dark:bg-[#333] dark:text-[#b0b0b0]"
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${surfaceClass} p-4 space-y-2 lg:col-span-2`}>
        <h3 className="text-sm font-semibold text-[#212121] dark:text-white">
          Suscripciones recientes
        </h3>
        {c.subscriptions.length === 0 ? (
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
            Sin historial.
          </p>
        ) : (
          <ul className="space-y-2">
            {c.subscriptions.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e8e8e8] px-3 py-2 dark:border-[#333]"
              >
                <div>
                  <p className="text-sm font-medium text-[#212121] dark:text-white">
                    {s.planName ?? "Plan"}
                    {s.planLeadLimit != null
                      ? ` · ${s.planLeadLimit} créditos`
                      : ""}
                  </p>
                  <p className="text-xs text-[#9e9e9e]">
                    {s.activatedAt
                      ? formatDateShort(s.activatedAt, false)
                      : formatDateShort(s.createdAt, false)}
                    {s.currentPeriodEnd
                      ? ` → ${formatDateShort(s.currentPeriodEnd, false)}`
                      : ""}
                  </p>
                </div>
                {s.status ? (
                  <AdminStatusBadge
                    label={subscriptionStatusLabel(s.status)}
                    className={
                      SUBSCRIPTION_STATUS_CLASSES[s.status] ??
                      "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
                    }
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CompanyCredits({ companyId }: { companyId: string }) {
  const [page, setPage] = useState(1);
  const where = useMemo(
    () => ({ company: { id: { equals: companyId } } }),
    [companyId],
  );
  const { data, loading, error } = useQuery<AdminCompanyLedgerResponse>(
    ADMIN_COMPANY_LEDGER_QUERY,
    {
      variables: {
        where,
        take: ADMIN_PAGE_SIZE,
        skip: (page - 1) * ADMIN_PAGE_SIZE,
      },
      fetchPolicy: "network-only",
    },
  );
  const rows = data?.saasCompanyCreditLedgers ?? [];
  const totalCount = data?.saasCompanyCreditLedgersCount ?? 0;

  if (error) return <AdminErrorState message={error.message} />;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
        Altas, recargas y gasto de créditos (sync e IA).
      </p>
      {loading && rows.length === 0 ? (
        <AdminLoadingRows />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Sin movimientos de créditos"
          description="Cuando gasten o recarguen, aparecen aquí."
        />
      ) : (
        <>
          <div className={`${surfaceClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f5f5f5] text-xs font-semibold uppercase tracking-wide text-[#616161] dark:bg-[#2a2a2a] dark:text-[#b0b0b0]">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Monto</th>
                    <th className="px-4 py-3">Saldo</th>
                    <th className="px-4 py-3">Ref.</th>
                    <th className="px-4 py-3">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8e8] dark:divide-[#333]">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-[#616161] dark:text-[#b0b0b0]">
                        {formatDateShort(row.createdAt, true)}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#212121] dark:text-white">
                        {CREDIT_LEDGER_TYPE_LABELS[row.type] ?? row.type}
                      </td>
                      <td
                        className={`px-4 py-3 tabular-nums font-semibold ${
                          row.amount < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {row.amount > 0 ? "+" : ""}
                        {row.amount}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[#212121] dark:text-white">
                        {row.balanceAfter ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#9e9e9e]">
                        {[row.referenceType, row.referenceId]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                        {row.period
                          ? ` · ${row.period.month}/${row.period.year}`
                          : ""}
                      </td>
                      <td className="px-4 py-3 max-w-[220px] truncate text-[#616161] dark:text-[#b0b0b0]">
                        {row.notes ?? "—"}
                      </td>
                    </tr>
                  ))}
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

function CompanySync({ companyId }: { companyId: string }) {
  const [page, setPage] = useState(1);
  const where = useMemo(
    () => ({ company: { id: { equals: companyId } } }),
    [companyId],
  );
  const { data, loading, error } = useQuery<AdminCompanySyncLogsResponse>(
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

  if (error) return <AdminErrorState message={error.message} />;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
        Cada corrida de Extracción B2B (Google Maps / sync) queda registrada
        aquí.
      </p>
      {loading && rows.length === 0 ? (
        <AdminLoadingRows />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Sin logs de sincronización"
          description="Cada corrida de Extracción B2B queda registrada aquí."
        />
      ) : (
        <>
          <div className={`${surfaceClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f5f5f5] text-xs font-semibold uppercase tracking-wide text-[#616161] dark:bg-[#2a2a2a] dark:text-[#b0b0b0]">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Creados</th>
                    <th className="px-4 py-3">Ya en BD</th>
                    <th className="px-4 py-3">Asignados</th>
                    <th className="px-4 py-3">Cuota</th>
                    <th className="px-4 py-3">Mensaje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8e8] dark:divide-[#333]">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-[#616161] dark:text-[#b0b0b0]">
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
                        {row.user
                          ? formatPersonName(row.user.name, row.user.lastName)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                        {row.category ?? "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {row.created ?? 0}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {row.alreadyInDb ?? 0}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {row.syncedLeadsCount ?? 0}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-xs text-[#9e9e9e]">
                        {row.syncedCount != null || row.leadLimit != null
                          ? `${row.syncedCount ?? "—"} / ${row.leadLimit ?? "—"}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 max-w-[240px] truncate text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {row.message ?? "—"}
                      </td>
                    </tr>
                  ))}
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

function CompanyLeads({ companyId }: { companyId: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const where = useMemo(() => {
    const base = { saasCompany: { some: { id: { equals: companyId } } } };
    const q = debouncedSearch.trim();
    if (!q) return base;
    return {
      AND: [
        base,
        {
          OR: [
            { businessName: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
            { city: { contains: q, mode: "insensitive" as const } },
          ],
        },
      ],
    };
  }, [companyId, debouncedSearch]);

  const { data, loading, error } = useQuery<AdminCompanyLeadsResponse>(
    ADMIN_COMPANY_LEADS_QUERY,
    {
      variables: {
        where,
        take: ADMIN_PAGE_SIZE,
        skip: (page - 1) * ADMIN_PAGE_SIZE,
      },
      fetchPolicy: "network-only",
    },
  );
  const rows = data?.techBusinessLeads ?? [];
  const totalCount = data?.techBusinessLeadsCount ?? 0;

  if (error) return <AdminErrorState message={error.message} />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          {totalCount} lead{totalCount === 1 ? "" : "s"} en la bolsa de la
          empresa.
        </p>
        <div className="w-full sm:max-w-xs">
          <AdminSearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Buscar nombre, teléfono o ciudad"
          />
        </div>
      </div>
      {loading && rows.length === 0 ? (
        <AdminLoadingRows />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Sin leads en esta empresa"
          description="Cuando sincronicen o importen, aparecen en esta tabla."
        />
      ) : (
        <>
          <div className={`${surfaceClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f5f5f5] text-xs font-semibold uppercase tracking-wide text-[#616161] dark:bg-[#2a2a2a] dark:text-[#b0b0b0]">
                  <tr>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Ubicación</th>
                    <th className="px-4 py-3">Fuente</th>
                    <th className="px-4 py-3">Asignado</th>
                    <th className="px-4 py-3">Alta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8e8] dark:divide-[#333]">
                  {rows.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-4 py-3 font-medium text-[#212121] dark:text-white">
                        {lead.businessName}
                      </td>
                      <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                        {lead.category ?? "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                        {lead.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                        {[lead.city, lead.state, lead.country]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                        {lead.source ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                        {lead.salesPerson.length
                          ? lead.salesPerson
                              .map((p) =>
                                formatPersonName(p.name, p.lastName),
                              )
                              .join(", ")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-[#9e9e9e]">
                        {formatDateShort(lead.createdAt, false)}
                      </td>
                    </tr>
                  ))}
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

function AdminCompanyDetail({
  companyId,
  section,
  onSectionChange,
  onBack,
}: {
  companyId: string;
  section: CompanyDetailSection;
  onSectionChange: (section: CompanyDetailSection) => void;
  onBack: () => void;
}) {
  const period = getCurrentCreditPeriodParts();
  const { data } = useQuery<AdminCompanyDetailResponse>(
    ADMIN_COMPANY_DETAIL_QUERY,
    {
      variables: {
        where: { id: companyId },
        year: period.year,
        month: period.month,
      },
      fetchPolicy: "cache-and-network",
    },
  );
  const name = data?.saasCompany?.name ?? "Empresa";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-10 items-center gap-1.5 text-sm text-[#616161] hover:text-orange-500 dark:text-[#b0b0b0]"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Todas las empresas
          </button>
          <h2 className="mt-2 text-xl font-bold text-[#212121] dark:text-white">
            {name}
          </h2>
          <p className="mt-0.5 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Créditos, sync y bolsa de leads de esta empresa.
          </p>
        </div>
      </div>

      <AdminSegmented
        ariaLabel="Detalle de empresa"
        items={DETAIL_ITEMS}
        value={section}
        onChange={onSectionChange}
      />

      {section === COMPANY_DETAIL_SECTIONS.RESUMEN ? (
        <CompanyResumen companyId={companyId} />
      ) : null}
      {section === COMPANY_DETAIL_SECTIONS.CREDITS ? (
        <CompanyCredits companyId={companyId} />
      ) : null}
      {section === COMPANY_DETAIL_SECTIONS.SYNC ? (
        <CompanySync companyId={companyId} />
      ) : null}
      {section === COMPANY_DETAIL_SECTIONS.LEADS ? (
        <CompanyLeads companyId={companyId} />
      ) : null}
    </div>
  );
}

export default function AdminCompaniesPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("empresa");
  const section = parseCompanyDetailSection(searchParams.get("detalle"));

  const replaceParams = useCallback(
    (next: { empresa?: string | null; detalle?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "empresas");
      if (next.empresa === null) params.delete("empresa");
      else if (next.empresa) params.set("empresa", next.empresa);
      if (next.detalle === null || next.detalle === COMPANY_DETAIL_SECTIONS.RESUMEN) {
        params.delete("detalle");
      } else if (next.detalle) {
        params.set("detalle", next.detalle);
      }
      const qs = params.toString();
      router.replace(qs ? `${Routes.panelAdmin}?${qs}` : Routes.panelAdmin, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  if (companyId) {
    return (
      <AdminCompanyDetail
        companyId={companyId}
        section={section}
        onSectionChange={(next) =>
          replaceParams({ empresa: companyId, detalle: next })
        }
        onBack={() => replaceParams({ empresa: null, detalle: null })}
      />
    );
  }

  return (
    <AdminCompaniesList
      onOpenCompany={(id) =>
        replaceParams({
          empresa: id,
          detalle: COMPANY_DETAIL_SECTIONS.RESUMEN,
        })
      }
    />
  );
}
