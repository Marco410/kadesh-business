"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { formatDateShort } from "kadesh/utils/format-date";
import { ADMIN_PAGE_SIZE, AUTH_STEP_LABELS } from "../../constants";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  AdminPagination,
  AdminStatusBadge,
  formatPersonName,
  surfaceClass,
} from "../../ui";
import {
  ADMIN_AUTH_LOGS_QUERY,
  type AdminAuthLogsResponse,
} from "../clients-queries";

/**
 * Historial de accesos (`UserAuthLog`): logins, registros e intentos fallidos.
 * Lo escribe el backend; no guarda IP ni dispositivo todavía.
 */
export default function AuthLogList({
  userId,
  companyId,
}: {
  userId?: string | null;
  companyId?: string | null;
}) {
  const [page, setPage] = useState(1);
  const where = useMemo(() => {
    if (userId) return { user: { id: { equals: userId } } };
    if (companyId) return { user: { company: { id: { equals: companyId } } } };
    return {};
  }, [userId, companyId]);

  const { data, loading, error } = useQuery<AdminAuthLogsResponse>(ADMIN_AUTH_LOGS_QUERY, {
    variables: { where, take: ADMIN_PAGE_SIZE, skip: (page - 1) * ADMIN_PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });
  const rows = data?.userAuthLogs ?? [];
  const total = data?.userAuthLogsCount ?? 0;
  const showPerson = !userId;

  if (error) return <AdminErrorState message="No se pudo cargar el historial de accesos." />;
  if (loading && rows.length === 0) return <AdminLoadingRows rows={5} />;
  if (rows.length === 0) {
    return (
      <AdminEmptyState
        title="Sin accesos registrados"
        description="Cada inicio de sesión, alta o intento fallido aparece aquí."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className={`${surfaceClass} divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]`}>
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#212121] dark:text-white">
                {AUTH_STEP_LABELS[row.step ?? ""] ?? row.step ?? "Acceso"}
                {!row.success ? (
                  <AdminStatusBadge
                    label="Falló"
                    className="ml-2 bg-red-500/15 px-2 py-0.5 text-red-700 dark:text-red-300"
                  />
                ) : null}
              </p>
              <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                {showPerson
                  ? row.user
                    ? formatPersonName(row.user.name, row.user.lastName)
                    : row.emailMasked
                  : null}
                {!row.success && row.message ? `${showPerson ? " · " : ""}${row.message}` : null}
              </p>
            </div>
            <time
              dateTime={row.createdAt}
              className="shrink-0 text-xs text-[#9e9e9e]"
            >
              {formatDateShort(row.createdAt, true)}
            </time>
          </li>
        ))}
      </ul>
      <AdminPagination
        totalCount={total}
        pageSize={ADMIN_PAGE_SIZE}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
}
