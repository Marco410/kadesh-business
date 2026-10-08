"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Edit02Icon,
  Search01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import RoleAccessDeniedSection from "kadesh/components/profile/sales/RoleAccessDeniedSection";
import UserEditorForm from "kadesh/components/profile/usuarios/UserEditorForm";
import {
  COMPANY_USERS_MANAGE_QUERY,
  type CompanyUserManageRow,
  type CompanyUsersManageResponse,
  type CompanyUsersManageVariables,
} from "kadesh/components/profile/usuarios/queries";
import {
  ASSIGNABLE_ROLE_LABELS,
  normalizePermissions,
  type AssignableCompanyRole,
} from "kadesh/components/profile/usuarios/permissions";
import { ROLE_LABELS } from "kadesh/components/admin/constants";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { cn } from "kadesh/utils/cn";
import {
  canManageCompanyUsers,
  isAdminCompanyUser,
  isGerenciaUser,
  isProtectedCompanyUser,
} from "kadesh/utils/user-roles";

function formatName(user: CompanyUserManageRow): string {
  return [user.name, user.lastName].filter(Boolean).join(" ") || "Sin nombre";
}

function initials(user: CompanyUserManageRow): string {
  const a = user.name?.trim()?.[0] ?? "";
  const b = user.lastName?.trim()?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function roleLabels(user: CompanyUserManageRow): string {
  const labels = (user.roles ?? [])
    .map((r) => ROLE_LABELS[r.name] ?? r.name)
    .filter(Boolean);
  return labels.length > 0 ? labels.join(", ") : "Sin rol";
}

export default function UsuariosSection() {
  const { user, loading: userLoading } = useUser();
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingUser, setEditingUser] = useState<CompanyUserManageRow | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState("");

  const { data: companyData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: user?.id ?? "" } },
    skip: !user?.id,
  });
  const companyId = companyData?.user?.company?.id ?? null;

  const {
    data: usersData,
    loading: listLoading,
    refetch,
  } = useQuery<CompanyUsersManageResponse, CompanyUsersManageVariables>(
    COMPANY_USERS_MANAGE_QUERY,
    {
      variables: {
        where: {
          company: companyId ? { id: { equals: companyId } } : undefined,
        },
      },
      skip: !companyId,
      fetchPolicy: "cache-and-network",
    },
  );

  const canManage = canManageCompanyUsers(user);
  const isGerenciaOnly = isGerenciaUser(user) && !isAdminCompanyUser(user);

  const users = useMemo(() => {
    const rows = usersData?.users ?? [];
    if (!isGerenciaOnly) return rows;
    return rows.filter((row) => !isProtectedCompanyUser(row));
  }, [usersData?.users, isGerenciaOnly]);

  const filteredUsers = useMemo(() => {
    const q = normalizeSearch(searchInput);
    if (!q) return users;
    return users.filter((row) => {
      const hay = normalizeSearch(
        [formatName(row), row.email ?? "", roleLabels(row)].join(" "),
      );
      return hay.includes(q);
    });
  }, [users, searchInput]);

  if (userLoading) {
    return (
      <div className="flex justify-center py-20">
        <span
          className="size-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  if (!canManage) {
    return (
      <RoleAccessDeniedSection
        title="Solo administración y Gerencia gestionan usuarios"
        description="Pide acceso al administrador de tu empresa si necesitas agregar personas o cambiar permisos."
        backHref={`${Routes.panel}?tab=inicio`}
        backLabel="Volver al inicio"
      />
    );
  }

  if (!companyId) {
    return (
      <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8 shadow-sm">
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          Asocia una empresa a tu cuenta para gestionar usuarios.
        </p>
      </div>
    );
  }

  if (mode === "create" || mode === "edit") {
    return (
      <UserEditorForm
        companyId={companyId}
        editingUser={mode === "edit" ? editingUser : null}
        onCancel={() => {
          setMode("list");
          setEditingUser(null);
        }}
        onDone={() => {
          setMode("list");
          setEditingUser(null);
        }}
        listRefetch={refetch}
      />
    );
  }

  return (
    <div className="space-y-5" data-tour="usuarios-section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
              <HugeiconsIcon icon={UserMultiple02Icon} size={22} />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[#212121] dark:text-white">
                Usuarios
                {!listLoading || users.length > 0 ? (
                  <span className="ml-2 text-base font-semibold text-[#9e9e9e] dark:text-[#7a7a7a]">
                    ({filteredUsers.length}
                    {searchInput.trim() ? ` de ${users.length}` : ""})
                  </span>
                ) : null}
              </h2>
              <p className="mt-0.5 text-sm text-[#616161] dark:text-[#b0b0b0]">
                Personas de tu empresa, roles y acceso a módulos.
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]">
              <HugeiconsIcon icon={Search01Icon} size={18} />
            </span>
            <input
              type="search"
              placeholder="Buscar por nombre o correo…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full min-h-11 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] py-2.5 pl-10 pr-3 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Buscar usuarios"
            />
          </div>
          <button
            type="button"
            data-tour="usuarios-add"
            onClick={() => {
              setEditingUser(null);
              setMode("create");
            }}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#121212]"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} />
            Nuevo usuario
          </button>
        </div>
      </div>

      {listLoading && users.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl bg-[#ececec] dark:bg-[#1e1e1e]"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d0d0d0] dark:border-[#444] bg-white dark:bg-[#1e1e1e] px-6 py-12 text-center shadow-sm">
          <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
            <HugeiconsIcon icon={UserMultiple02Icon} size={28} />
          </span>
          <p className="text-lg font-semibold text-[#212121] dark:text-white">
            Aún no hay usuarios
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#616161] dark:text-[#b0b0b0]">
            Crea el primero para asignarle rol, permisos y sumarlo a un espacio
            de trabajo.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingUser(null);
              setMode("create");
            }}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} />
            Crear usuario
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-6 py-10 text-center shadow-sm">
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
            Nadie coincide con &quot;{searchInput.trim()}&quot;.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((row) => {
            const protectedUser = isProtectedCompanyUser(row);
            const canEdit =
              isAdminCompanyUser(user) ||
              (!protectedUser && isGerenciaUser(user));
            const perms = normalizePermissions(row.permissions);
            const assignableRoles = (row.roles ?? [])
              .map((r) => r.name)
              .filter((name): name is AssignableCompanyRole =>
                name in ASSIGNABLE_ROLE_LABELS,
              );
            const isSelf = row.id === user?.id;

            return (
              <li key={row.id}>
                <article
                  className={cn(
                    "flex h-full flex-col rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm transition-colors",
                    canEdit &&
                      "hover:border-orange-500/40 dark:hover:border-orange-500/40",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-bold text-white"
                      aria-hidden
                    >
                      {initials(row)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#212121] dark:text-white">
                            {formatName(row)}
                            {isSelf ? (
                              <span className="ml-1.5 text-xs font-medium text-[#9e9e9e]">
                                (tú)
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-[#616161] dark:text-[#b0b0b0]">
                            {row.email ?? "Sin correo"}
                          </p>
                        </div>
                        {canEdit ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(row);
                              setMode("edit");
                            }}
                            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0] hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400"
                            aria-label={`Editar ${formatName(row)}`}
                          >
                            <HugeiconsIcon icon={Edit02Icon} size={18} />
                          </button>
                        ) : (
                          <span className="shrink-0 rounded-full bg-[#f3f3f3] px-2 py-1 text-[11px] font-medium text-[#616161] dark:bg-[#2a2a2a] dark:text-[#9e9e9e]">
                            Protegido
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {assignableRoles.length > 0 ? (
                      assignableRoles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-700 dark:text-orange-300"
                        >
                          {ASSIGNABLE_ROLE_LABELS[role]}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-[#f3f3f3] px-2.5 py-1 text-xs font-medium text-[#616161] dark:bg-[#2a2a2a] dark:text-[#9e9e9e]">
                        {roleLabels(row)}
                      </span>
                    )}
                  </div>

                  <p className="mt-auto pt-3 text-xs text-[#9e9e9e] dark:text-[#7a7a7a]">
                    {perms
                      ? `${perms.length} permiso${perms.length === 1 ? "" : "s"} asignado${perms.length === 1 ? "" : "s"}`
                      : "Acceso por rol (sin lista)"}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
