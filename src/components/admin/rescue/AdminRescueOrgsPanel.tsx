"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { CharityIcon } from "@hugeicons/core-free-icons";
import { formatDateShort } from "kadesh/utils/format-date";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  AdminStatusBadge,
  surfaceClass,
} from "../ui";
import AdminRescueOrgReviewModal from "./AdminRescueOrgReviewModal";
import {
  ADMIN_RESCUE_PAGE_SIZE,
  RESCUE_ORG_FILTERS,
  RESCUE_ORG_STATUS,
  RESCUE_ORG_STATUS_LABELS,
  RESCUE_ORG_STATUS_TONE,
  RESCUE_ORG_TYPE_LABELS,
  rescueStatusWhere,
  type RescueOrgFilter,
} from "./constants";
import { ADMIN_RESCUE_ORGS_QUERY, type AdminRescueOrgsResponse } from "./queries";

const EMPTY_COPY: Record<RescueOrgFilter, { title: string; description: string }> = {
  pending: {
    title: "No hay espacios por verificar",
    description: "Cuando alguien activa su espacio de rescate aparece aquí. Suelen escribir por WhatsApp para validarse.",
  },
  verified: {
    title: "No hay espacios verificados",
    description: "Al verificar uno, su perfil público aparece en /organizaciones y sus animales muestran «Publicado por».",
  },
  allies: {
    title: "No hay aliados",
    description: "Marca como aliados a los espacios verificados que quieras destacar en la portada y en /aliados.",
  },
  rejected: {
    title: "No hay espacios rechazados",
    description: "Quien es rechazado ve el motivo en su panel.",
  },
  suspended: {
    title: "No hay espacios suspendidos",
    description: "Un espacio suspendido deja de verse en público, pero su equipo conserva el panel.",
  },
};

function searchWhere(q: string) {
  if (!q) return null;
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { state: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { whatsapp: { contains: q } },
    ],
  };
}

function withSearch(where: Record<string, unknown>, search: Record<string, unknown> | null) {
  return search ? { AND: [search, where] } : where;
}

/**
 * Kadesh Pet → Espacios de rescate: verificar a rescatistas, refugios y colectivos que activaron
 * su espacio, rechazarlos o suspenderlos con motivo, y marcar aliados. Default «En revisión», lo
 * más nuevo primero. El espacio abierto vive en `?espacio=` para enlazarlo directo.
 */
export default function AdminRescueOrgsPanel() {
  const { searchParams, setParams } = useAdminNavigation();
  const selectedId = searchParams.get("espacio");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RescueOrgFilter>(RESCUE_ORG_STATUS.PENDING);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const variables = useMemo(() => {
    const q = searchWhere(debouncedSearch.trim());
    return {
      where: withSearch(rescueStatusWhere(filter), q),
      take: ADMIN_RESCUE_PAGE_SIZE,
      skip: (page - 1) * ADMIN_RESCUE_PAGE_SIZE,
      pendingWhere: withSearch(rescueStatusWhere(RESCUE_ORG_STATUS.PENDING), q),
      verifiedWhere: withSearch(rescueStatusWhere(RESCUE_ORG_STATUS.VERIFIED), q),
      alliesWhere: withSearch(rescueStatusWhere("allies"), q),
      rejectedWhere: withSearch(rescueStatusWhere(RESCUE_ORG_STATUS.REJECTED), q),
      suspendedWhere: withSearch(rescueStatusWhere(RESCUE_ORG_STATUS.SUSPENDED), q),
    };
  }, [debouncedSearch, filter, page]);

  const { data, loading, error, refetch } = useQuery<AdminRescueOrgsResponse>(ADMIN_RESCUE_ORGS_QUERY, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  const rows = data?.rescueOrganizations ?? [];
  const counts: Record<RescueOrgFilter, number | null> = {
    pending: data?.pending ?? null,
    verified: data?.verified ?? null,
    allies: data?.allies ?? null,
    rejected: data?.rejected ?? null,
    suspended: data?.suspended ?? null,
  };
  const empty = debouncedSearch.trim()
    ? { title: "Sin resultados", description: "Ningún espacio coincide con la búsqueda." }
    : EMPTY_COPY[filter];
  const setSelected = (id: string | null) => setParams({ espacio: id });

  return (
    <div className="flex flex-col gap-4">
      <AdminRescueOrgReviewModal orgId={selectedId} onClose={() => setSelected(null)} onChanged={() => void refetch()} />

      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por nombre, municipio, correo o WhatsApp"
        />
        <AdminFilterChips
          label="Estado"
          options={RESCUE_ORG_FILTERS.map((option) => ({ ...option, count: counts[option.value] }))}
          value={filter}
          onChange={(value) => {
            setFilter(value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <AdminErrorState message="No se pudieron cargar los espacios de rescate." />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows rows={6} />
      ) : rows.length === 0 ? (
        <AdminEmptyState icon={CharityIcon} title={empty.title} description={empty.description} />
      ) : (
        <ul className={`${surfaceClass} divide-y divide-dash-line`}>
          {rows.map((row) => {
            const status = row.status ?? "";
            const isPending = status === RESCUE_ORG_STATUS.PENDING;
            const logo = row.logo?.url ?? null;
            return (
              <li key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setSelected(row.id)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                >
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="size-14 shrink-0 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-dash-surface-2 text-dash-faint">
                      <HugeiconsIcon icon={CharityIcon} size={22} />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold text-dash-ink">{row.name}</span>
                      <AdminStatusBadge
                        label={RESCUE_ORG_STATUS_LABELS[status] ?? "Sin estado"}
                        tone={RESCUE_ORG_STATUS_TONE[status] ?? "neutral"}
                      />
                      {row.isAlly ? <AdminStatusBadge label="Aliado" tone="accent" /> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-dash-muted">
                      {[RESCUE_ORG_TYPE_LABELS[row.type ?? ""] ?? row.type, [row.city, row.state].filter(Boolean).join(", ")]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-dash-faint">
                      {[
                        row.createdAt ? `Activó el ${formatDateShort(row.createdAt, false)}` : null,
                        `${(row.membersCount ?? 0).toLocaleString("es-MX")} en el equipo`,
                        `${(row.publishedCount ?? 0).toLocaleString("es-MX")} publicados`,
                        row.adoptedCount ? `${row.adoptedCount.toLocaleString("es-MX")} adoptados` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </button>
                <AdminButton
                  variant={isPending ? "dark" : "outline"}
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setSelected(row.id)}
                >
                  {isPending ? "Revisar" : "Ver"}
                </AdminButton>
              </li>
            );
          })}
        </ul>
      )}

      <AdminPagination
        totalCount={data?.total ?? 0}
        pageSize={ADMIN_RESCUE_PAGE_SIZE}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
}
