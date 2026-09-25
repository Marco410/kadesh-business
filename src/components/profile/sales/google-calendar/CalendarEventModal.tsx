"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { ConfirmModal, ModalPortal } from "kadesh/components/shared";
import {
  CREATE_TECH_CALENDAR_EVENT_MUTATION,
  DELETE_TECH_CALENDAR_EVENT_MUTATION,
  type CreateTechCalendarEventVariables,
  type NativeCalendarEvent,
} from "./queries";
import { localDateKey } from "./dates";
import { useGoogleCalendarAccounts } from "./useGoogleCalendarAccounts";
import { accountDisplayLabel, calendarDisplayName } from "./labels";

const INPUT_CLASS =
  "w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#212121] outline-none focus:border-orange-500 dark:border-[#3a3a3a] dark:bg-[#252525] dark:text-[#ffffff]";
const LABEL_CLASS = "mb-1 block text-xs font-semibold text-[#616161] dark:text-[#b0b0b0]";

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Se llama tras crear o borrar, para refrescar el calendario. */
  onChanged: () => void;
  /** Con evento: modo detalle (con borrar). Sin evento: formulario de creación. */
  event?: NativeCalendarEvent | null;
  /** `YYYY-MM-DD` a precargar en la creación (día seleccionado en el calendario). */
  defaultDateKey?: string | null;
}

function todayKey(): string {
  return localDateKey(new Date().toISOString());
}

/** Los eventos de día completo guardan su fecha en UTC (00:00Z). */
function utcDay(iso: string): string {
  return iso.slice(0, 10);
}

export default function CalendarEventModal({
  isOpen,
  onClose,
  onChanged,
  event,
  defaultDateKey,
}: CalendarEventModalProps) {
  if (!isOpen) return null;
  // Remontar el formulario en cada apertura resetea su estado sin efectos.
  return (
    <ModalPortal>
      <AnimatePresence>
        <ModalBody
          key={event?.id ?? `new-${defaultDateKey ?? ""}`}
          onClose={onClose}
          onChanged={onChanged}
          event={event ?? null}
          defaultDateKey={defaultDateKey ?? null}
        />
      </AnimatePresence>
    </ModalPortal>
  );
}

function ModalBody({
  onClose,
  onChanged,
  event,
  defaultDateKey,
}: {
  onClose: () => void;
  onChanged: () => void;
  event: NativeCalendarEvent | null;
  defaultDateKey: string | null;
}) {
  const [createEvent, { loading: creating }] = useMutation<unknown, CreateTechCalendarEventVariables>(
    CREATE_TECH_CALENDAR_EVENT_MUTATION,
  );
  const [deleteEvent, { loading: deleting }] = useMutation(DELETE_TECH_CALENDAR_EVENT_MUTATION);

  const initialDay = defaultDateKey ?? todayKey();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState(`${initialDay}T09:00`);
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Calendarios de Google que pueden recibir el evento: los visibles de cuentas activas.
  // Todos vienen marcados; el usuario desmarca los que no quiere.
  const { accounts } = useGoogleCalendarAccounts({ skip: !!event });
  const [unchecked, setUnchecked] = useState<Set<string>>(new Set());
  const targetGroups = accounts
    .filter((a) => a.isActive)
    .map((a) => ({ account: a, calendars: a.calendars.filter((c) => c.isSelected) }))
    .filter((g) => g.calendars.length > 0);
  const targetIds = targetGroups
    .flatMap((g) => g.calendars.map((c) => c.id))
    .filter((id) => !unchecked.has(id));

  const toggleTarget = (id: string) =>
    setUnchecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const startDate = start.slice(0, 10);
  const endDate = end.slice(0, 10);

  const handleAllDayChange = (checked: boolean) => {
    setAllDay(checked);
    // Al cambiar de modo se conservan las fechas y se ajusta el formato del valor.
    setStart(checked ? startDate : `${startDate}T09:00`);
    setEnd(checked ? endDate : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Escribe un título para el evento.");
    if (!start) return setError("Elige la fecha de inicio.");
    if (end && end < start) return setError("El fin no puede ser anterior al inicio.");

    const startAt = allDay ? `${startDate}T00:00:00.000Z` : new Date(start).toISOString();
    const endAt = end
      ? allDay
        ? `${endDate}T00:00:00.000Z`
        : new Date(end).toISOString()
      : null;

    try {
      await createEvent({
        variables: {
          data: {
            title: title.trim(),
            description: description.trim() || null,
            location: location.trim() || null,
            startAt,
            endAt,
            allDay,
            sourceType: "native",
            ...(targetIds.length > 0
              ? { googleTargets: { connect: targetIds.map((id) => ({ id })) } }
              : {}),
          },
        },
      });
      sileo.success({ title: "Evento creado" });
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el evento.");
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    try {
      await deleteEvent({ variables: { id: event.id } });
      sileo.success({ title: "Evento eliminado" });
      onChanged();
      onClose();
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "No se pudo eliminar el evento." });
    }
  };

  const whenLabel = event
    ? event.allDay
      ? new Date(`${utcDay(event.startAt)}T12:00:00`).toLocaleDateString("es-MX", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      : `${new Date(event.startAt).toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" })}${
          event.endAt
            ? ` – ${new Date(event.endAt).toLocaleTimeString("es-MX", { timeStyle: "short" })}`
            : ""
        }`
    : "";

  return (
    <>
      <motion.div
        key="calendar-event-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50"
        onClick={onClose}
      />
      <motion.div
        key="calendar-event-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="pointer-events-none fixed inset-0 z-[110] flex items-center justify-center p-4"
      >
        <div
          className="pointer-events-auto flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-2xl dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#e0e0e0] bg-[#f5f5f5] p-4 dark:border-[#3a3a3a] dark:bg-[#2a2a2a]">
            <h4 className="text-lg font-bold text-[#212121] dark:text-[#ffffff]">
              {event ? "Detalle del evento" : "Nuevo evento"}
            </h4>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg text-2xl font-bold text-[#616161] hover:bg-[#e5e5e5] dark:text-[#b0b0b0] dark:hover:bg-[#333]"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          {event ? (
            <div className="space-y-4 overflow-y-auto p-4">
              <div>
                <p className="text-base font-semibold text-[#212121] dark:text-[#ffffff]">
                  {event.title}
                </p>
                <p className="mt-1 text-sm capitalize text-[#616161] dark:text-[#b0b0b0]">
                  {whenLabel}
                </p>
              </div>
              {event.location ? (
                <p className="text-sm text-[#212121] dark:text-[#e0e0e0]">📍 {event.location}</p>
              ) : null}
              {event.description ? (
                <p className="whitespace-pre-wrap text-sm text-[#212121] dark:text-[#e0e0e0]">
                  {event.description}
                </p>
              ) : null}
              <p className="text-xs text-[#9e9e9e]">
                {event.googleLinks.length > 0
                  ? `Enviado a ${event.googleLinks.filter((l) => l.lastPushStatus === "success").length} de ${event.googleLinks.length} calendarios de Google.`
                  : "No se envió a Google (no hay calendarios seleccionados)."}
              </p>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full rounded-xl border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
              >
                Eliminar evento
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-4">
              <div>
                <label className={LABEL_CLASS} htmlFor="calendar-event-title">
                  Título
                </label>
                <input
                  id="calendar-event-title"
                  className={INPUT_CLASS}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Reunión con cliente"
                  autoFocus
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#212121] dark:text-[#e0e0e0]">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => handleAllDayChange(e.target.checked)}
                  className="size-4 accent-orange-500"
                />
                Todo el día
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor="calendar-event-start">
                    Inicio
                  </label>
                  <input
                    id="calendar-event-start"
                    className={INPUT_CLASS}
                    type={allDay ? "date" : "datetime-local"}
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="calendar-event-end">
                    Fin (opcional)
                  </label>
                  <input
                    id="calendar-event-end"
                    className={INPUT_CLASS}
                    type={allDay ? "date" : "datetime-local"}
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              </div>
              {!allDay ? (
                <p className="-mt-2 text-xs text-[#9e9e9e]">Sin fin, el evento dura 1 hora.</p>
              ) : null}

              <div>
                <label className={LABEL_CLASS} htmlFor="calendar-event-location">
                  Lugar (opcional)
                </label>
                <input
                  id="calendar-event-location"
                  className={INPUT_CLASS}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="calendar-event-description">
                  Descripción (opcional)
                </label>
                <textarea
                  id="calendar-event-description"
                  className={`${INPUT_CLASS} min-h-[80px]`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <fieldset className="rounded-lg border border-[#e0e0e0] p-3 dark:border-[#3a3a3a]">
                <legend className="px-1 text-xs font-semibold text-[#616161] dark:text-[#b0b0b0]">
                  Enviar a Google Calendar
                </legend>
                {targetGroups.length === 0 ? (
                  <p className="text-xs text-[#9e9e9e]">
                    No tienes calendarios de Google visibles. El evento se guardará solo en Kadesh.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {targetGroups.map(({ account, calendars }) => (
                      <div key={account.id}>
                        <p className="mb-1 truncate text-[11px] text-[#9e9e9e]">
                          {accountDisplayLabel(account)}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {calendars.map((calendar) => {
                            const on = !unchecked.has(calendar.id);
                            const color = calendar.colorHex ?? "#039be5";
                            return (
                              <label
                                key={calendar.id}
                                className={`inline-flex max-w-full cursor-pointer select-none items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                  on
                                    ? "border-[#e0e0e0] bg-white text-[#212121] dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-[#ffffff]"
                                    : "border-dashed border-[#d0d0d0] text-[#9e9e9e] dark:border-[#444]"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={on}
                                  onChange={() => toggleTarget(calendar.id)}
                                  className="sr-only"
                                />
                                <span
                                  aria-hidden
                                  className="flex size-4 shrink-0 items-center justify-center rounded border-2"
                                  style={{ borderColor: color, backgroundColor: on ? color : "transparent" }}
                                >
                                  {on ? (
                                    <svg viewBox="0 0 12 12" className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
                                      <path d="M2.5 6.2 5 8.7l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ) : null}
                                </span>
                                <span className="truncate">{calendarDisplayName(account, calendar)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </fieldset>

              {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
              >
                {creating ? "Guardando…" : "Crear evento"}
              </button>

            </form>
          )}
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        isLoading={deleting}
        stackedOverModal
        title="Eliminar evento"
        message="También se borrará de los calendarios de Google a los que se envió."
        confirmText="Eliminar"
      />
    </>
  );
}
