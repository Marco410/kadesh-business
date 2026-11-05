"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  InformationCircleIcon,
  LinkSquare02Icon,
  MapsLocation01Icon,
  Notification03Icon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { cn } from "kadesh/utils/cn";
import { formatDateShort } from "kadesh/utils/format-date";
import { useApplyOnKeyChange } from "kadesh/utils/useApplyOnKeyChange";
import { petPlacePublicUrl } from "../constants";
import {
  AdminButton,
  AdminDefinitionList,
  AdminErrorState,
  AdminLoadingRows,
  AdminModal,
  AdminSectionCard,
  AdminStatTile,
  AdminStatusBadge,
  adminButtonClass,
  adminLabelClass,
  adminTextareaClass,
  formatMoney,
  formatPersonName,
} from "../ui";
import {
  ADMIN_PET_EVENT_ALERT_PREVIEW_QUERY,
  ADMIN_PET_EVENT_QUERY,
  CANCEL_PET_EVENT_MUTATION,
  REVIEW_PET_EVENT_MUTATION,
  type AdminPetEventAlertPreview,
  type AdminPetEventAlertPreviewResponse,
  type AdminPetEventDetail,
  type AdminPetEventResponse,
  type PetEventMutationResult,
} from "./queries";
import {
  CANCEL_REASON_MAX,
  PET_EVENT_CATEGORY_LABELS,
  PET_EVENT_SPECIES_LABELS,
  PET_EVENT_STATUS,
  PET_EVENT_STATUS_LABELS,
  PET_EVENT_STATUS_TONE,
  REVIEW_NOTE_MAX,
  REVIEW_NOTE_MIN,
  formatEventDate,
  formatEventSession,
  googleMapsUrl,
  hasEnded,
  petEventPublicUrl,
  petEventScopeLabel,
  whatsappUrl,
} from "./constants";

type Mode = "idle" | "reject" | "cancel";

const linkClass = "text-orange-800 underline underline-offset-2 dark:text-orange-300";

function people(count: number): string {
  return `${count.toLocaleString("es-MX")} ${count === 1 ? "persona" : "personas"}`;
}

/** Franja de aviso dentro del modal (cambios, avisos a la zona, motivo del rechazo…). */
function Hint({
  tone = "info",
  icon = InformationCircleIcon,
  children,
}: {
  tone?: "info" | "warning" | "danger";
  icon?: IconSvgElement;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-sm",
        tone === "info" && "border-dash-line bg-dash-surface-2 text-dash-soft",
        tone === "warning" &&
          "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
        tone === "danger" &&
          "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
      )}
    >
      <HugeiconsIcon icon={icon} size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 [overflow-wrap:anywhere]">{children}</div>
    </div>
  );
}

/** "Esto avisará a N personas de la zona" / "Avisará el {fecha} (14 días antes)". */
function alertPreviewText(event: AdminPetEventDetail, preview: AdminPetEventAlertPreview): string {
  if (preview.alreadySent) {
    const count = event.zoneAlertsCount ?? 0;
    return `Ya se avisó a ${people(count)} de la zona${event.zoneAlertsSentAt ? ` (${formatDateShort(event.zoneAlertsSentAt)})` : ""}.`;
  }
  const capped = preview.candidates - preview.recipients;
  const cappedText = capped > 0 ? ` Otras ${people(capped)} ya llegaron a su tope de avisos del día.` : "";
  const approved = event.status === PET_EVENT_STATUS.APPROVED;
  if (preview.sendNow) {
    if (preview.recipients === 0) return `Nadie de la zona recibiría el aviso ahora.${cappedText}`;
    return approved
      ? `Avisará pronto a ${people(preview.recipients)} de la zona.${cappedText}`
      : `Esto avisará a ${people(preview.recipients)} de la zona.${cappedText}`;
  }
  if (preview.sendAt) {
    return `Avisará a la zona el ${formatEventDate(preview.sendAt, event.timeZone)} (14 días antes). Hoy serían ${people(preview.recipients)}.${cappedText}`;
  }
  return "No avisará a la zona: ya pasaron sus fechas.";
}

function costLabel(event: AdminPetEventDetail): string {
  const note = event.priceNote?.trim();
  if (event.isFree) return note ? `Gratis · ${note}` : "Gratis";
  const price = event.price != null ? formatMoney(event.price, "MXN") : null;
  return [price, note].filter(Boolean).join(" · ") || "Con costo (sin monto)";
}

function capacityLabel(event: AdminPetEventDetail): string {
  if (!event.capacity) return "Sin cupo";
  const going = event.goingCount ?? 0;
  return `${event.capacity.toLocaleString("es-MX")} lugares · ${going.toLocaleString("es-MX")} asistirán${event.isFull ? " (lleno)" : ""}`;
}

function placeText(event: AdminPetEventDetail): string {
  return (
    [event.placeLabel, event.address, event.neighborhood, [event.city, event.state].filter(Boolean).join(", ")]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(" · ") || "—"
  );
}

/**
 * Revisión de un evento de Kadesh Pet: vista completa (fotos, fechas, lugar, alcance, costo,
 * registro, quién organiza y quién lo publicó), a cuántas personas de la zona avisaría y las
 * acciones: aprobar, rechazar con motivo (le llega a quien lo publicó) o quitar uno publicado.
 */
export default function AdminPetEventReviewModal({
  eventId,
  onClose,
  onChanged,
}: {
  eventId: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [mode, setMode] = useState<Mode>("idle");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useApplyOnKeyChange(eventId ?? "", () => {
    setMode("idle");
    setNote("");
  });

  const { data, loading, error } = useQuery<AdminPetEventResponse>(ADMIN_PET_EVENT_QUERY, {
    variables: { id: eventId ?? "" },
    skip: !eventId,
    fetchPolicy: "network-only",
  });
  const event = eventId ? (data?.petEvent ?? null) : null;
  const status = event?.status ?? "";

  const { data: previewData } = useQuery<AdminPetEventAlertPreviewResponse>(ADMIN_PET_EVENT_ALERT_PREVIEW_QUERY, {
    variables: { id: eventId ?? "" },
    skip: !eventId || !event || status === PET_EVENT_STATUS.CANCELLED,
    fetchPolicy: "network-only",
  });
  const preview = previewData?.adminPetEventAlertPreview ?? null;

  // El globo del menú; el contador del Resumen se vuelve a pedir al abrirlo (cache-and-network).
  const refetchQueries = ["AdminNavCounts"];
  const [review] = useMutation<{ reviewPetEvent: PetEventMutationResult }>(REVIEW_PET_EVENT_MUTATION, {
    refetchQueries,
  });
  const [cancel] = useMutation<{ cancelPetEvent: PetEventMutationResult }>(CANCEL_PET_EVENT_MUTATION, {
    refetchQueries,
  });

  const allPast = Boolean(event && !event.nextStartsAt && hasEnded(event.lastEndsAt));
  const canApprove =
    (status === PET_EVENT_STATUS.PENDING || status === PET_EVENT_STATUS.REJECTED) && !allPast;
  const canReject = status === PET_EVENT_STATUS.PENDING;
  const canCancel = status === PET_EVENT_STATUS.APPROVED;
  const publicUrl =
    event?.slug &&
    (status === PET_EVENT_STATUS.APPROVED || (status === PET_EVENT_STATUS.CANCELLED && event.approvedAt))
      ? petEventPublicUrl(event.slug)
      : null;
  const trimmedNote = note.trim();

  const run = async (
    action: () => Promise<PetEventMutationResult | undefined>,
    failTitle: string,
  ) => {
    setBusy(true);
    try {
      const result = await action();
      if (!result?.success) {
        sileo.error({ title: failTitle, description: result?.message ?? "Intenta de nuevo." });
        return;
      }
      sileo.success({ title: result.message });
      onChanged();
      onClose();
    } catch (err) {
      sileo.error({ title: failTitle, description: err instanceof Error ? err.message : "Intenta de nuevo." });
    } finally {
      setBusy(false);
    }
  };

  const approve = () =>
    run(async () => {
      const { data: result } = await review({ variables: { id: eventId, approved: true, note: null } });
      return result?.reviewPetEvent;
    }, "No se pudo publicar el evento");

  const reject = () =>
    run(async () => {
      const { data: result } = await review({ variables: { id: eventId, approved: false, note: trimmedNote } });
      return result?.reviewPetEvent;
    }, "No se pudo rechazar el evento");

  const takeDown = () =>
    run(async () => {
      const { data: result } = await cancel({ variables: { id: eventId, reason: trimmedNote || null } });
      return result?.cancelPetEvent;
    }, "No se pudo quitar el evento");

  const photos = (event?.multimedia ?? []).filter((item) => item.image?.url);
  const sessions = event?.sessions ?? [];
  const registrationWhatsapp = event?.registrationWhatsapp ? whatsappUrl(event.registrationWhatsapp) : null;
  // Revisar que las redes sean de quien organiza (y no spam) antes de publicar.
  const socialLinks = event
    ? [
        { label: "Facebook", url: event.facebookUrl },
        { label: "Instagram", url: event.instagramUrl },
        { label: "TikTok", url: event.tiktokUrl },
        { label: "X", url: event.xUrl },
        { label: "Sitio web", url: event.websiteUrl },
      ].filter((link): link is { label: string; url: string } => Boolean(link.url?.trim()))
    : [];

  const hasFooter = Boolean(event && (mode !== "idle" || publicUrl || canApprove || canReject || canCancel));
  const footer = hasFooter ? (
    <>
      {mode !== "idle" ? (
        <div className="w-full">
          <label htmlFor="pet-event-note" className={adminLabelClass}>
            {mode === "reject" ? "Motivo del rechazo (le llega a quien lo publicó)" : "Motivo (opcional)"}
          </label>
          <textarea
            id="pet-event-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={mode === "reject" ? REVIEW_NOTE_MAX : CANCEL_REASON_MAX}
            placeholder={
              mode === "reject"
                ? "Ej.: falta la dirección exacta y la hora de cierre."
                : "Ej.: el lugar canceló la jornada."
            }
            className={cn(adminTextareaClass, "min-h-20")}
            autoFocus
          />
          <p className="mt-1.5 text-xs text-dash-muted">
            {mode === "reject"
              ? `Mínimo ${REVIEW_NOTE_MIN} caracteres. Podrá corregirlo y mandarlo otra vez.`
              : "La ficha sigue visible con el aviso de cancelado y avisamos a quienes marcaron «Me interesa» o «Asistiré»."}
          </p>
        </div>
      ) : null}

      {publicUrl && mode === "idle" ? (
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={adminButtonClass({ variant: "outline", size: "sm", className: "mr-auto" })}
        >
          <HugeiconsIcon icon={LinkSquare02Icon} size={16} />
          Ver en Kadesh Pet
        </a>
      ) : null}

      {mode === "idle" ? (
        <>
          {canReject ? (
            <AdminButton variant="danger-ghost" size="sm" disabled={busy} onClick={() => setMode("reject")}>
              Rechazar
            </AdminButton>
          ) : null}
          {canCancel ? (
            <AdminButton variant="danger-ghost" size="sm" disabled={busy} onClick={() => setMode("cancel")}>
              Quitar (cancelar)
            </AdminButton>
          ) : null}
          {canApprove ? (
            <AdminButton size="sm" disabled={busy} onClick={() => void approve()}>
              {busy ? "Publicando..." : "Aprobar y publicar"}
            </AdminButton>
          ) : null}
        </>
      ) : (
        <>
          <AdminButton
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => {
              setMode("idle");
              setNote("");
            }}
          >
            Volver
          </AdminButton>
          {mode === "reject" ? (
            <AdminButton
              variant="danger"
              size="sm"
              disabled={busy || trimmedNote.length < REVIEW_NOTE_MIN}
              onClick={() => void reject()}
            >
              {busy ? "Guardando..." : "Rechazar evento"}
            </AdminButton>
          ) : (
            <AdminButton variant="danger" size="sm" disabled={busy} onClick={() => void takeDown()}>
              {busy ? "Guardando..." : "Quitar evento"}
            </AdminButton>
          )}
        </>
      )}
    </>
  ) : null;

  return (
    <AdminModal
      open={Boolean(eventId)}
      onClose={onClose}
      ariaLabel="Revisar evento"
      size="lg"
      title={event?.title ?? "Evento"}
      subtitle={
        event
          ? [
              PET_EVENT_CATEGORY_LABELS[event.category ?? ""] ?? event.category,
              [event.city, event.state].filter(Boolean).join(", "),
              `Enviado ${formatDateShort(event.createdAt, false)}`,
            ]
              .filter(Boolean)
              .join(" · ")
          : undefined
      }
      headerAside={
        event ? (
          <AdminStatusBadge
            label={PET_EVENT_STATUS_LABELS[status] ?? "Sin estado"}
            tone={PET_EVENT_STATUS_TONE[status] ?? "neutral"}
          />
        ) : null
      }
      footer={footer}
    >
      {error ? (
        <AdminErrorState message="No se pudo cargar el evento." />
      ) : !event ? (
        loading || !data ? (
          <AdminLoadingRows rows={4} />
        ) : (
          <AdminErrorState message="No encontramos ese evento." />
        )
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {status === PET_EVENT_STATUS.PENDING && event.approvedAt ? (
              <Hint>Ya estuvo publicado: lo editaron y espera revisión otra vez.</Hint>
            ) : null}
            {event.pendingChangeNotice ? (
              <Hint tone="warning" icon={Alert02Icon}>
                Cambió fechas o lugar: al aprobar se avisa a los interesados.
              </Hint>
            ) : null}
            {allPast && status !== PET_EVENT_STATUS.CANCELLED ? (
              <Hint tone="warning" icon={Alert02Icon}>
                Ya pasaron todas sus fechas: no se puede publicar.
              </Hint>
            ) : null}
            {status === PET_EVENT_STATUS.REJECTED ? (
              <Hint tone="danger" icon={Alert02Icon}>
                <span className="font-semibold">Motivo del rechazo:</span> {event.reviewNote?.trim() || "Sin motivo."}
                <span className="mt-0.5 block text-xs opacity-80">
                  {formatDateShort(event.reviewedAt)}
                  {event.reviewedBy ? ` · ${formatPersonName(event.reviewedBy.name, event.reviewedBy.lastName)}` : ""}
                </span>
              </Hint>
            ) : null}
            {status === PET_EVENT_STATUS.CANCELLED ? (
              <Hint icon={Alert02Icon}>
                <span className="font-semibold">Cancelado {formatDateShort(event.cancelledAt)}.</span>{" "}
                {event.cancelReason?.trim() || "Sin motivo."}
                {!event.approvedAt ? (
                  <span className="mt-0.5 block text-xs opacity-80">Nunca se publicó: no aparece en Kadesh Pet.</span>
                ) : null}
              </Hint>
            ) : null}
            {preview && status !== PET_EVENT_STATUS.CANCELLED ? (
              <Hint icon={Notification03Icon}>{alertPreviewText(event, preview)}</Hint>
            ) : null}
          </div>

          {photos.length > 0 ? (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {photos.map((photo, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.image?.url}
                  alt={index === 0 ? "Portada del evento" : ""}
                  className="h-36 w-36 shrink-0 rounded-2xl object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-dash-muted">Sin fotos.</p>
          )}

          {status === PET_EVENT_STATUS.APPROVED || (status === PET_EVENT_STATUS.CANCELLED && event.approvedAt) ? (
            <div className="grid grid-cols-3 gap-3">
              <AdminStatTile label="Me interesa" value={event.interestedCount ?? 0} />
              <AdminStatTile label="Asistirán" value={event.goingCount ?? 0} />
              <AdminStatTile
                label="Avisos a la zona"
                value={event.zoneAlertsSentAt ? (event.zoneAlertsCount ?? 0) : "—"}
                hint={event.zoneAlertsSentAt ? formatDateShort(event.zoneAlertsSentAt, false) : "Aún no"}
              />
            </div>
          ) : null}

          <AdminSectionCard
            title={sessions.length === 1 ? "Fecha" : `Fechas (${sessions.length})`}
            description={`Hora local de ${event.state || "Ciudad de México"}.`}
          >
            {sessions.length === 0 ? (
              <p className="text-sm text-dash-muted">Sin fechas.</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {sessions.map((session) => {
                  const ended = hasEnded(session.endsAt);
                  return (
                    <li
                      key={session.id}
                      className={cn("flex flex-wrap items-center gap-2 text-sm text-dash-ink", ended && "opacity-60")}
                    >
                      <span className="tabular-nums">
                        {formatEventSession(session.startsAt, session.endsAt, event.timeZone)}
                      </span>
                      {ended ? <AdminStatusBadge label="Ya pasó" /> : null}
                    </li>
                  );
                })}
              </ol>
            )}
          </AdminSectionCard>

          <AdminSectionCard title="Descripción">
            <p className="whitespace-pre-line text-sm text-dash-soft [overflow-wrap:anywhere]">
              {event.description?.trim() || "Sin descripción."}
            </p>
            {event.requirements?.trim() ? (
              <>
                <h4 className="mt-4 text-sm font-semibold text-dash-ink">Requisitos</h4>
                <p className="mt-1 whitespace-pre-line text-sm text-dash-soft [overflow-wrap:anywhere]">
                  {event.requirements.trim()}
                </p>
              </>
            ) : null}
          </AdminSectionCard>

          <AdminSectionCard title="Datos">
            <AdminDefinitionList
              columns={2}
              items={[
                { label: "Tipo", value: PET_EVENT_CATEGORY_LABELS[event.category ?? ""] ?? event.category ?? "—" },
                {
                  label: "Para",
                  value:
                    (event.species ?? []).map((value) => PET_EVENT_SPECIES_LABELS[value] ?? value).join(", ") ||
                    "Cualquier animal",
                },
                { label: "Alcance", value: petEventScopeLabel(event.scope, event.reachKm) },
                { label: "Costo", value: costLabel(event) },
                { label: "Cupo", value: capacityLabel(event) },
                {
                  label: "Registro",
                  value:
                    event.registrationUrl || registrationWhatsapp ? (
                      <span className="flex flex-col gap-0.5">
                        {event.registrationUrl ? (
                          <a
                            href={event.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className={cn(linkClass, "break-all")}
                          >
                            {event.registrationUrl}
                          </a>
                        ) : null}
                        {registrationWhatsapp ? (
                          <a href={registrationWhatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                            WhatsApp {event.registrationWhatsapp}
                          </a>
                        ) : null}
                      </span>
                    ) : (
                      "Sin registro (llegar directo)"
                    ),
                },
                {
                  label: "Organiza",
                  value: (
                    <span className="flex flex-col gap-0.5">
                      <span>{event.organizerName?.trim() || "—"}</span>
                      {event.contactPhone ? (
                        <a href={`tel:${event.contactPhone}`} className={linkClass}>
                          {event.contactPhone}
                        </a>
                      ) : null}
                    </span>
                  ),
                },
                {
                  label: "Redes",
                  value: socialLinks.length > 0 ? (
                    <span className="flex flex-col gap-0.5">
                      {socialLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className={cn(linkClass, "break-all")}
                        >
                          {link.label}: {link.url.replace(/^https?:\/\/(www\.)?/, "")}
                        </a>
                      ))}
                    </span>
                  ) : (
                    "—"
                  ),
                },
                {
                  label: "Veterinaria",
                  value: event.petPlace ? (
                    <a
                      href={petPlacePublicUrl(event.petPlace)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {event.petPlace.name ?? "Ver ficha"}
                    </a>
                  ) : (
                    "—"
                  ),
                },
              ]}
            />
          </AdminSectionCard>

          <AdminSectionCard
            title="Lugar"
            action={
              event.lat != null && event.lng != null ? (
                <a
                  href={googleMapsUrl(event.lat, event.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={adminButtonClass({ variant: "outline", size: "sm" })}
                >
                  <HugeiconsIcon icon={MapsLocation01Icon} size={16} />
                  Ver en Google Maps
                </a>
              ) : null
            }
          >
            <p className="text-sm text-dash-ink [overflow-wrap:anywhere]">{placeText(event)}</p>
          </AdminSectionCard>

          <AdminSectionCard title="Quién lo publicó">
            {event.user ? (
              <div className="text-sm">
                <p className="font-medium text-dash-ink">{formatPersonName(event.user.name, event.user.lastName)}</p>
                {event.user.email ? <p className="mt-0.5 break-all text-dash-muted">{event.user.email}</p> : null}
                {event.user.phone ? <p className="mt-0.5 text-dash-muted">{event.user.phone}</p> : null}
              </div>
            ) : (
              <p className="text-sm text-dash-muted">Sin cuenta ligada.</p>
            )}
            <p className="mt-2 text-xs text-dash-faint">
              Enviado {formatDateShort(event.createdAt)}
              {event.updatedAt ? ` · Último cambio ${formatDateShort(event.updatedAt)}` : ""}
            </p>
          </AdminSectionCard>
        </div>
      )}
    </AdminModal>
  );
}
