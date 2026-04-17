"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  COMPANY_USER_COMPANY_USERS_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
  type CompanyUserCompanyUsersResponse,
  type CompanyUserCompanyUsersVariables,
} from "kadesh/components/profile/sales/queries";
import { Role } from "kadesh/constants/constans";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { isAdminCompanyUser } from "kadesh/utils/user-roles";
import RoleAccessDeniedSection from "kadesh/components/profile/sales/RoleAccessDeniedSection";
import AddCompanyUserForm from "kadesh/components/profile/sales/workspaces/members/AddCompanyUserForm";

export default function AgregarUsuarioCompanySection() {
  const { user, loading: userLoading } = useUser();
  const userId = user?.id ?? "";
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  const { data: usersData, loading: listLoading } = useQuery<
    CompanyUserCompanyUsersResponse,
    CompanyUserCompanyUsersVariables
  >(COMPANY_USER_COMPANY_USERS_QUERY, {
    variables: {
      where: {
        company: companyId ? { id: { equals: companyId } } : undefined,
        roles: { some: { name: { equals: Role.USER_COMPANY } } },
      },
    },
    skip: !companyId,
    fetchPolicy: "cache-and-network",
  });

  const companyUsers = usersData?.users ?? [];

  const listRefetchQueries = useMemo(
    () =>
      companyId
        ? [
            {
              query: COMPANY_USER_COMPANY_USERS_QUERY,
              variables: {
                where: {
                  company: { id: { equals: companyId } },
                  roles: { some: { name: { equals: Role.USER_COMPANY } } },
                },
              },
            },
          ]
        : [],
    [companyId]
  );

  if (userLoading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center py-20">
        <span
          className="size-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
      </div>
    );
  }

  if (!isAdminCompanyUser(user)) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <RoleAccessDeniedSection
          title="No tienes acceso"
          description="Solo administradores de empresa pueden dar de alta usuarios con rol de empresa."
          backHref={`${Routes.panel}?tab=workspaces`}
          backLabel="Volver a Espacios"
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`${Routes.panel}?tab=workspaces`}
          className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Volver a Espacios
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AddCompanyUserForm
          companyId={companyId}
          editingId={editingId}
          onEditingIdChange={setEditingId}
          listRefetchQueries={listRefetchQueries}
        />

        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden">
          <h2 className="px-4 py-3 text-lg font-bold text-[#212121] dark:text-[#ffffff] bg-[#f5f5f5] dark:bg-[#2a2a2a] border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
            Usuarios empresa ({companyUsers.length})
          </h2>
          <div className="p-4">
            {!companyId ? (
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                Sin empresa asignada.
              </p>
            ) : listLoading && companyUsers.length === 0 ? (
              <div className="flex justify-center py-10">
                <span className="size-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : companyUsers.length === 0 ? (
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                Aún no hay usuarios con rol empresa. Crea uno con el formulario.
              </p>
            ) : (
              <ul className="space-y-3">
                {companyUsers.map((u) => (
                  <li
                    key={u.id}
                    className={`flex flex-wrap items-center justify-between gap-2 py-3 px-3 rounded-lg border ${
                      editingId === u.id
                        ? "border-orange-500 dark:border-orange-500 bg-orange-50/50 dark:bg-orange-900/10"
                        : "border-[#e8e8e8] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#212121] dark:text-[#ffffff] truncate">
                        {[u.name, u.lastName].filter(Boolean).join(" ") || "—"}
                      </p>
                      <p className="text-sm text-[#616161] dark:text-[#b0b0b0] truncate">
                        {u.email || "Sin correo"}
                      </p>
                      {u.phone && (
                        <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                          {u.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {user?.id === u.id && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-2 py-1 rounded">
                          Tú
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingId(u.id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-[#616161] dark:text-[#b0b0b0] hover:bg-[#eee] dark:hover:bg-[#333] hover:text-orange-500"
                        title="Editar"
                      >
                        <HugeiconsIcon icon={Edit02Icon} size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
