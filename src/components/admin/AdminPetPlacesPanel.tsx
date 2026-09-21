"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import {
  ADMIN_OVERVIEW_QUERY,
  ADMIN_PET_PLACE_QUERY,
  ADMIN_PET_PLACES_QUERY,
  UPDATE_PET_PLACE_MUTATION,
  VERIFY_PET_PLACE_MUTATION,
  type AdminPetPlacesResponse,
} from "./queries";
import {
  ADMIN_PAGE_SIZE,
  PET_PLACE_CLAIM_STATUS,
  PET_PLACE_CLAIM_STATUS_CLASSES,
  PET_PLACE_CLAIM_STATUS_LABELS,
  PET_PLACE_CLAIM_STATUS_OPTIONS,
  PET_PLACE_SERVICE_STATUS,
  type PetPlaceClaimStatus,
} from "./constants";
import type { AdminPetPlaceRow } from "./types";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import AdminPetPlaceReviewModal from "./AdminPetPlaceReviewModal";
import AdminPetPlaceServicesPanel from "./AdminPetPlaceServicesPanel";
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
import { cn } from "kadesh/utils/cn";

export type PetPlacesVista = "fichas" | "servicios";

export default function AdminPetPlacesPanel({
  initialPlaceId,
  onConsumedInitialPlace,
  vista = "fichas",
  onVistaChange,
  initialServiceId,
  onConsumedInitialService,
}: {
  initialPlaceId?: string | null;
  onConsumedInitialPlace?: () => void;
  vista?: PetPlacesVista;
  onVistaChange?: (vista: PetPlacesVista) => void;
  initialServiceId?: string | null;
  onConsumedInitialService?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PetPlaceClaimStatus | "all">("all");
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
          { municipality: { contains: q, mode: "insensitive" } },
          { state: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    if (status !== "all") {
      filters.push({ claimStatus: { equals: status } });
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

  const { data, loading, error, refetch } = useQuery<AdminPetPlacesResponse>(
    ADMIN_PET_PLACES_QUERY,
    {
      variables: queryVariables,
      fetchPolicy: "network-only",
      skip: vista === "servicios",
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

  const [verifyPetPlace] = useMutation(VERIFY_PET_PLACE_MUTATION, {
    refetchQueries: [{ query: ADMIN_OVERVIEW_QUERY, variables: overviewVariables }],
  });
  const [updatePetPlace] = useMutation(UPDATE_PET_PLACE_MUTATION, {
    refetchQueries: [{ query: ADMIN_OVERVIEW_QUERY, variables: overviewVariables }],
  });

  const { data: selectedData } = useQuery<{ petPlace: AdminPetPlaceRow | null }>(
    ADMIN_PET_PLACE_QUERY,
    {
      variables: { id: selectedId },
      skip: !selectedId,
      fetchPolicy: "network-only",
    },
  );

  const places = data?.petPlaces ?? [];
  const totalCount = data?.petPlacesCount ?? 0;
  const selected =
    places.find((p) => p.id === selectedId) ??
    selectedData?.petPlace ??
    null;

  useEffect(() => {
    if (!initialPlaceId) return;
    setSelectedId(initialPlaceId);
    onConsumedInitialPlace?.();
  }, [initialPlaceId, onConsumedInitialPlace]);

  async function runVerify(place: AdminPetPlaceRow, approved: boolean) {
    if (!approved) {
      const confirmed = window.confirm(
        "¿Rechazar esta solicitud? La ficha vuelve a quedar disponible y se suelta al solicitante.",
      );
      if (!confirmed) return;
    }
    setBusyId(place.id);
    try {
      const { data: result } = await verifyPetPlace({
        variables: { input: { petPlaceId: place.id, approved } },
      });
      const payload = result?.verifyPetPlace;
      if (!payload?.success) {
        sileo.error({
          title: approved ? "No se pudo verificar" : "No se pudo rechazar",
          description: payload?.message ?? "Intenta de nuevo.",
        });
        return;
      }
      sileo.success({ title: payload.message });
      setSelectedId(null);
      await refetch();
    } catch (err) {
      sileo.error({
        title: "No se pudo actualizar la ficha",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function runUnverify(place: AdminPetPlaceRow) {
    const confirmed = window.confirm(
      "¿Quitar la verificación? El dueño dejará de poder editar la ficha hasta que la apruebes otra vez.",
    );
    if (!confirmed) return;
    setBusyId(place.id);
    try {
      await updatePetPlace({
        variables: {
          where: { id: place.id },
          data: { verified: false },
        },
      });
      sileo.success({ title: "Se quitó la verificación" });
      setSelectedId(null);
      await refetch();
    } catch (err) {
      sileo.error({
        title: "No se pudo quitar la verificación",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(
          [
            { id: "fichas" as const, label: "Fichas" },
            { id: "servicios" as const, label: "Servicios" },
          ] as const
        ).map((item) => {
          const selected = item.id === vista;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onVistaChange?.(item.id)}
              className={cn(
                "h-11 rounded-xl px-4 text-sm font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
                selected
                  ? "bg-orange-500 text-white"
                  : "border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] text-[#424242] dark:text-[#e0e0e0]",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {vista === "servicios" ? (
        <AdminPetPlaceServicesPanel
          initialServiceId={initialServiceId}
          onConsumedInitialService={onConsumedInitialService}
        />
      ) : (
    <div className="flex flex-col gap-4">
      <AdminPetPlaceReviewModal
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        place={selected}
        busy={busyId === selectedId}
        onVerify={() => (selected ? runVerify(selected, true) : Promise.resolve())}
        onReject={() => (selected ? runVerify(selected, false) : Promise.resolve())}
        onUnverify={() => (selected ? runUnverify(selected) : Promise.resolve())}
      />

      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por nombre o municipio"
        />
        <AdminFilterChips
          options={PET_PLACE_CLAIM_STATUS_OPTIONS}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <AdminErrorState message="No se pudieron cargar las veterinarias." />
      ) : loading && places.length === 0 ? (
        <AdminLoadingRows />
      ) : places.length === 0 ? (
        <AdminEmptyState
          title="No hay fichas con ese filtro"
          description="Cambia el estado o busca por el nombre de la clínica."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {places.map((place) => (
              <article key={place.id} className={`${surfaceClass} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#212121] dark:text-white">
                      {place.name}
                    </p>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                      {[place.municipality, place.state]
                        .filter(Boolean)
                        .join(", ") || "Sin ubicación"}
                    </p>
                  </div>
                  <AdminStatusBadge
                    label={
                      PET_PLACE_CLAIM_STATUS_LABELS[place.claimStatus ?? ""] ??
                      "Sin estado"
                    }
                    className={
                      PET_PLACE_CLAIM_STATUS_CLASSES[place.claimStatus ?? ""]
                    }
                  />
                </div>
                <p className="mt-3 text-sm text-[#424242] dark:text-[#e0e0e0]">
                  {place.user
                    ? formatPersonName(place.user.name, place.user.lastName)
                    : "Sin solicitante"}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedId(place.id)}
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
                  <th className="px-4 py-3">Clínica</th>
                  <th className="px-4 py-3">Solicitante</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Verificada</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => (
                  <tr
                    key={place.id}
                    className="border-b border-[#f0f0f0] dark:border-[#2a2a2a] last:border-0"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-[#212121] dark:text-white">
                        {place.name}
                      </div>
                      <div className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                        {[place.municipality, place.state]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {place.user ? (
                        <>
                          <div className="text-[#212121] dark:text-white">
                            {formatPersonName(
                              place.user.name,
                              place.user.lastName,
                            )}
                          </div>
                          <div className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                            {place.user.email ?? "—"}
                          </div>
                        </>
                      ) : (
                        <span className="text-[#9e9e9e]">Sin solicitante</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <AdminStatusBadge
                        label={
                          PET_PLACE_CLAIM_STATUS_LABELS[place.claimStatus ?? ""] ??
                          "Sin estado"
                        }
                        className={
                          PET_PLACE_CLAIM_STATUS_CLASSES[place.claimStatus ?? ""]
                        }
                      />
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-[#212121] dark:text-white">
                      {place.verified ? "Sí" : "No"}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedId(place.id)}
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
      )}
    </div>
  );
}
