"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  ADMIN_PET_PLACE_SEARCH_QUERY,
  type AdminPetPlaceSearchRow,
} from "./queries";
import type { AdminPetPlaceServiceRow } from "./types";
import { PET_PLACE_SERVICE_STATUS } from "./constants";
import { AdminSearchInput, formatPersonName } from "./ui";
import { useDebouncedValue } from "./hooks/useDebouncedValue";

function placeLabel(place: {
  name?: string | null;
  municipality?: string | null;
  state?: string | null;
}) {
  const location = [place.municipality, place.state].filter(Boolean).join(", ");
  return location ? `${place.name ?? "Clínica"} · ${location}` : (place.name ?? "Clínica");
}

export default function AdminPetPlaceServiceReviewModal({
  isOpen,
  onClose,
  service,
  busy,
  onApprove,
  onReject,
}: {
  isOpen: boolean;
  onClose: () => void;
  service: AdminPetPlaceServiceRow | null;
  busy: boolean;
  onApprove: (placeId: string) => Promise<void>;
  onReject: () => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<AdminPetPlaceSearchRow | null>(
    null,
  );
  const debouncedSearch = useDebouncedValue(search, 250);
  const isPending = service?.status === PET_PLACE_SERVICE_STATUS.PENDING;

  useEffect(() => {
    if (!isOpen || !service) {
      setSearch("");
      setSelectedPlace(null);
      return;
    }
    setSearch("");
    setSelectedPlace(service.requestedFor ?? null);
  }, [isOpen, service]);

  const searchWhere = useMemo(() => {
    const q = debouncedSearch.trim();
    if (q.length < 2) return null;
    return {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { municipality: { contains: q, mode: "insensitive" as const } },
      ],
    };
  }, [debouncedSearch]);

  const { data: searchData, loading: searchLoading } = useQuery<{
    petPlaces: AdminPetPlaceSearchRow[];
  }>(ADMIN_PET_PLACE_SEARCH_QUERY, {
    variables: { where: searchWhere ?? {}, take: 12 },
    skip: !isOpen || !searchWhere,
    fetchPolicy: "network-only",
  });

  const results = searchData?.petPlaces ?? [];

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
          >
            <div
              className="bg-white dark:bg-[#1e1e1e] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-[#1e1e1e] px-4 sm:px-6 py-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] flex items-start justify-between gap-3">
                {service ? (
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-[#212121] dark:text-white">
                      {service.name ?? "Servicio"}
                    </h3>
                    <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
                      Pedido {formatDateShort(service.createdAt, false)}
                    </p>
                  </div>
                ) : (
                  <div className="h-12 w-48 rounded-lg bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 w-11 rounded-xl text-2xl text-[#616161] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] cursor-pointer"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <div className="px-4 sm:px-6 py-5 flex flex-col gap-4">
                {!service ? (
                  <div className="space-y-3" aria-hidden>
                    <div className="h-24 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
                  </div>
                ) : (
                  <>
                    <section className="rounded-xl bg-[#fafafa] dark:bg-[#252525] p-4">
                      <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                        Quién lo pidió
                      </h4>
                      <p className="mt-2 text-sm text-[#212121] dark:text-white">
                        {formatPersonName(
                          service.requestedBy?.name,
                          service.requestedBy?.lastName,
                        )}
                      </p>
                      {service.requestedBy?.email ? (
                        <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5 break-all">
                          {service.requestedBy.email}
                        </p>
                      ) : null}
                    </section>

                    <section>
                      <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                        Descripción
                      </h4>
                      <p className="mt-2 whitespace-pre-wrap rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] p-3 text-sm text-[#424242] dark:text-[#e0e0e0] min-h-16">
                        {service.description?.trim() || "No dejó descripción."}
                      </p>
                    </section>

                    {isPending ? (
                      <section>
                        <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                          Asignar a la ficha
                        </h4>
                        <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 mb-3">
                          Al aprobarlo entra al catálogo y se marca en esta clínica.
                        </p>
                        {selectedPlace ? (
                          <div className="rounded-xl border border-orange-200 dark:border-orange-800/60 bg-orange-50/70 dark:bg-orange-950/20 px-3 py-3 mb-3">
                            <p className="text-sm font-semibold text-[#212121] dark:text-white">
                              {selectedPlace.name ?? "Clínica"}
                            </p>
                            <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                              {[selectedPlace.municipality, selectedPlace.state]
                                .filter(Boolean)
                                .join(", ") || "Sin ubicación"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mb-3">
                            Elige la clínica a la que se va a conectar.
                          </p>
                        )}
                        <AdminSearchInput
                          value={search}
                          onChange={setSearch}
                          placeholder="Buscar otra clínica por nombre o municipio"
                        />
                        {searchWhere ? (
                          <ul className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                            {searchLoading ? (
                              <li className="px-3 py-3 text-sm text-[#616161] dark:text-[#b0b0b0]">
                                Buscando...
                              </li>
                            ) : results.length === 0 ? (
                              <li className="px-3 py-3 text-sm text-[#616161] dark:text-[#b0b0b0]">
                                No hay clínicas con ese nombre.
                              </li>
                            ) : (
                              results.map((place) => (
                                <li key={place.id}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedPlace(place);
                                      setSearch("");
                                    }}
                                    className="w-full text-left px-3 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                                  >
                                    {placeLabel(place)}
                                  </button>
                                </li>
                              ))
                            )}
                          </ul>
                        ) : null}
                      </section>
                    ) : null}

                    <div className="flex flex-col gap-2 pt-1 pb-2">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            disabled={busy || !selectedPlace?.id}
                            onClick={() =>
                              selectedPlace?.id
                                ? onApprove(selectedPlace.id)
                                : Promise.resolve()
                            }
                            className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
                          >
                            {busy ? "Guardando..." : "Aprobar y asignar a la ficha"}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={onReject}
                            className="h-11 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-semibold disabled:opacity-60 cursor-pointer"
                          >
                            Rechazar solicitud
                          </button>
                        </>
                      ) : (
                        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                          Esta solicitud ya se resolvió.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
