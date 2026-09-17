"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { CallIcon, Mail01Icon } from "@hugeicons/core-free-icons";
import { formatDateShort } from "kadesh/utils/format-date";
import type { AdminPetPlaceRow } from "./types";
import {
  PET_PLACE_CLAIM_ROLE_LABELS,
  PET_PLACE_CLAIM_STATUS,
  PET_PLACE_CLAIM_STATUS_CLASSES,
  PET_PLACE_CLAIM_STATUS_LABELS,
} from "./constants";
import { AdminStatusBadge, formatPersonName } from "./ui";

export default function AdminPetPlaceReviewModal({
  isOpen,
  onClose,
  place,
  busy,
  onVerify,
  onReject,
  onUnverify,
}: {
  isOpen: boolean;
  onClose: () => void;
  place: AdminPetPlaceRow | null;
  busy: boolean;
  onVerify: () => Promise<void>;
  onReject: () => Promise<void>;
  onUnverify: () => Promise<void>;
}) {
  const isPending = place?.claimStatus === PET_PLACE_CLAIM_STATUS.PENDING;
  const isVerified = Boolean(place?.verified);

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
              {place ? (
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-[#212121] dark:text-white">
                    {place.name}
                  </h3>
                  <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
                    {[place.municipality, place.state]
                      .filter(Boolean)
                      .join(", ") || "Sin ubicación"}
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
                {!place ? (
                  <div className="space-y-3" aria-hidden>
                    <div className="h-8 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
                    <div className="h-24 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
                    <div className="h-24 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
                  </div>
                ) : (
                <>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge
                    label={
                      PET_PLACE_CLAIM_STATUS_LABELS[place.claimStatus ?? ""] ??
                      "Sin estado"
                    }
                    className={
                      PET_PLACE_CLAIM_STATUS_CLASSES[place.claimStatus ?? ""]
                    }
                  />
                  {isVerified ? (
                    <AdminStatusBadge
                      label="Verificada"
                      className="bg-green-500/15 text-green-700 dark:text-green-400"
                    />
                  ) : (
                    <AdminStatusBadge
                      label="No verificada"
                      className="bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0]"
                    />
                  )}
                </div>

                <section className="rounded-xl bg-[#fafafa] dark:bg-[#252525] p-4">
                  <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                    Quién la reclamó
                  </h4>
                  {place.user ? (
                    <div className="mt-2 space-y-1 text-sm text-[#424242] dark:text-[#e0e0e0]">
                      <p className="font-medium text-[#212121] dark:text-white">
                        {formatPersonName(place.user.name, place.user.lastName)}
                      </p>
                      {place.user.email ? (
                        <p className="flex items-center gap-2 break-all">
                          <HugeiconsIcon icon={Mail01Icon} size={14} />
                          {place.user.email}
                        </p>
                      ) : null}
                      {place.user.phone ? (
                        <p className="flex items-center gap-2">
                          <HugeiconsIcon icon={CallIcon} size={14} />
                          {place.user.phone}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
                      Nadie ha reclamado esta ficha.
                    </p>
                  )}
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <InfoRow
                    label="Rol declarado"
                    value={
                      PET_PLACE_CLAIM_ROLE_LABELS[place.claimRole ?? ""] ??
                      place.claimRole ??
                      "—"
                    }
                  />
                  <InfoRow
                    label="Teléfono del reclamo"
                    value={place.claimPhone || "—"}
                  />
                  <InfoRow
                    label="Solicitó"
                    value={formatDateShort(place.claimedAt, false)}
                  />
                  <InfoRow
                    label="Verificada"
                    value={formatDateShort(place.verifiedAt, false)}
                  />
                </section>

                <section>
                  <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                    Cómo lo comprueba
                  </h4>
                  <p className="mt-2 whitespace-pre-wrap rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] p-3 text-sm text-[#424242] dark:text-[#e0e0e0] min-h-16">
                    {place.claimNotes?.trim() || "No dejó notas."}
                  </p>
                </section>

                {place.phone || place.email ? (
                  <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                    Contacto público: {[place.phone, place.email]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}

                <div className="flex flex-col gap-2 pt-1 pb-2">
                  {isPending ? (
                    <>
                      <button
                        type="button"
                        disabled={busy || !place.user}
                        onClick={onVerify}
                        className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
                      >
                        {busy ? "Guardando..." : "Verificar ficha"}
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
                  ) : isVerified ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={onUnverify}
                      className="h-11 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] text-sm font-semibold disabled:opacity-60 cursor-pointer"
                    >
                      {busy ? "Guardando..." : "Quitar verificación"}
                    </button>
                  ) : place.user ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={onVerify}
                      className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
                    >
                      {busy ? "Guardando..." : "Marcar como verificada"}
                    </button>
                  ) : (
                    <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                      Esta ficha no tiene solicitante. Solo se verifica cuando alguien la reclamó.
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">{label}</p>
      <p className="mt-0.5 font-medium text-[#212121] dark:text-white">{value}</p>
    </div>
  );
}
