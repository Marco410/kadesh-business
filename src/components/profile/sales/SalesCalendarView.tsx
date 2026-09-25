"use client";

import { useState, useMemo, useEffect } from "react";
import { EVENT_COLORS } from "kadesh/constants/constans";
import TaskDetailModal from "kadesh/components/profile/sales/detail_lead/TaskDetailModal";
import ActivityDetailModal from "kadesh/components/profile/sales/detail_lead/ActivityDetailModal";
import ProposalDetailModal from "kadesh/components/profile/sales/detail_lead/ProposalDetailModal";
import FollowUpDetailModal from "kadesh/components/profile/sales/detail_lead/FollowUpDetailModal";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/** Tipos con modal de detalle propio (registros del CRM). */
type CrmEventType = "activity" | "proposal" | "followup" | "task";

export type CalendarEvent = {
  id: string;
  recordId: string;
  /**
   * `activity`/`proposal`/`followup` vienen del CRM; `native` es un evento creado a mano en
   * Kadesh; `google` vive solo en un calendario de Google conectado.
   */
  type: CrmEventType | "native" | "google";
  typeLabel: string;
  dateKey: string;
  timeLabel: string | null;
  businessName: string;
  sellerName: string;
  extra?: string;
  /** Solo `google`: enlace al evento en Google Calendar. */
  href?: string | null;
  /** Solo `google`: color hex del calendario en Google (`#rrggbb`). */
  color?: string | null;
};

const LEGEND: { type: CalendarEvent["type"]; label: string; title: string }[] = [
  { type: "activity", label: "Actividades", title: "Actividad" },
  { type: "proposal", label: "Propuestas", title: "Propuesta" },
  { type: "followup", label: "Seguimientos", title: "Seguimiento" },
  { type: "task", label: "Tareas", title: "Tarea" },
  { type: "native", label: "Eventos", title: "Evento" },
];

function EventListItem({
  event,
  onOpen,
  hideSeller,
}: {
  event: CalendarEvent;
  onOpen: (event: CalendarEvent) => void;
  hideSeller?: boolean;
}) {
  return (
    <li
      role="button"
      tabIndex={0}
      onClick={() => onOpen(event)}
      onKeyDown={(ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          onOpen(event);
        }
      }}
      style={event.color ? { borderLeft: `4px solid ${event.color}` } : undefined}
      className="flex flex-col gap-1 p-3 rounded-lg bg-white dark:bg-[#1e1e1e] border border-[#e8e8e8] dark:border-[#333] cursor-pointer hover:border-orange-500/50 hover:ring-1 hover:ring-orange-500/30 transition-colors"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span
          style={event.color ? { backgroundColor: event.color } : undefined}
          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium text-white ${
            event.color ? "" : EVENT_COLORS[event.type]
          }`}
        >
          {event.typeLabel}
        </span>
        {event.timeLabel ? (
          <span className="text-xs text-[#616161] dark:text-[#b0b0b0] tabular-nums font-medium">
            {event.timeLabel}
          </span>
        ) : null}
        {event.extra ? (
          <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">
            {event.extra}
          </span>
        ) : null}
      </div>
      <span className="text-sm font-medium text-[#212121] dark:text-[#ffffff] block">
        {event.businessName}
      </span>
      {hideSeller ? null : (
        <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">
          {event.sellerName}
        </span>
      )}
    </li>
  );
}

export interface SalesCalendarViewProps {
  /** Mapa de fecha (YYYY-MM-DD) a eventos del día. */
  eventsByDate: Map<string, CalendarEvent[]>;
  /** Título del encabezado del calendario. */
  title?: string;
  /** Clases adicionales para el contenedor (ej. mt-8). */
  className?: string;
  /** `compact` para la ficha del cliente; `full` para el calendario del panel. */
  variant?: "full" | "compact";
  /** Se llama con el mes visible (día 1) al montar y cada vez que cambia. */
  onVisibleMonthChange?: (month: Date) => void;
  /** Clic en un evento `native` o `google` (los del CRM abren su propio modal). */
  onOpenExternalEvent?: (event: CalendarEvent) => void;
  /** Oculta la leyenda de colores cuando otro control (capas) ya cumple ese papel. */
  hideLegend?: boolean;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function SalesCalendarView({
  eventsByDate,
  title = "Calendario",
  className = "",
  variant = "full",
  onVisibleMonthChange,
  onOpenExternalEvent,
  hideLegend = false,
}: SalesCalendarViewProps) {
  const isCompact = variant === "compact";
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(() =>
    isCompact ? todayKey() : null
  );
  const [openedEvent, setOpenedEvent] = useState<{
    type: CrmEventType;
    recordId: string;
  } | null>(null);

  useEffect(() => {
    onVisibleMonthChange?.(currentMonth);
  }, [currentMonth, onVisibleMonthChange]);

  const handleOpen = (item: CalendarEvent) => {
    if (item.type === "native" || item.type === "google") {
      if (onOpenExternalEvent) onOpenExternalEvent(item);
      else if (item.href) window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    setOpenedEvent({ type: item.type, recordId: item.recordId });
  };

  const calendarGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startWeekday = first.getDay();
    const daysInMonth = last.getDate();
    const cells: { dateKey: string | null; day: number | null }[] = [];
    const pad = startWeekday;
    for (let i = 0; i < pad; i++) cells.push({ dateKey: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ dateKey, day: d });
    }
    const remainder = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < remainder; i++) cells.push({ dateKey: null, day: null });
    return cells;
  }, [currentMonth]);

  const prevMonth = () => {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    if (!isCompact) setSelectedDateKey(null);
  };
  const nextMonth = () => {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    if (!isCompact) setSelectedDateKey(null);
  };

  const goToToday = () => {
    const d = new Date();
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelectedDateKey(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  };

  const selectedEvents = selectedDateKey
    ? (eventsByDate.get(selectedDateKey) ?? []).sort((a, b) => {
        if (a.timeLabel && b.timeLabel) return a.timeLabel.localeCompare(b.timeLabel);
        if (a.timeLabel) return -1;
        if (b.timeLabel) return 1;
        return 0;
      })
    : [];

  // Un punto por tipo; los de Google se distinguen por el color de su calendario.
  const dotsFor = (dateKey: string) => {
    const dots = new Map<string, { key: string; className?: string; color?: string; title: string }>();
    (eventsByDate.get(dateKey) ?? []).forEach((e) => {
      const key = e.color ? `color-${e.color}` : e.type;
      if (dots.has(key)) return;
      dots.set(key, {
        key,
        className: e.color ? undefined : EVENT_COLORS[e.type],
        color: e.color ?? undefined,
        title: e.type === "google" ? (e.extra ?? "Google") : e.typeLabel,
      });
    });
    return [...dots.values()].slice(0, 6);
  };

  // En la ficha compacta, "Eventos" solo sale en la leyenda si hay eventos nativos.
  const legendItems = useMemo(() => {
    if (!isCompact) return LEGEND;
    const hasNative = [...eventsByDate.values()].some((list) => list.some((e) => e.type === "native"));
    return LEGEND.filter((item) => item.type !== "native" || hasNative);
  }, [eventsByDate, isCompact]);

  const todayDateKey = todayKey();

  const upcomingEvents = useMemo(() => {
    const all: CalendarEvent[] = [];
    eventsByDate.forEach((list) => {
      all.push(...list);
    });
    return all
      .filter((e) => e.dateKey >= todayDateKey)
      .sort((a, b) => {
        if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
        return (a.timeLabel ?? "").localeCompare(b.timeLabel ?? "");
      })
      .slice(0, 8);
  }, [eventsByDate, todayDateKey]);

  return (
    <section
      className={`w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden ${
        isCompact ? "" : "min-h-[calc(100vh-12rem)]"
      } ${className}`.trim()}
    >
      <div className="px-4 py-3 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a] flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0]">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-[#ffffff] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <span className="min-w-[180px] text-center font-semibold text-[#212121] dark:text-[#ffffff]">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-[#ffffff] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors"
            aria-label="Mes siguiente"
          >
            ›
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="px-3 py-2 rounded-lg border border-orange-500/50 dark:border-orange-400/50 bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-medium text-sm hover:bg-orange-500/20 dark:hover:bg-orange-500/30 transition-colors"
            aria-label="Ir a hoy"
          >
            Hoy
          </button>
        </div>
        {hideLegend ? null : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
          {legendItems.map((item) => (
            <span key={item.type} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${EVENT_COLORS[item.type]}`} />
              {item.label}
            </span>
          ))}
        </div>
        )}
      </div>

      <div className={`p-4 flex flex-col lg:flex-row gap-4 ${isCompact ? "" : "min-h-[500px]"}`}>
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-7 gap-px bg-[#e0e0e0] dark:bg-[#3a3a3a] rounded-lg overflow-hidden">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="bg-[#f5f5f5] dark:bg-[#2a2a2a] px-2 py-2 text-center text-xs font-semibold text-[#616161] dark:text-[#b0b0b0]"
              >
                {w}
              </div>
            ))}
            {calendarGrid.map((cell, i) => (
              <button
                key={i}
                type="button"
                onClick={() => cell.dateKey && setSelectedDateKey(cell.dateKey)}
                className={`${
                  isCompact
                    ? "min-h-[48px] sm:min-h-[56px]"
                    : "min-h-[90px] sm:min-h-[120px] md:min-h-[140px]"
                } flex flex-col items-center justify-start p-1 sm:p-2 text-left bg-white dark:bg-[#1e1e1e] hover:bg-[#fafafa] dark:hover:bg-[#252525] transition-colors ${
                  cell.dateKey != null && selectedDateKey === cell.dateKey
                    ? "ring-2 ring-orange-500 ring-inset"
                    : ""
                } ${!cell.dateKey ? "opacity-50 pointer-events-none" : ""}`}
              >
                {cell.day != null && (
                  <>
                    <span
                      className={`text-sm font-medium ${
                        cell.dateKey === todayDateKey
                          ? "text-orange-500 dark:text-orange-400"
                          : "text-[#212121] dark:text-[#ffffff]"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {cell.dateKey && (
                      <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                        {dotsFor(cell.dateKey).map((dot) => (
                          <span
                            key={dot.key}
                            style={dot.color ? { backgroundColor: dot.color } : undefined}
                            className={`w-2.5 h-2.5 rounded-full ${dot.className ?? ""}`}
                            title={dot.title}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {selectedDateKey ? (
          <div className={`w-full shrink-0 flex flex-col rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] overflow-hidden ${
            isCompact ? "lg:w-[300px] xl:w-[320px] max-h-[420px]" : "lg:w-[380px] xl:w-[420px]"
          }`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f0f0f0] dark:bg-[#2a2a2a]">
              <h3 className="text-sm font-semibold text-[#212121] dark:text-[#ffffff] capitalize">
                {new Date(selectedDateKey + "T12:00:00").toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              {isCompact ? null : (
                <button
                  type="button"
                  onClick={() => setSelectedDateKey(null)}
                  className="p-1.5 rounded-lg text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] hover:bg-[#e5e5e5] dark:hover:bg-[#333] transition-colors"
                  aria-label="Cerrar"
                >
                  Cerrar
                </button>
              )}
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                  Sin eventos este día.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedEvents.map((e) => (
                    <EventListItem
                      key={e.id}
                      event={e}
                      hideSeller={isCompact}
                      onOpen={handleOpen}
                    />
                  ))}
                </ul>
              )}
              {isCompact && upcomingEvents.filter((e) => e.dateKey !== selectedDateKey).length > 0 ? (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#777]">
                    Próximos
                  </p>
                  <ul className="space-y-2">
                    {upcomingEvents
                      .filter((e) => e.dateKey !== selectedDateKey)
                      .map((e) => (
                      <EventListItem
                        key={`up-${e.id}`}
                        event={e}
                        hideSeller
                        onOpen={handleOpen}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ) : isCompact ? (
          <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 flex flex-col rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] overflow-hidden max-h-[420px]">
            <div className="px-4 py-3 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f0f0f0] dark:bg-[#2a2a2a]">
              <h3 className="text-sm font-semibold text-[#212121] dark:text-[#ffffff]">
                Próximos
              </h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                  No hay actividades, propuestas ni seguimientos próximos.
                </p>
              ) : (
                <ul className="space-y-2">
                  {upcomingEvents.map((e) => (
                    <EventListItem
                      key={`up-${e.id}`}
                      event={e}
                      hideSeller
                      onOpen={handleOpen}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex w-[380px] xl:w-[420px] shrink-0 items-center justify-center rounded-lg border border-dashed border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525]/50">
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0] text-center px-4">
              Selecciona un día para ver los eventos
            </p>
          </div>
        )}
      </div>

      <ActivityDetailModal
        activityId={openedEvent?.type === "activity" ? openedEvent.recordId : null}
        isOpen={openedEvent !== null && openedEvent.type === "activity"}
        onClose={() => setOpenedEvent(null)}
      />
      <ProposalDetailModal
        proposalId={openedEvent?.type === "proposal" ? openedEvent.recordId : null}
        isOpen={openedEvent !== null && openedEvent.type === "proposal"}
        onClose={() => setOpenedEvent(null)}
      />
      <TaskDetailModal
        taskId={openedEvent?.type === "task" ? openedEvent.recordId : null}
        isOpen={openedEvent !== null && openedEvent.type === "task"}
        onClose={() => setOpenedEvent(null)}
      />
      <FollowUpDetailModal
        taskId={openedEvent?.type === "followup" ? openedEvent.recordId : null}
        isOpen={openedEvent !== null && openedEvent.type === "followup"}
        onClose={() => setOpenedEvent(null)}
      />
    </section>
  );
}
