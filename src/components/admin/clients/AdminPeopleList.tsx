"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Role } from "kadesh/constants/constans";
import { formatDate, formatDateShort } from "kadesh/utils/format-date";
import { ADMIN_USERS_QUERY, type AdminUsersResponse } from "../queries";
import { ADMIN_PAGE_SIZE, ROLE_LABELS } from "../constants";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { useUrlSearch } from "../hooks/useUrlSearch";
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
} from "../ui";

const ROLE_FILTERS = [
  { value: "all", label: "Todos" },
  { value: Role.ADMIN, label: ROLE_LABELS[Role.ADMIN] },
  { value: Role.ADMIN_COMPANY, label: ROLE_LABELS[Role.ADMIN_COMPANY] },
  { value: Role.GERENCIA, label: ROLE_LABELS[Role.GERENCIA] },
  { value: Role.VENDEDOR, label: ROLE_LABELS[Role.VENDEDOR] },
  { value: Role.USER_COMPANY, label: ROLE_LABELS[Role.USER_COMPANY] },
  { value: Role.USER, label: ROLE_LABELS[Role.USER] },
];

const COMPANY_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "con", label: "Con empresa" },
  { value: "sin", label: "Sin empresa" },
] as const;

type CompanyFilter = (typeof COMPANY_FILTERS)[number]["value"];

const roleBadgeClass =
  "bg-black/5 dark:bg-white/10 text-[#424242] dark:text-[#e0e0e0]";

export default function AdminPeopleList() {
  const { searchParams, setParams } = useAdminNavigation();
  const search = useUrlSearch();
  const role = ROLE_FILTERS.find((r) => r.value === searchParams.get("rol"))?.value ?? "all";
  const companyFilter: CompanyFilter =
    COMPANY_FILTERS.find((f) => f.value === searchParams.get("conEmpresa"))?.value ?? "all";
  const page = Math.max(1, Number(searchParams.get("pagina")) || 1);

  const where = useMemo(() => {
    const filters: Record<string, unknown>[] = [];
    if (search.query) {
      filters.push({
        OR: [
          { name: { contains: search.query, mode: "insensitive" } },
          { lastName: { contains: search.query, mode: "insensitive" } },
          { email: { contains: search.query, mode: "insensitive" } },
          { company: { name: { contains: search.query, mode: "insensitive" } } },
        ],
      });
    }
    if (role !== "all") filters.push({ roles: { some: { name: { equals: role } } } });
    if (companyFilter === "sin") filters.push({ company: null });
    if (companyFilter === "con") filters.push({ NOT: [{ company: null }] });
    if (filters.length === 0) return {};
    if (filters.length === 1) return filters[0];
    return { AND: filters };
  }, [search.query, role, companyFilter]);

  const { data, loading, error } = useQuery<AdminUsersResponse>(ADMIN_USERS_QUERY, {
    variables: { where, take: ADMIN_PAGE_SIZE, skip: (page - 1) * ADMIN_PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });

  const users = data?.users ?? [];
  const totalCount = data?.usersCount ?? 0;

  // Con empresa → 360 de la empresa con la persona en foco. Sin empresa → su ficha.
  const openPerson = (userId: string, companyId: string | null | undefined) =>
    setParams(
      companyId
        ? { empresa: companyId, persona: userId, detalle: null, sub: null }
        : { usuario: userId },
      "push",
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search.value}
          onChange={search.setValue}
          placeholder="Buscar por nombre, correo o empresa"
        />
        <AdminFilterChips
          label="Rol"
          options={ROLE_FILTERS}
          value={role}
          onChange={(value) => setParams({ rol: value === "all" ? null : value, pagina: null })}
        />
        <AdminFilterChips
          label="Empresa"
          options={[...COMPANY_FILTERS]}
          value={companyFilter}
          onChange={(value) =>
            setParams({ conEmpresa: value === "all" ? null : value, pagina: null })
          }
        />
      </div>

      {error ? (
        <AdminErrorState message="No se pudo cargar la lista de personas." />
      ) : loading && users.length === 0 ? (
        <AdminLoadingRows />
      ) : users.length === 0 ? (
        <AdminEmptyState
          title="No hay personas con ese filtro"
          description="Prueba otro rol o borra la búsqueda."
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3 md:hidden">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => openPerson(user.id, user.company?.id)}
                  className={`${surfaceClass} w-full p-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400`}
                >
                  <p className="font-semibold text-[#212121] dark:text-white">
                    {formatPersonName(user.name, user.lastName, user.secondLastName)}
                  </p>
                  <p className="mt-0.5 break-all text-sm text-[#616161] dark:text-[#b0b0b0]">
                    {user.email ?? "Sin correo"}
                  </p>
                  <p className="mt-2 text-sm text-[#212121] dark:text-white">
                    {user.company?.name ?? "Sin empresa"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(user.roles ?? []).map((r) => (
                      <AdminStatusBadge
                        key={`${user.id}-${r.name}`}
                        label={ROLE_LABELS[r.name] ?? r.name}
                        className={roleBadgeClass}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[#616161] dark:text-[#b0b0b0]">
                    Alta {formatDateShort(user.createdAt, false)} ·{" "}
                    {user.lastLoginAt
                      ? `Último acceso ${formatDate(user.lastLoginAt)}`
                      : "Nunca ha entrado"}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          <div className={`${surfaceClass} relative hidden overflow-x-auto md:block`}>
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-[#e8e8e8] text-left text-xs uppercase tracking-wide text-[#616161] dark:border-[#333] dark:text-[#b0b0b0]">
                  <th className="px-4 py-3">Persona</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Alta</th>
                  <th className="px-4 py-3">Último acceso</th>
                  <th className="w-10 px-2 py-3">
                    <span className="sr-only">Abrir</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => openPerson(user.id, user.company?.id)}
                    className="cursor-pointer border-b border-[#f0f0f0] last:border-0 hover:bg-black/[0.03] dark:border-[#2a2a2a] dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPerson(user.id, user.company?.id);
                        }}
                        className="text-left font-semibold text-[#212121] hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded dark:text-white dark:hover:text-orange-400 cursor-pointer"
                      >
                        {formatPersonName(user.name, user.lastName, user.secondLastName)}
                      </button>
                      <div className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
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
                              className={roleBadgeClass}
                            />
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-[#212121] dark:text-white">
                      {user.company?.name ?? <span className="text-[#9e9e9e]">Sin empresa</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-[#616161] dark:text-[#b0b0b0]">
                      {formatDateShort(user.createdAt, false)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-[#616161] dark:text-[#b0b0b0]">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Nunca"}
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
            totalCount={totalCount}
            pageSize={ADMIN_PAGE_SIZE}
            currentPage={page}
            onPageChange={(next) => setParams({ pagina: next > 1 ? String(next) : null })}
          />
        </>
      )}
    </div>
  );
}
