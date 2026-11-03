"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DASH_EASE } from "kadesh/components/app-shell";
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
          <motion.div data-body-scroll-lock
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: DASH_EASE }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
          >
            <div
              className="bg-dash-surface rounded-t-3xl sm:rounded-3xl shadow-dash-lift font-dash text-dash-ink w-full max-w-xl max-h-[92vh] overflow-y-auto pointer-events-auto border border-dash-line"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-[1] bg-dash-surface/95 backdrop-blur px-4 sm:px-6 py-4 border-b border-dash-line flex items-start justify-between gap-3">
              {place ? (
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-dash-ink">
                    {place.name}
                  </h3>
                  <p className="text-sm text-dash-muted mt-1">
                    {[place.municipality, place.state]
                      .filter(Boolean)
                      .join(", ") || "Sin ubicación"}
                  </p>
                </div>
              ) : (
                <div className="h-12 w-48 rounded-lg dash-shimmer" />
              )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-ink cursor-pointer"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <div className="px-4 sm:px-6 py-5 flex flex-col gap-4">
                {!place ? (
                  <div className="space-y-3" aria-hidden>
                    <div className="h-8 rounded-xl dash-shimmer" />
                    <div className="h-24 rounded-xl dash-shimmer" />
                    <div className="h-24 rounded-xl dash-shimmer" />
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
                      className="bg-dash-surface-3 text-dash-muted"
                    />
                  )}
                </div>

                <section className="rounded-xl bg-dash-surface-2 p-4">
                  <h4 className="text-sm font-semibold text-dash-ink">
                    Quién la reclamó
                  </h4>
                  {place.user ? (
                    <div className="mt-2 space-y-1 text-sm text-dash-soft">
                      <p className="font-medium text-dash-ink">
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
                    <p className="mt-2 text-sm text-dash-muted">
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
                  <h4 className="text-sm font-semibold text-dash-ink">
                    Cómo lo comprueba
                  </h4>
                  <p className="mt-2 whitespace-pre-wrap rounded-xl border border-dash-line p-3 text-sm text-dash-soft min-h-16">
                    {place.claimNotes?.trim() || "No dejó notas."}
                  </p>
                </section>

                {place.phone || place.email ? (
                  <p className="text-xs text-dash-muted">
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
                        className="h-11 rounded-full dash-grad-accent hover:shadow-dash-accent-lift text-white text-sm font-semibold disabled:opacity-60 cursor-pointer shadow-dash-accent"
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
                      className="h-11 rounded-full border border-dash-line text-sm font-semibold disabled:opacity-60 cursor-pointer"
                    >
                      {busy ? "Guardando..." : "Quitar verificación"}
                    </button>
                  ) : place.user ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={onVerify}
                      className="h-11 rounded-full dash-grad-accent hover:shadow-dash-accent-lift text-white text-sm font-semibold disabled:opacity-60 cursor-pointer shadow-dash-accent"
                    >
                      {busy ? "Guardando..." : "Marcar como verificada"}
                    </button>
                  ) : (
                    <p className="text-sm text-dash-muted">
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
      <p className="text-xs text-dash-muted">{label}</p>
      <p className="mt-0.5 font-medium text-dash-ink">{value}</p>
    </div>
  );
}
