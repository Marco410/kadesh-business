"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  ADMIN_OVERVIEW_QUERY,
  ADMIN_PET_PLACE_SERVICE_QUERY,
  ADMIN_PET_PLACE_SERVICES_QUERY,
  UPDATE_PET_PLACE_MUTATION,
  UPDATE_PET_PLACE_SERVICE_MUTATION,
  type AdminPetPlaceServicesResponse,
} from "./queries";
import {
  ADMIN_PAGE_SIZE,
  PET_PLACE_CLAIM_STATUS,
  PET_PLACE_SERVICE_STATUS,
  PET_PLACE_SERVICE_STATUS_CLASSES,
  PET_PLACE_SERVICE_STATUS_LABELS,
  PET_PLACE_SERVICE_STATUS_OPTIONS,
  type PetPlaceServiceStatus,
} from "./constants";
import type { AdminPetPlaceServiceRow } from "./types";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import AdminPetPlaceServiceReviewModal from "./AdminPetPlaceServiceReviewModal";
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
import { SUBSCRIPTION_STATUS } from "kadesh/constants/constans";

export default function AdminPetPlaceServicesPanel({
  initialServiceId,
  onConsumedInitialService,
}: {
  initialServiceId?: string | null;
  onConsumedInitialService?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PetPlaceServiceStatus | "all">(
    PET_PLACE_SERVICE_STATUS.PENDING,
  );
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const where = useMemo(() => {
    const filters: Record<string, unknown>[] = [];
    const q = debouncedSearch.trim();
    if (q) {
      filters.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          {
            requestedFor: { name: { contains: q, mode: "insensitive" } },
          },
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
  };

  const { data, loading, error, refetch } = useQuery<AdminPetPlaceServicesResponse>(
    ADMIN_PET_PLACE_SERVICES_QUERY,
    {
      variables: queryVariables,
      fetchPolicy: "network-only",
    },
  );

  const overviewVariables = {
    activeWhere: { status: { equals: SUBSCRIPTION_STATUS.ACTIVE } },
    pendingWhere: { claimStatus: { equals: PET_PLACE_CLAIM_STATUS.PENDING } },
    verifiedWhere: { verified: { equals: true } },
    pendingServiceWhere: {
      status: { equals: PET_PLACE_SERVICE_STATUS.PENDING },
    },
  };

  const [updateService] = useMutation(UPDATE_PET_PLACE_SERVICE_MUTATION, {
    refetchQueries: [
      { query: ADMIN_OVERVIEW_QUERY, variables: overviewVariables },
    ],
  });
  const [updatePetPlace] = useMutation(UPDATE_PET_PLACE_MUTATION);

  const { data: selectedData } = useQuery<{
    petPlaceService: AdminPetPlaceServiceRow | null;
  }>(ADMIN_PET_PLACE_SERVICE_QUERY, {
    variables: { id: selectedId },
    skip: !selectedId,
    fetchPolicy: "network-only",
  });

  const services = data?.petPlaceServices ?? [];
  const totalCount = data?.petPlaceServicesCount ?? 0;
  const selected =
    services.find((s) => s.id === selectedId) ??
    selectedData?.petPlaceService ??
    null;

  useEffect(() => {
    if (!initialServiceId) return;
    setSelectedId(initialServiceId);
    onConsumedInitialService?.();
  }, [initialServiceId, onConsumedInitialService]);

  async function runApprove(service: AdminPetPlaceServiceRow, placeId: string) {
    setBusyId(service.id);
    try {
      await updateService({
        variables: {
          where: { id: service.id },
          data: {
            status: PET_PLACE_SERVICE_STATUS.APPROVED,
            requestedFor: { connect: { id: placeId } },
          },
        },
      });
      await updatePetPlace({
        variables: {
          where: { id: placeId },
          data: { services: { connect: [{ id: service.id }] } },
        },
      });
      sileo.success({
        title: "Servicio aprobado y asignado a la ficha",
      });
      setSelectedId(null);
      await refetch();
    } catch (err) {
      sileo.error({
        title: "No se pudo aprobar el servicio",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function runReject(service: AdminPetPlaceServiceRow) {
    const confirmed = window.confirm(
      "¿Rechazar este servicio? No saldrá en el catálogo ni en la ficha.",
    );
    if (!confirmed) return;
    setBusyId(service.id);
    try {
      await updateService({
        variables: {
          where: { id: service.id },
          data: { status: PET_PLACE_SERVICE_STATUS.REJECTED },
        },
      });
      sileo.success({ title: "Solicitud rechazada" });
      setSelectedId(null);
      await refetch();
    } catch (err) {
      sileo.error({
        title: "No se pudo rechazar el servicio",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPetPlaceServiceReviewModal
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        service={selected}
        busy={busyId === selectedId}
        onApprove={(placeId) =>
          selected ? runApprove(selected, placeId) : Promise.resolve()
        }
        onReject={() => (selected ? runReject(selected) : Promise.resolve())}
      />

      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por servicio o clínica"
        />
        <AdminFilterChips
          label="Estado"
          options={PET_PLACE_SERVICE_STATUS_OPTIONS}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <AdminErrorState message="No se pudieron cargar los servicios." />
      ) : loading && services.length === 0 ? (
        <AdminLoadingRows />
      ) : services.length === 0 ? (
        <AdminEmptyState
          title="No hay servicios con ese filtro"
          description="Los pedidos de dueños verificados aparecen aquí para aprobarlos."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {services.map((service) => (
              <article key={service.id} className={`${surfaceClass} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#212121] dark:text-white">
                      {service.name ?? "Servicio"}
                    </p>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                      {service.requestedFor?.name ?? "Sin clínica"}
                    </p>
                  </div>
                  <AdminStatusBadge
                    label={
                      PET_PLACE_SERVICE_STATUS_LABELS[service.status ?? ""] ??
                      "Sin estado"
                    }
                    className={
                      PET_PLACE_SERVICE_STATUS_CLASSES[service.status ?? ""]
                    }
                  />
                </div>
                <p className="mt-3 text-sm text-[#424242] dark:text-[#e0e0e0]">
                  {formatPersonName(
                    service.requestedBy?.name,
                    service.requestedBy?.lastName,
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedId(service.id)}
                  className="mt-4 h-11 w-full rounded-xl bg-orange-500 text-white text-sm font-semibold cursor-pointer"
                >
                  Revisar
                </button>
              </article>
            ))}
          </div>

          <div className={`${surfaceClass} hidden md:block overflow-x-auto`}>
            <table className="min-w-[920px] w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] border-b border-[#e8e8e8] dark:border-[#333]">
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Clínica</th>
                  <th className="px-4 py-3">Quién lo pidió</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-[#f0f0f0] dark:border-[#2a2a2a] last:border-0"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-[#212121] dark:text-white">
                        {service.name ?? "Servicio"}
                      </div>
                      <div className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                        {formatDateShort(service.createdAt, false)}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {service.requestedFor ? (
                        <>
                          <div className="text-[#212121] dark:text-white">
                            {service.requestedFor.name}
                          </div>
                          <div className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                            {[
                              service.requestedFor.municipality,
                              service.requestedFor.state,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </div>
                        </>
                      ) : (
                        <span className="text-[#9e9e9e]">Sin clínica</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-[#212121] dark:text-white">
                        {formatPersonName(
                          service.requestedBy?.name,
                          service.requestedBy?.lastName,
                        )}
                      </div>
                      <div className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                        {service.requestedBy?.email ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <AdminStatusBadge
                        label={
                          PET_PLACE_SERVICE_STATUS_LABELS[service.status ?? ""] ??
                          "Sin estado"
                        }
                        className={
                          PET_PLACE_SERVICE_STATUS_CLASSES[service.status ?? ""]
                        }
                      />
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedId(service.id)}
                        className="h-11 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] px-4 text-xs font-semibold hover:border-orange-300 cursor-pointer"
                      >
                        Revisar
                      </button>
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
