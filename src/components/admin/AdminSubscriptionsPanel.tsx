"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import {
  SUBSCRIPTION_STATUS_CLASSES,
  SUBSCRIPTION_STATUS_OPTIONS,
} from "kadesh/constants/constans";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  ADMIN_SUBSCRIPTIONS_QUERY,
  GRANT_ADMIN_CREDITS_MUTATION,
  UPDATE_ADMIN_SUBSCRIPTION_MUTATION,
  type AdminSubscriptionsResponse,
  type GrantAdminCreditsResponse,
} from "./queries";
import { ADMIN_PAGE_SIZE, SUBSCRIPTION_STATUS_FILTERS } from "./constants";
import type { AdminSubscriptionRow } from "./types";
import { getCurrentCreditPeriodParts, getSubscriptionCredits } from "./credits";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import AdminSubscriptionEditor from "./AdminSubscriptionEditor";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  AdminStatusBadge,
  formatCredits,
  formatMoney,
  formatPersonName,
  formatPlanFrequency,
  surfaceClass,
} from "./ui";

export default function AdminSubscriptionsPanel() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const where = useMemo(() => {
    const filters: Record<string, unknown>[] = [];
    const q = debouncedSearch.trim();
    if (q) {
      filters.push({
        OR: [
          { planName: { contains: q, mode: "insensitive" } },
          { company: { name: { contains: q, mode: "insensitive" } } },
        ],
      });
    }
    if (status !== "all") {
      filters.push({ status: { equals: status } });
    }
    if (filters.length === 0) return {};
    if (filters.length === 1) return filters[0];
    return { AND: filters };
  }, [debouncedSearch, status]);

  const queryVariables = {
    where,
    take: ADMIN_PAGE_SIZE,
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    ...getCurrentCreditPeriodParts(),
  };

  const { data, loading, error } = useQuery<AdminSubscriptionsResponse>(
    ADMIN_SUBSCRIPTIONS_QUERY,
    {
      variables: queryVariables,
      fetchPolicy: "network-only",
    },
  );

  const refetchSubscriptions = {
    query: ADMIN_SUBSCRIPTIONS_QUERY,
    variables: queryVariables,
  };

  const [updateSubscription] = useMutation(UPDATE_ADMIN_SUBSCRIPTION_MUTATION, {
    refetchQueries: [refetchSubscriptions],
  });

  const [grantCredits] = useMutation<GrantAdminCreditsResponse>(
    GRANT_ADMIN_CREDITS_MUTATION,
    {
      refetchQueries: [refetchSubscriptions],
    },
  );

  const subscriptions = data?.saasCompanySubscriptions ?? [];
  const totalCount = data?.saasCompanySubscriptionsCount ?? 0;
  const selected = subscriptions.find((s) => s.id === selectedId) ?? null;

  async function handleSave(args: {
    subscriptionId: string;
    planFeaturesPayload: Array<{ key: string; included: boolean }>;
    activatedAt?: string | null;
    currentPeriodEnd?: string | null;
    creditsToAdd?: number;
  }) {
    const companyId = selected?.company?.id;
    const creditsToAdd = Math.floor(args.creditsToAdd ?? 0);
    const willGrantCredits = creditsToAdd >= 1;

    if (willGrantCredits && !companyId) {
      sileo.error({
        title: "No se pudieron agregar créditos",
        description: "Esta suscripción no tiene empresa vinculada.",
      });
      return;
    }

    setSavingId(args.subscriptionId);
    try {
      if (willGrantCredits && companyId) {
        const grantResult = await grantCredits({
          variables: {
            input: {
              companyId,
              subscriptionId: args.subscriptionId,
              amount: creditsToAdd,
            },
          },
        });
        const grant = grantResult.data?.grantAdminCredits;
        if (!grant?.success) {
          sileo.error({
            title: "No se pudieron agregar créditos",
            description: grant?.message ?? "Intenta de nuevo.",
          });
          return;
        }
      }

      await updateSubscription({
        variables: {
          where: { id: args.subscriptionId },
          data: {
            planFeatures: args.planFeaturesPayload,
            ...(args.activatedAt ? { activatedAt: args.activatedAt } : {}),
            ...(args.currentPeriodEnd
              ? { currentPeriodEnd: args.currentPeriodEnd }
              : {}),
          },
        },
      });
      sileo.success({
        title: willGrantCredits
          ? `Plan actualizado · +${formatCredits(creditsToAdd)} créditos`
          : "Plan actualizado",
      });
      setSelectedId(null);
    } catch (err) {
      sileo.error({
        title: willGrantCredits
          ? "No se pudieron guardar los cambios"
          : "No se pudo guardar el plan",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminSubscriptionEditor
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        subscription={selected}
        saving={savingId === selectedId}
        onSave={handleSave}
      />

      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por empresa o nombre de plan"
        />
        <AdminFilterChips
          label="Estado"
          options={[...SUBSCRIPTION_STATUS_FILTERS]}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <AdminErrorState message="No se pudieron cargar las suscripciones." />
      ) : loading && subscriptions.length === 0 ? (
        <AdminLoadingRows />
      ) : subscriptions.length === 0 ? (
        <AdminEmptyState
          title="No hay suscripciones con ese filtro"
          description="Cambia el estado o busca por el nombre de la empresa."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                onOpen={() => setSelectedId(sub.id)}
              />
            ))}
          </div>

          <div className={`${surfaceClass} hidden md:block overflow-x-auto`}>
            <table className="min-w-[1080px] w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] border-b border-[#e8e8e8] dark:border-[#333]">
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Créditos</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Periodo</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const contact = sub.company?.users?.[0];
                  const credits = getSubscriptionCredits(sub);
                  const statusLabel =
                    SUBSCRIPTION_STATUS_OPTIONS.find(
                      (o) => o.value === sub.status,
                    )?.label ?? "Sin estado";
                  return (
                    <tr
                      key={sub.id}
                      className="border-b border-[#f0f0f0] dark:border-[#2a2a2a] last:border-0 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-[#212121] dark:text-white">
                          {sub.company?.name ?? "—"}
                        </div>
                        <div className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                          {formatPersonName(contact?.name, contact?.lastName)}
                          {contact?.email ? ` · ${contact.email}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-[#212121] dark:text-white">
                          {sub.planName ?? "—"}
                        </div>
                        <div className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                          {formatMoney(sub.planCost, sub.planCurrency)}{" "}
                          {formatPlanFrequency(sub.planFrequency)}
                          {sub.planLeadLimit != null
                            ? ` · ${formatCredits(sub.planLeadLimit)} del plan`
                            : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-[#212121] dark:text-white">
                          {formatCredits(credits.remaining)}
                        </div>
                        <div className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                          este mes
                          {credits.bonus > 0
                            ? ` · ${formatCredits(credits.bonus)} extra`
                            : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <AdminStatusBadge
                          label={statusLabel}
                          className={
                            SUBSCRIPTION_STATUS_CLASSES[sub.status ?? ""] ??
                            "bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161]"
                          }
                        />
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-[#616161] dark:text-[#b0b0b0] whitespace-nowrap">
                        {formatDateShort(sub.activatedAt, false)} →{" "}
                        {formatDateShort(sub.currentPeriodEnd, false)}
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedId(sub.id)}
                          className="h-11 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] px-4 text-xs font-semibold hover:border-orange-300 cursor-pointer"
                        >
                          Ajustar plan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <AdminPagination
            totalCount={totalCount}
            pageSize={ADMIN_PAGE_SIZE}
            currentPage={page}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

function SubscriptionCard({
  subscription,
  onOpen,
}: {
  subscription: AdminSubscriptionRow;
  onOpen: () => void;
}) {
  const contact = subscription.company?.users?.[0];
  const credits = getSubscriptionCredits(subscription);
  const statusLabel =
    SUBSCRIPTION_STATUS_OPTIONS.find((o) => o.value === subscription.status)
      ?.label ?? "Sin estado";

  return (
    <article className={`${surfaceClass} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[#212121] dark:text-white">
            {subscription.company?.name ?? "—"}
          </p>
          <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
            {formatPersonName(contact?.name, contact?.lastName)}
          </p>
        </div>
        <AdminStatusBadge
          label={statusLabel}
          className={
            SUBSCRIPTION_STATUS_CLASSES[subscription.status ?? ""] ??
            "bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161]"
          }
        />
      </div>
      <p className="mt-3 text-sm text-[#212121] dark:text-white">
        {subscription.planName ?? "Sin plan"} ·{" "}
        {formatMoney(subscription.planCost, subscription.planCurrency)}{" "}
        {formatPlanFrequency(subscription.planFrequency)}
      </p>
      <p className="text-sm text-[#212121] dark:text-white mt-1">
        {formatCredits(credits.remaining)} créditos este mes
        {credits.bonus > 0 ? ` · ${formatCredits(credits.bonus)} extra` : ""}
      </p>
      <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
        {formatDateShort(subscription.activatedAt, false)} →{" "}
        {formatDateShort(subscription.currentPeriodEnd, false)}
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-4 h-11 w-full rounded-xl bg-orange-500 text-white text-sm font-semibold cursor-pointer"
      >
        Ajustar plan
      </button>
    </article>
  );
}
