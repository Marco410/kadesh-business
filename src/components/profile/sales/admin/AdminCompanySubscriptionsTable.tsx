"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import {
  PLAN_FEATURE_KEYS,
  Role,
  SUBSCRIPTION_STATUS_CLASSES,
  SUBSCRIPTION_STATUS_OPTIONS,
} from "kadesh/constants/constans";
import { ADMIN_COMPANY_USERS_QUERY, UPDATE_COMPANY_SUBSCRIPTION_PLAN_FEATURES_MUTATION } from "./queries";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  AdminCompanySubscriptionsModal,
  getLatestSubscription,
} from "./AdminCompanySubscriptionsModal";
import { AdminCompanyUserRow } from "./types";

export default function AdminCompanySubscriptionsTable() {
  const featureKeys = useMemo(() => Object.values(PLAN_FEATURE_KEYS) as string[], []);

  const adminUsersWhere = useMemo(
    () => ({
      where: {
        roles: { some: { name: { equals: Role.ADMIN_COMPANY } } },
      },
    }),
    [],
  );

  const { data: usersData, loading: usersLoading, error: usersError } = useQuery<
    { users: AdminCompanyUserRow[] },
    any
  >(ADMIN_COMPANY_USERS_QUERY, {
    variables: adminUsersWhere,
    fetchPolicy: "network-only",
  });

  const users = usersData?.users ?? [];

  const [updateCompanySubscriptionPlanFeatures] = useMutation(
    UPDATE_COMPANY_SUBSCRIPTION_PLAN_FEATURES_MUTATION,
    {
      refetchQueries: [{ query: ADMIN_COMPANY_USERS_QUERY, variables: adminUsersWhere }],
    },
  );

  const [savingSubscriptionId, setSavingSubscriptionId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

  if (usersLoading) {
    return (
      <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6">
        <div className="flex items-center justify-center gap-3 py-10">
          <span className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
          <span className="text-sm text-[#616161] dark:text-[#b0b0b0]">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-6 text-sm text-red-700 dark:text-red-200">
        No se pudo cargar la lista de usuarios. Intenta de nuevo.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 sm:p-6">
      <AdminCompanySubscriptionsModal
        isOpen={Boolean(selectedUserId)}
        onClose={() => setSelectedUserId(null)}
        user={selectedUser}
        featureKeys={featureKeys}
        savingSubscriptionId={savingSubscriptionId}
        onSaveFeatures={async ({
          subscriptionId,
          planFeaturesPayload,
          activatedAt,
          currentPeriodEnd,
        }) => {
          setSavingSubscriptionId(subscriptionId);
          try {
            await updateCompanySubscriptionPlanFeatures({
              variables: {
                where: { id: subscriptionId },
                data: {
                  planFeatures: planFeaturesPayload,
                  ...(activatedAt ? { activatedAt } : {}),
                  ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
                },
              },
            });
            sileo.success({ title: "Plan features actualizados" });
          } catch (err) {
            sileo.error({
              title: "No se pudo actualizar plan features",
              description: err instanceof Error ? err.message : "Intenta de nuevo.",
            });
          } finally {
            setSavingSubscriptionId(null);
          }
        }}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#212121] dark:text-white">
            Admin: suscripciones por usuario
          </h2>
          <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
            Haz click en un usuario para ver su historial de suscripciones y actualizar planFeatures por suscripción.
          </p>
        </div>
        <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">{users.length} usuarios</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full border-separate border-spacing-y-1 text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0]">
              <th className="text-left px-3 py-2">Usuario</th>
              <th className="text-left px-3 py-2">Empresa</th>
              <th className="text-left px-3 py-2">Última suscripción</th>
              <th className="text-left px-3 py-2">Suscripciones</th>
              <th className="text-right px-3 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const subscriptions = u.company?.subscriptions ?? [];
              const latest = getLatestSubscription(subscriptions);

              return (
                <tr
                  key={u.id}
                  className="bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedUserId(u.id)}
                >
                  <td className="px-3 py-3 align-top">
                    <div className="min-w-[180px]">
                      <div className="font-semibold text-[#212121] dark:text-white">
                        {[u.name, u.lastName, u.secondLastName].filter(Boolean).join(" ")}
                      </div>
                      <div className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
                        {u.email ?? "—"}
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3 align-top">
                    <div className="min-w-[160px]">
                      <div className="font-medium text-[#212121] dark:text-white">
                        {u.company?.name ?? "—"}
                      </div>
                      <div className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
                        {latest?.planLeadLimit != null
                          ? `Límite: ${latest.planLeadLimit}`
                          : "—"}
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3 align-top">
                    {latest ? (
                      <div className="min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-center inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold ${
                              SUBSCRIPTION_STATUS_CLASSES[latest.status ?? ""] ??
                              "bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0]"
                            }`}
                          >
                            {SUBSCRIPTION_STATUS_OPTIONS.find((o) => o.value === latest.status)
                              ?.label ?? "Inactivo"}
                          </span>
                          <span className="font-semibold text-[#212121] dark:text-white">
                            {latest.planName ?? "—"}
                          </span>
                        </div>
                        <div className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
                          {latest.activatedAt
                            ? `${formatDateShort(latest.activatedAt, false)} → ${formatDateShort(
                                latest.currentPeriodEnd,false
                              )}`
                            : "—"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">Sin suscripción</span>
                    )}
                  </td>

                  <td className="px-3 py-3 align-top">
                    <span className="inline-flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 px-3 py-1 text-xs font-semibold text-[#212121] dark:text-white">
                      {subscriptions.length}
                    </span>
                  </td>

                  <td className="px-3 py-3 align-top">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUserId(u.id);
                        }}
                        className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] px-3 py-2 text-xs font-semibold text-[#212121] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        Ver / editar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-10 text-sm text-[#616161] dark:text-[#b0b0b0] text-center">
            No hay usuarios con rol de administrador de empresa.
          </div>
        )}
      </div>
    </div>
  );
}
