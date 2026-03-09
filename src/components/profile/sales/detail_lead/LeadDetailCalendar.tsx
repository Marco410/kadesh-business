"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  TECH_SALES_ACTIVITIES_QUERY,
  TECH_PROPOSALS_QUERY,
  TECH_FOLLOW_UP_TASKS_QUERY,
  type TechSalesActivitiesVariables,
  type TechSalesActivitiesResponse,
  type TechProposalsVariables,
  type TechProposalsResponse,
  type TechFollowUpTasksVariables,
  type TechFollowUpTasksResponse,
} from "kadesh/components/profile/sales/queries";
import { EVENT_COLORS, EVENT_LABELS } from "../constants";
import ActivityDetailModal from "./ActivityDetailModal";
import ProposalDetailModal from "./ProposalDetailModal";
import FollowUpDetailModal from "./FollowUpDetailModal";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export type CalendarEvent = {
  id: string;
  recordId: string;
  type: "activity" | "proposal" | "followup";
  typeLabel: string;
  dateKey: string;
  timeLabel: string | null;
  businessName: string;
  sellerName: string;
  extra?: string;
};



function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

interface LeadDetailCalendarProps {
  leadId: string;
  userId: string;
  businessName: string;
  sellerName: string;
}

export default function LeadDetailCalendar({
  leadId,
  userId,
  businessName,
  sellerName,
}: LeadDetailCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [openedEvent, setOpenedEvent] = useState<{
    type: CalendarEvent["type"];
    recordId: string;
  } | null>(null);

  const whereActivities: TechSalesActivitiesVariables["where"] = {
    AND: [
      { assignedSeller: { id: { equals: userId } }, businessLead: { id: { equals: leadId } } },
    ],
  };
  const whereProposals: TechProposalsVariables["where"] = {
    AND: [
      { assignedSeller: { id: { equals: userId } }, businessLead: { id: { equals: leadId } } },
    ],
  };
  const whereTasks: TechFollowUpTasksVariables["where"] = {
    AND: [
      { assignedSeller: { id: { equals: userId } }, businessLead: { id: { equals: leadId } } },
    ],
  };

  const { data: activitiesData } = useQuery<
    TechSalesActivitiesResponse,
    TechSalesActivitiesVariables
  >(TECH_SALES_ACTIVITIES_QUERY, {
    variables: { where: whereActivities },
    skip: !leadId || !userId,
    fetchPolicy: "network-only",
  });
  const { data: proposalsData } = useQuery<
    TechProposalsResponse,
    TechProposalsVariables
  >(TECH_PROPOSALS_QUERY, {
    variables: { where: whereProposals },
    skip: !leadId || !userId,
    fetchPolicy: "network-only",
  });
  const { data: tasksData } = useQuery<
    TechFollowUpTasksResponse,
    TechFollowUpTasksVariables
  >(TECH_FOLLOW_UP_TASKS_QUERY, {
    variables: { where: whereTasks },
    skip: !leadId || !userId,
    fetchPolicy: "network-only",
  });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    const add = (e: CalendarEvent) => {
      const list = map.get(e.dateKey) ?? [];
      list.push(e);
      map.set(e.dateKey, list);
    };

    const name = businessName || "—";
    const seller = sellerName || "—";

    (activitiesData?.techSalesActivities ?? []).forEach((a) => {
      const dateKey = toDateKey(a.activityDate);
      add({
        id: `activity-${a.id}`,
        recordId: a.id,
        type: "activity",
        typeLabel: EVENT_LABELS.activity,
        dateKey,
        timeLabel: formatTime(a.activityDate),
        businessName: a.businessLead?.businessName ?? name,
        sellerName: seller,
        extra: a.type,
      });
    });
    (proposalsData?.techProposals ?? []).forEach((p) => {
      const dateKey = toDateKey(p.sentDate);
      add({
        id: `proposal-${p.id}`,
        recordId: p.id,
        type: "proposal",
        typeLabel: EVENT_LABELS.proposal,
        dateKey,
        timeLabel: null,
        businessName: p.businessLead?.businessName ?? name,
        sellerName: seller,
        extra: p.status,
      });
    });
    (tasksData?.techFollowUpTasks ?? []).forEach((t) => {
      const dateKey = toDateKey(t.scheduledDate);
      add({
        id: `followup-${t.id}`,
        recordId: t.id,
        type: "followup",
        typeLabel: EVENT_LABELS.followup,
        dateKey,
        timeLabel: null,
        businessName: t.businessLead?.businessName ?? name,
        sellerName: seller,
        extra: t.status,
      });
    });

    return map;
  }, [
    activitiesData?.techSalesActivities,
    proposalsData?.techProposals,
    tasksData?.techFollowUpTasks,
    businessName,
    sellerName,
  ]);

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
    setSelectedDateKey(null);
  };
  const nextMonth = () => {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    setSelectedDateKey(null);
  };

  const selectedEvents = selectedDateKey
    ? (eventsByDate.get(selectedDateKey) ?? []).sort((a, b) => {
        if (a.timeLabel && b.timeLabel) return a.timeLabel.localeCompare(b.timeLabel);
        if (a.timeLabel) return -1;
        if (b.timeLabel) return 1;
        return 0;
      })
    : [];

  const hasActivity = (dateKey: string) =>
    (eventsByDate.get(dateKey) ?? []).some((e) => e.type === "activity");
  const hasProposal = (dateKey: string) =>
    (eventsByDate.get(dateKey) ?? []).some((e) => e.type === "proposal");
  const hasFollowup = (dateKey: string) =>
    (eventsByDate.get(dateKey) ?? []).some((e) => e.type === "followup");

  return (
    <section className="w-full mt-8 min-h-[calc(100vh-12rem)] rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a] flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0]">
          Calendario
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
        </div>
        <div className="flex items-center gap-4 text-xs text-[#616161] dark:text-[#b0b0b0]">
          <span className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${EVENT_COLORS.activity}`} />
            Actividades
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${EVENT_COLORS.proposal}`} />
            Propuestas
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${EVENT_COLORS.followup}`} />
            Seguimientos
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col lg:flex-row gap-4 min-h-[500px]">
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
                className={`min-h-[90px] sm:min-h-[120px] md:min-h-[140px] flex flex-col items-center justify-start p-1 sm:p-2 text-left bg-white dark:bg-[#1e1e1e] hover:bg-[#fafafa] dark:hover:bg-[#252525] transition-colors ${
                  selectedDateKey === cell.dateKey
                    ? "ring-2 ring-orange-500 ring-inset"
                    : ""
                } ${!cell.dateKey ? "opacity-50 pointer-events-none" : ""}`}
              >
                {cell.day != null && (
                  <>
                    <span className="text-sm font-medium text-[#212121] dark:text-[#ffffff]">
                      {cell.day}
                    </span>
                    {cell.dateKey && (
                      <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                        {hasActivity(cell.dateKey) && (
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${EVENT_COLORS.activity}`}
                            title="Actividad"
                          />
                        )}
                        {hasProposal(cell.dateKey) && (
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${EVENT_COLORS.proposal}`}
                            title="Propuesta"
                          />
                        )}
                        {hasFollowup(cell.dateKey) && (
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${EVENT_COLORS.followup}`}
                            title="Seguimiento"
                          />
                        )}
                      </div>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {selectedDateKey ? (
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f0f0f0] dark:bg-[#2a2a2a]">
              <h3 className="text-sm font-semibold text-[#212121] dark:text-[#ffffff] capitalize">
                {new Date(selectedDateKey + "T12:00:00").toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDateKey(null)}
                className="p-1.5 rounded-lg text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] hover:bg-[#e5e5e5] dark:hover:bg-[#333] transition-colors"
                aria-label="Cerrar"
              >
                Cerrar
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                  Sin eventos este día.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedEvents.map((e) => (
                    <li
                      key={e.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setOpenedEvent({ type: e.type, recordId: e.recordId })}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          setOpenedEvent({ type: e.type, recordId: e.recordId });
                        }
                      }}
                      className="flex flex-col gap-1 p-3 rounded-lg bg-white dark:bg-[#1e1e1e] border border-[#e8e8e8] dark:border-[#333] cursor-pointer hover:border-orange-500/50 hover:ring-1 hover:ring-orange-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium text-white ${EVENT_COLORS[e.type]}`}
                        >
                          {e.typeLabel}
                        </span>
                        {e.timeLabel && (
                          <span className="text-xs text-[#616161] dark:text-[#b0b0b0] tabular-nums font-medium">
                            {e.timeLabel}
                          </span>
                        )}
                        {e.extra && (
                          <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                            {e.extra}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-[#212121] dark:text-[#ffffff] block">
                        {e.businessName}
                      </span>
                      <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {e.sellerName}
                      </span>
                    </li>
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
      <FollowUpDetailModal
        taskId={openedEvent?.type === "followup" ? openedEvent.recordId : null}
        isOpen={openedEvent !== null && openedEvent.type === "followup"}
        onClose={() => setOpenedEvent(null)}
      />
    </section>
  );
}
