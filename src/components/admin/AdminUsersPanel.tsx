"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { Role } from "kadesh/constants/constans";
import { formatDateShort } from "kadesh/utils/format-date";
import { ADMIN_USERS_QUERY, type AdminUsersResponse } from "./queries";
import { ADMIN_PAGE_SIZE, ROLE_LABELS } from "./constants";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import AdminUserEditor from "./AdminUserEditor";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  AdminStatusBadge,
  formatPersonName,
  surfaceClass,
} from "./ui";

const ROLE_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "Todos" },
  { value: Role.ADMIN, label: ROLE_LABELS[Role.ADMIN] },
  { value: Role.ADMIN_COMPANY, label: ROLE_LABELS[Role.ADMIN_COMPANY] },
  { value: Role.VENDEDOR, label: ROLE_LABELS[Role.VENDEDOR] },
  { value: Role.USER_COMPANY, label: ROLE_LABELS[Role.USER_COMPANY] },
  { value: Role.USER, label: ROLE_LABELS[Role.USER] },
];

export default function AdminUsersPanel() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const closeEditor = useCallback(() => setSelectedId(null), []);
  const debouncedSearch = useDebouncedValue(search);

  const where = useMemo(() => {
    const filters: Record<string, unknown>[] = [];
    const q = debouncedSearch.trim();
    if (q) {
      filters.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    if (role !== "all") {
      filters.push({ roles: { some: { name: { equals: role } } } });
    }
    if (filters.length === 0) return {};
    if (filters.length === 1) return filters[0];
    return { AND: filters };
  }, [debouncedSearch, role]);

  const skip = (page - 1) * ADMIN_PAGE_SIZE;

  const { data, loading, error } = useQuery<AdminUsersResponse>(
    ADMIN_USERS_QUERY,
    {
      variables: { where, take: ADMIN_PAGE_SIZE, skip },
      fetchPolicy: "network-only",
    },
  );

  const users = data?.users ?? [];
  const totalCount = data?.usersCount ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <AdminUserEditor userId={selectedId} onClose={closeEditor} />
      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por nombre o correo"
        />
        <AdminFilterChips
          options={ROLE_FILTERS}
          value={role}
          onChange={(value) => {
            setRole(value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <AdminErrorState message="No se pudo cargar la lista de usuarios." />
      ) : loading && users.length === 0 ? (
        <AdminLoadingRows />
      ) : users.length === 0 ? (
        <AdminEmptyState
          title="No hay usuarios con ese filtro"
          description="Prueba otro rol o borra la búsqueda."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {users.map((user) => (
              <article key={user.id} className={surfaceClass}>
                <button
                  type="button"
                  onClick={() => setSelectedId(user.id)}
                  className="w-full p-4 text-left cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                <p className="font-semibold text-[#212121] dark:text-white">
                  {formatPersonName(user.name, user.lastName, user.secondLastName)}
                </p>
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-0.5 break-all">
                  {user.email ?? "Sin correo"}
                </p>
                <p className="text-sm text-[#212121] dark:text-white mt-2">
                  {user.company?.name ?? "Sin empresa"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(user.roles ?? []).map((r) => (
                    <AdminStatusBadge
                      key={`${user.id}-${r.name}`}
                      label={ROLE_LABELS[r.name] ?? r.name}
                      className="bg-black/5 dark:bg-white/10 text-[#424242] dark:text-[#e0e0e0]"
                    />
                  ))}
                </div>
                <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-3">
                  Alta {formatDateShort(user.createdAt, false)}
                  {user.lastLoginAt
                    ? ` · Último acceso ${formatDateShort(user.lastLoginAt, false)}`
                    : ""}
                </p>
                </button>
              </article>
            ))}
          </div>

          <div className={`${surfaceClass} hidden md:block overflow-x-auto`}>
            <table className="min-w-[860px] w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] border-b border-[#e8e8e8] dark:border-[#333]">
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Alta</th>
                  <th className="px-4 py-3">Último acceso</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedId(user.id)}
                    className="border-b border-[#f0f0f0] dark:border-[#2a2a2a] last:border-0 cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(user.id);
                        }}
                        className="text-left font-semibold text-[#212121] dark:text-white hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded"
                      >
                        {formatPersonName(
                          user.name,
                          user.lastName,
                          user.secondLastName,
                        )}
                      </button>
                      <div className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                        {user.email ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-1">
                        {(user.roles ?? []).length === 0 ? (
                          <span className="text-[#9e9e9e]">—</span>
                        ) : (
                          user.roles.map((r) => (
                            <AdminStatusBadge
                              key={`${user.id}-${r.name}`}
                              label={ROLE_LABELS[r.name] ?? r.name}
                              className="bg-black/5 dark:bg-white/10 text-[#424242] dark:text-[#e0e0e0]"
                            />
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-[#212121] dark:text-white">
                      {user.company?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-[#616161] dark:text-[#b0b0b0] whitespace-nowrap">
                      {formatDateShort(user.createdAt, false)}
                    </td>
                    <td className="px-4 py-3 align-top text-[#616161] dark:text-[#b0b0b0] whitespace-nowrap">
                      {formatDateShort(user.lastLoginAt, false)}
                    </td>
                  </tr>
                ))}
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
