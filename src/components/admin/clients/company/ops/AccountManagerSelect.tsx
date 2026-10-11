"use client";

import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { formatPersonName } from "../../../ui";
import type { AdminPersonRef } from "../../clients-queries";
import {
  ADMIN_PLATFORM_USERS_QUERY,
  ADMIN_SET_ACCOUNT_MANAGER_MUTATION,
  type AdminOpsActionResult,
  type AdminPlatformUsersResponse,
} from "../../ops-queries";

/** Quién de Kadesh lleva la cuenta. Sirve para "Mis cuentas" en la lista de empresas. */
export default function AccountManagerSelect({
  companyId,
  manager,
  onChanged,
}: {
  companyId: string;
  manager: AdminPersonRef | null;
  onChanged: () => void;
}) {
  const { data } = useQuery<AdminPlatformUsersResponse>(ADMIN_PLATFORM_USERS_QUERY, {
    fetchPolicy: "cache-first",
  });
  const [setManager, { loading }] = useMutation<{
    adminSetCompanyAccountManager: AdminOpsActionResult;
  }>(ADMIN_SET_ACCOUNT_MANAGER_MUTATION);

  const options = data?.users ?? [];
  // Si el dueño actual ya no es admin, igual se muestra para no perderlo de vista.
  const showsCurrent = manager && !options.some((u) => u.id === manager.id);

  const change = async (userId: string) => {
    try {
      const { data: result } = await setManager({
        variables: { companyId, userId: userId || null },
      });
      const outcome = result?.adminSetCompanyAccountManager;
      if (!outcome?.success) {
        sileo.error({ title: outcome?.message ?? "No se pudo asignar la cuenta" });
        return;
      }
      sileo.success({ title: outcome.message });
      onChanged();
    } catch (error) {
      sileo.error({ title: error instanceof Error ? error.message : "No se pudo asignar la cuenta" });
    }
  };

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
        Dueño de cuenta en Kadesh
      </span>
      <select
        value={manager?.id ?? ""}
        disabled={loading}
        onChange={(e) => change(e.target.value)}
        className="h-11 w-full rounded-xl border border-[#e0e0e0] bg-white px-3 text-sm text-[#212121] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-60 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white cursor-pointer"
      >
        <option value="">Sin asignar</option>
        {showsCurrent ? (
          <option value={manager.id}>{formatPersonName(manager.name, manager.lastName)}</option>
        ) : null}
        {options.map((user) => (
          <option key={user.id} value={user.id}>
            {formatPersonName(user.name, user.lastName)}
          </option>
        ))}
      </select>
    </label>
  );
}
