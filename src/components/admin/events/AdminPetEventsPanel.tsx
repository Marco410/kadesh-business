"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, FavouriteIcon, Notification03Icon, UserMultipleIcon } from "@hugeicons/core-free-icons";
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
  formatPersonName,
  surfaceClass,
} from "../ui";
import { ADMIN_PET_EVENTS_QUERY, type AdminPetEventRow, type AdminPetEventsResponse } from "./queries";
import {
  ADMIN_EVENTS_PAGE_SIZE,
  PET_EVENT_CATEGORY_LABELS,
  PET_EVENT_STATUS,
  PET_EVENT_STATUS_FILTERS,
  PET_EVENT_STATUS_LABELS,
  PET_EVENT_STATUS_TONE,
  formatEventDate,
  type PetEventStatus,
} from "./constants";
import AdminPetEventReviewModal from "./AdminPetEventReviewModal";

const EMPTY_COPY: Record<PetEventStatus, { title: string; description: string }> = {
  [PET_EVENT_STATUS.PENDING]: {
    title: "No hay eventos por revisar",
    description: "Los eventos que manda la comunidad aparecen aquí antes de publicarse.",
  },
  [PET_EVENT_STATUS.APPROVED]: {
    title: "No hay eventos publicados",
    description: "Al aprobar uno sale en Kadesh Pet (web y app) y se avisa a la gente de la zona.",
  },
  [PET_EVENT_STATUS.REJECTED]: {
    title: "No hay eventos rechazados",
    description: "Quien publicó un evento rechazado recibe el motivo y puede corregirlo.",
  },
  [PET_EVENT_STATUS.CANCELLED]: {
    title: "No hay eventos cancelados",
    description: "Aquí quedan los que canceló quien los organiza o Kadesh.",
  },
};

function statusWhere(status: PetEventStatus, search: Record<string, unknown> | null) {
  const byStatus = { status: { equals: status } };
  return search ? { AND: [search, byStatus] } : byStatus;
}

function nextDateText(row: AdminPetEventRow): string {
  if (row.nextStartsAt) return `Próxima fecha: ${formatEventDate(row.nextStartsAt, row.timeZone)}`;
  if (row.lastEndsAt) return `Terminó: ${formatEventDate(row.lastEndsAt, row.timeZone)}`;
  return "Sin fechas";
}

function organizerText(row: AdminPetEventRow): string {
  const organizer = row.organizerName?.trim();
  if (organizer) return organizer;
  return row.user ? formatPersonName(row.user.name, row.user.lastName) : "Sin organizador";
}

/**
 * Kadesh Pet → Eventos: lo que publica la comunidad (campañas, jornadas, ferias de adopción…)
 * espera revisión aquí antes de salir en Kadesh Pet. Default Pendientes, con la fecha más cercana
 * primero; el resto, lo más reciente primero. El evento abierto vive en `?evento=` para que la
 * campana lleve directo a su revisión.
 */
export default function AdminPetEventsPanel() {
  const { searchParams, setParams } = useAdminNavigation();
  const selectedId = searchParams.get("evento");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PetEventStatus>(PET_EVENT_STATUS.PENDING);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const variables = useMemo(() => {
    const q = debouncedSearch.trim();
    const searchWhere = q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { organizerName: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { state: { contains: q, mode: "insensitive" } },
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : null;
    return {
      where: statusWhere(status, searchWhere),
      // Pendientes: la fecha más cercana primero (es lo que urge revisar). El resto: lo más nuevo.
      orderBy: status === PET_EVENT_STATUS.PENDING ? [{ firstStartsAt: "asc" }] : [{ createdAt: "desc" }],
      take: ADMIN_EVENTS_PAGE_SIZE,
      skip: (page - 1) * ADMIN_EVENTS_PAGE_SIZE,
      pendingWhere: statusWhere(PET_EVENT_STATUS.PENDING, searchWhere),
      approvedWhere: statusWhere(PET_EVENT_STATUS.APPROVED, searchWhere),
      rejectedWhere: statusWhere(PET_EVENT_STATUS.REJECTED, searchWhere),
      cancelledWhere: statusWhere(PET_EVENT_STATUS.CANCELLED, searchWhere),
    };
  }, [debouncedSearch, page, status]);

  const { data, loading, error, refetch } = useQuery<AdminPetEventsResponse>(ADMIN_PET_EVENTS_QUERY, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  const rows = data?.petEvents ?? [];
  const total = data?.total ?? 0;
  const counts: Record<PetEventStatus, number | null> = {
    [PET_EVENT_STATUS.PENDING]: data?.pending ?? null,
    [PET_EVENT_STATUS.APPROVED]: data?.approved ?? null,
    [PET_EVENT_STATUS.REJECTED]: data?.rejected ?? null,
    [PET_EVENT_STATUS.CANCELLED]: data?.cancelled ?? null,
  };
  const empty = debouncedSearch.trim()
    ? { title: "Sin resultados", description: "Ningún evento coincide con la búsqueda." }
    : EMPTY_COPY[status];

  const setSelected = (id: string | null) => setParams({ evento: id });

  return (
    <div className="flex flex-col gap-4">
      <AdminPetEventReviewModal
        eventId={selectedId}
        onClose={() => setSelected(null)}
        onChanged={() => void refetch()}
      />

      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por evento, organizador, municipio o quién lo publicó"
        />
        <AdminFilterChips
          label="Estado"
          options={PET_EVENT_STATUS_FILTERS.map((option) => ({ ...option, count: counts[option.value] }))}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <AdminErrorState message="No se pudieron cargar los eventos." />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows rows={6} />
      ) : rows.length === 0 ? (
        <AdminEmptyState icon={Calendar03Icon} title={empty.title} description={empty.description} />
      ) : (
        <ul className={`${surfaceClass} divide-y divide-dash-line`}>
          {rows.map((row) => {
            const rowStatus = row.status ?? "";
            const cover = row.multimedia?.[0]?.image?.url ?? null;
            const isPending = rowStatus === PET_EVENT_STATUS.PENDING;
            const isApproved = rowStatus === PET_EVENT_STATUS.APPROVED;
            return (
              <li key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setSelected(row.id)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="size-14 shrink-0 rounded-xl object-cover" loading="lazy" />
                  ) : (
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-dash-surface-2 text-dash-faint">
                      <HugeiconsIcon icon={Calendar03Icon} size={22} />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold text-dash-ink">{row.title ?? "Evento"}</span>
                      <AdminStatusBadge
                        label={PET_EVENT_STATUS_LABELS[rowStatus] ?? "Sin estado"}
                        tone={PET_EVENT_STATUS_TONE[rowStatus] ?? "neutral"}
                      />
                      {isPending && row.pendingChangeNotice ? (
                        <AdminStatusBadge label="Cambió fechas o lugar" tone="accent" />
                      ) : isPending && row.approvedAt ? (
                        <AdminStatusBadge label="Editado" tone="accent" />
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-dash-muted">
                      {[
                        PET_EVENT_CATEGORY_LABELS[row.category ?? ""] ?? row.category,
                        [row.city, row.state].filter(Boolean).join(", "),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-dash-faint">
                      {nextDateText(row)} · {organizerText(row)}
                    </span>
                  </span>
                </button>

                {isApproved ? (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dash-muted">
                    <span className="inline-flex items-center gap-1" title="Me interesa">
                      <HugeiconsIcon icon={FavouriteIcon} size={14} /> {row.interestedCount ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1" title="Asistirán">
                      <HugeiconsIcon icon={UserMultipleIcon} size={14} /> {row.goingCount ?? 0}
                    </span>
                    {row.zoneAlertsSentAt ? (
                      <span className="inline-flex items-center gap-1" title="Avisos a la gente de la zona">
                        <HugeiconsIcon icon={Notification03Icon} size={14} /> Avisó a{" "}
                        {(row.zoneAlertsCount ?? 0).toLocaleString("es-MX")}
                      </span>
                    ) : null}
                  </div>
                ) : null}

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
        totalCount={total}
        pageSize={ADMIN_EVENTS_PAGE_SIZE}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
}
