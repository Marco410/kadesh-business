"use client";

import { useCallback, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, CalendarIcon } from "@hugeicons/core-free-icons";
import { useQuery } from "@apollo/client";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import {
  TECH_SALES_ACTIVITIES_QUERY,
  TECH_PROPOSALS_QUERY,
  TECH_FOLLOW_UP_TASKS_QUERY,
  TECH_TASKS_QUERY,
  type TechTasksResponse,
  type TechTasksVariables,
  type TechSalesActivitiesResponse,
  type TechSalesActivitiesCalendarVariables,
  type TechProposalsResponse,
  type TechProposalsCalendarVariables,
  type TechFollowUpTasksResponse,
  type TechFollowUpTasksCalendarVariables,
} from "kadesh/components/profile/sales/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import { useWorkspaceContext } from "kadesh/components/profile/sales/workspaces/WorkspaceContext";
import { Role } from "kadesh/constants/constans";
import { EVENT_LABELS } from "kadesh/constants/constans";
import SalesCalendarView, { type CalendarEvent } from "kadesh/components/profile/sales/SalesCalendarView";
import { COMPANY_VENDEDORES_WITH_STATS_QUERY, type CompanyVendedoresWithStatsResponse, type CompanyVendedoresWithStatsVariables } from "./queries";
import { useUser } from "kadesh/utils/UserContext";
import GoogleCalendarConnectionsPanel from "kadesh/components/profile/sales/google-calendar/GoogleCalendarConnectionsPanel";
import CalendarEventModal from "kadesh/components/profile/sales/google-calendar/CalendarEventModal";
import {
  accountDisplayLabel,
  calendarDisplayName,
} from "kadesh/components/profile/sales/google-calendar/labels";
import CalendarLayersBar, {
  type CalendarLayerGroup,
} from "kadesh/components/profile/sales/google-calendar/CalendarLayersBar";
import { useGoogleCalendarAccounts } from "kadesh/components/profile/sales/google-calendar/useGoogleCalendarAccounts";
import {
  SYNC_GOOGLE_CALENDAR_NOW_QUERY,
  TECH_CALENDAR_EVENTS_QUERY,
  type NativeCalendarEvent,
  type SyncGoogleCalendarNowResponse,
  type SyncGoogleCalendarNowVariables,
  type TechCalendarEventsResponse,
  type TechCalendarEventsVariables,
} from "kadesh/components/profile/sales/google-calendar/queries";
import {
  formatEventTime,
  localDateKey,
  visibleRange,
} from "kadesh/components/profile/sales/google-calendar/dates";

/** Azul de Google Calendar para calendarios sin color asignado. */
const DEFAULT_GOOGLE_COLOR = "#039be5";

/** Capas de Kadesh (mismos colores que los puntos del calendario). */
const KADESH_LAYERS = [
  { key: "activity", label: "Actividades", color: "#f97316" },
  { key: "proposal", label: "Propuestas", color: "#3b82f6" },
  { key: "followup", label: "Seguimientos", color: "#10b981" },
  { key: "task", label: "Tareas", color: "#f59e0b" },
  { key: "native", label: "Eventos", color: "#8b5cf6" },
];

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

function formatSellerName(name: string, lastName: string | null, secondLastName: string | null): string {
  return [name, lastName, secondLastName].filter(Boolean).join(" ") || "—";
}

interface VendedoresCalendarProps {
  userId: string;
}

export default function VendedoresCalendar({ userId }: VendedoresCalendarProps) {
  const { currentWorkspaceId } = useWorkspaceContext();
  const { user } = useUser();
  const isAdminCompany =
    user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  const { data: vendedoresData } = useQuery<
    CompanyVendedoresWithStatsResponse,
    CompanyVendedoresWithStatsVariables
  >(COMPANY_VENDEDORES_WITH_STATS_QUERY, {
    variables: {
      where: {
        company: companyId ? { id: { equals: companyId } } : undefined,
        roles: { some: { name: { equals: Role.VENDEDOR } } },
      },
    },
    skip: !companyId || !isAdminCompany,
  });

  const vendedores = vendedoresData?.users ?? [];
  const vendedorIds = useMemo(
    () => (isAdminCompany ? vendedores.map((v) => v.id) : [userId]),
    [vendedores, isAdminCompany, userId],
  );
  const sellerIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    if (isAdminCompany) {
      vendedores.forEach((v) => {
        map[v.id] = formatSellerName(v.name, v.lastName, v.secondLastName);
      });
    } else {
      map[userId] = user?.name ?? "Yo";
    }
    return map;
  }, [vendedores, isAdminCompany, userId, user?.name]);

  const whereCalendar: TechSalesActivitiesCalendarVariables["where"] =
    mergeWorkspaceFilter(
      { assignedSeller: { id: { in: vendedorIds } } },
      currentWorkspaceId
    );

  const { data: activitiesData } = useQuery<
    TechSalesActivitiesResponse,
    TechSalesActivitiesCalendarVariables
  >(TECH_SALES_ACTIVITIES_QUERY, {
    variables: { where: whereCalendar },
    skip: vendedorIds.length === 0,
    fetchPolicy: "network-only",
  });
  const { data: proposalsData } = useQuery<
    TechProposalsResponse,
    TechProposalsCalendarVariables
  >(TECH_PROPOSALS_QUERY, {
    variables: { where: whereCalendar },
    skip: vendedorIds.length === 0,
    fetchPolicy: "network-only",
  });
  const { data: tasksData } = useQuery<
    TechFollowUpTasksResponse,
    TechFollowUpTasksCalendarVariables
  >(TECH_FOLLOW_UP_TASKS_QUERY, {
    variables: { where: whereCalendar },
    skip: vendedorIds.length === 0,
    fetchPolicy: "network-only",
  });

  // Tareas (TechTask): su responsable es `responsible`, no `assignedSeller`.
  const { data: techTasksData } = useQuery<TechTasksResponse, TechTasksVariables>(
    TECH_TASKS_QUERY,
    {
      variables: {
        where: mergeWorkspaceFilter(
          { responsible: { id: { in: vendedorIds } } },
          currentWorkspaceId,
        ),
      },
      skip: vendedorIds.length === 0,
      fetchPolicy: "network-only",
    },
  );

  // --- Eventos nativos de Kadesh (creados a mano) y de Google Calendar ---
  const [showGooglePanel, setShowGooglePanel] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [eventModal, setEventModal] = useState<{
    open: boolean;
    event: NativeCalendarEvent | null;
  }>({ open: false, event: null });
  const handleVisibleMonthChange = useCallback((month: Date) => setVisibleMonth(month), []);

  const { accounts, selectedSelectionIds } = useGoogleCalendarAccounts({ skip: !companyId });

  // --- Capas visibles: cada tipo de Kadesh y cada calendario de Google es una casilla ---
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  const layerGroups = useMemo<CalendarLayerGroup[]>(() => {
    const kadesh: CalendarLayerGroup = {
      id: "kadesh",
      label: "Kadesh",
      layers: KADESH_LAYERS,
    };
    const google = accounts
      .filter((a) => a.isActive)
      .map((a) => ({
        id: a.id,
        label: accountDisplayLabel(a),
        layers: a.calendars
          .filter((c) => c.isSelected)
          .map((c) => ({
            key: c.id,
            label: calendarDisplayName(a, c),
            color: c.colorHex ?? DEFAULT_GOOGLE_COLOR,
          })),
      }))
      .filter((g) => g.layers.length > 0);
    return [kadesh, ...google];
  }, [accounts]);

  // Para rotular los eventos de Google según su cuenta (la compartida no muestra el correo).
  const calendarLookup = useMemo(() => {
    const map = new Map<string, { accountLabel: string; calendarLabel: string }>();
    accounts.forEach((a) =>
      a.calendars.forEach((c) =>
        map.set(c.id, { accountLabel: accountDisplayLabel(a), calendarLabel: calendarDisplayName(a, c) }),
      ),
    );
    return map;
  }, [accounts]);

  const handleLayerToggle = useCallback((key: string) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleGroupToggle = useCallback(
    (groupId: string, show: boolean) => {
      const group = layerGroups.find((g) => g.id === groupId);
      if (!group) return;
      setHiddenKeys((prev) => {
        const next = new Set(prev);
        group.layers.forEach((l) => (show ? next.delete(l.key) : next.add(l.key)));
        return next;
      });
    },
    [layerGroups],
  );

  const range = useMemo(() => visibleRange(visibleMonth), [visibleMonth]);

  // Los eventos generados desde actividades/propuestas/seguimientos ya salen de sus propias
  // queries; aquí solo los creados directamente en el calendario.
  const { data: nativeData, refetch: refetchNative } = useQuery<
    TechCalendarEventsResponse,
    TechCalendarEventsVariables
  >(TECH_CALENDAR_EVENTS_QUERY, {
    variables: { where: { sourceType: { equals: "native" } } },
    skip: !companyId,
    fetchPolicy: "cache-and-network",
  });

  const { data: googleData, refetch: refetchGoogle } = useQuery<
    SyncGoogleCalendarNowResponse,
    SyncGoogleCalendarNowVariables
  >(SYNC_GOOGLE_CALENDAR_NOW_QUERY, {
    variables: { selectionIds: selectedSelectionIds, ...range },
    skip: !companyId || selectedSelectionIds.length === 0,
    fetchPolicy: "network-only",
  });

  const refreshExternalEvents = useCallback(() => {
    void refetchNative();
    if (selectedSelectionIds.length > 0) void refetchGoogle();
  }, [refetchNative, refetchGoogle, selectedSelectionIds.length]);

  const googleSync = googleData?.syncGoogleCalendarNow;

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    const add = (e: CalendarEvent) => {
      if (hiddenKeys.has(e.type)) return;
      const list = map.get(e.dateKey) ?? [];
      list.push(e);
      map.set(e.dateKey, list);
    };

    (activitiesData?.techSalesActivities ?? []).forEach((a) => {
      const sellerId = a.assignedSeller?.id;
      const sellerName = sellerId ? (sellerIdToName[sellerId] ?? "—") : "—";
      add({
        id: `activity-${a.id}`,
        recordId: a.id,
        type: "activity",
        typeLabel: EVENT_LABELS.activity,
        dateKey: toDateKey(a.activityDate),
        timeLabel: formatTime(a.activityDate),
        businessName: a.businessLead?.businessName ?? "—",
        sellerName,
        extra: a.type,
      });
    });
    (proposalsData?.techProposals ?? []).forEach((p) => {
      const sellerId = p.assignedSeller?.id;
      const sellerName = sellerId ? (sellerIdToName[sellerId] ?? "—") : "—";
      add({
        id: `proposal-${p.id}`,
        recordId: p.id,
        type: "proposal",
        typeLabel: EVENT_LABELS.proposal,
        dateKey: toDateKey(p.sentDate),
        timeLabel: null,
        businessName: p.businessLead?.businessName ?? "—",
        sellerName,
        extra: p.status,
      });
    });
    (tasksData?.techFollowUpTasks ?? []).forEach((t) => {
      const sellerId = t.assignedSeller?.id;
      const sellerName = sellerId ? (sellerIdToName[sellerId] ?? "—") : "—";
      add({
        id: `followup-${t.id}`,
        recordId: t.id,
        type: "followup",
        typeLabel: EVENT_LABELS.followup,
        dateKey: toDateKey(t.scheduledDate),
        timeLabel: null,
        businessName: t.businessLead?.businessName ?? "—",
        sellerName,
        extra: t.status,
      });
    });

    (techTasksData?.techTasks ?? []).forEach((t) => {
      const sellerId = t.responsible?.id;
      const leadName = t.businessLead?.businessName;
      add({
        id: `task-${t.id}`,
        recordId: t.id,
        type: "task",
        typeLabel: EVENT_LABELS.task,
        dateKey: localDateKey(t.startDate),
        timeLabel: formatEventTime(t.startDate),
        businessName: t.title || leadName || "Tarea",
        sellerName: sellerId ? (sellerIdToName[sellerId] ?? "—") : "—",
        extra: t.title && leadName ? leadName : t.priority,
      });
    });
    (nativeData?.techCalendarEvents ?? []).forEach((ev) => {
      add({
        id: `native-${ev.id}`,
        recordId: ev.id,
        type: "native",
        typeLabel: EVENT_LABELS.native,
        // Día completo: la fecha se guarda en UTC; con hora: día local.
        dateKey: ev.allDay ? ev.startAt.slice(0, 10) : localDateKey(ev.startAt),
        timeLabel: ev.allDay ? null : formatEventTime(ev.startAt),
        businessName: ev.title,
        sellerName: ev.createdBy?.name ?? "—",
        extra: ev.location ?? undefined,
      });
    });
    (googleSync?.events ?? []).forEach((ev) => {
      // Los que empujó Kadesh ya se muestran como nativos/CRM: no duplicar.
      if (ev.kadeshEventId) return;
      if (hiddenKeys.has(ev.selectionId)) return;
      add({
        id: `google-${ev.selectionId}-${ev.id}`,
        recordId: ev.id,
        type: "google",
        typeLabel: EVENT_LABELS.google,
        dateKey: ev.allDay ? ev.start.slice(0, 10) : localDateKey(ev.start),
        timeLabel: ev.allDay ? null : formatEventTime(ev.start),
        businessName: ev.title,
        sellerName: calendarLookup.get(ev.selectionId)?.accountLabel ?? ev.accountEmail,
        // Si el calendario se llama como la cuenta (el principal), no repetir el correo.
        extra: (() => {
          const label = calendarLookup.get(ev.selectionId)?.calendarLabel ?? ev.calendarName;
          return label !== ev.accountEmail ? label : undefined;
        })(),
        href: ev.htmlLink,
        color: ev.colorHex ?? DEFAULT_GOOGLE_COLOR,
      });
    });

    return map;
  }, [
    activitiesData?.techSalesActivities,
    proposalsData?.techProposals,
    tasksData?.techFollowUpTasks,
    techTasksData?.techTasks,
    nativeData?.techCalendarEvents,
    googleSync?.events,
    calendarLookup,
    hiddenKeys,
    sellerIdToName,
  ]);

  const handleOpenExternalEvent = (event: CalendarEvent) => {
    if (event.type !== "native") return;
    const native = nativeData?.techCalendarEvents.find((n) => n.id === event.recordId) ?? null;
    if (native) setEventModal({ open: true, event: native });
  };

  if (!companyId) {
    return (
      <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8 shadow-sm">
        <p className="text-[#616161] dark:text-[#b0b0b0]">
          No tienes una empresa asociada. Asocia un negocio desde la sección de ventas para ver el calendario.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <CalendarLayersBar
          groups={layerGroups}
          hiddenKeys={hiddenKeys}
          onToggle={handleLayerToggle}
          onToggleGroup={handleGroupToggle}
        />
        <div className="flex shrink-0 flex-row gap-2 lg:flex-col">
          <button
            type="button"
            data-tour="calendar-new-event"
            onClick={() => setEventModal({ open: true, event: null })}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Nuevo evento
          </button>
          <button
            type="button"
            data-tour="calendar-google-toggle"
            aria-expanded={showGooglePanel}
            aria-controls="google-calendar-panel"
            onClick={() => setShowGooglePanel((v) => !v)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm font-semibold text-[#212121] transition-colors hover:border-orange-500/50 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-[#e0e0e0]"
          >
            <HugeiconsIcon icon={CalendarIcon} size={16} />
            Google Calendar
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              className={`transition-transform duration-200 ${showGooglePanel ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {showGooglePanel ? (
        <div id="google-calendar-panel">
          <GoogleCalendarConnectionsPanel onChanged={refreshExternalEvents} />
        </div>
      ) : null}

      {googleSync && !googleSync.success && googleSync.message ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {googleSync.message}
        </p>
      ) : null}

      <SalesCalendarView
        eventsByDate={eventsByDate}
        title={isAdminCompany ? "Calendario de vendedores" : "Mi calendario"}
        hideLegend
        onVisibleMonthChange={handleVisibleMonthChange}
        onOpenExternalEvent={handleOpenExternalEvent}
      />

      <CalendarEventModal
        isOpen={eventModal.open}
        event={eventModal.event}
        onClose={() => setEventModal({ open: false, event: null })}
        onChanged={refreshExternalEvents}
      />
    </div>
  );
}
