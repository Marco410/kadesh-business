"use client";

import { useMemo } from "react";
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
import { EVENT_LABELS } from "kadesh/constants/constans";
import SalesCalendarView, { type CalendarEvent } from "../SalesCalendarView";

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

export type { CalendarEvent };

export default function LeadDetailCalendar({
  leadId,
  userId,
  businessName,
  sellerName,
}: LeadDetailCalendarProps) {
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
      add({
        id: `activity-${a.id}`,
        recordId: a.id,
        type: "activity",
        typeLabel: EVENT_LABELS.activity,
        dateKey: toDateKey(a.activityDate),
        timeLabel: formatTime(a.activityDate),
        businessName: a.businessLead?.businessName ?? name,
        sellerName: seller,
        extra: a.type,
      });
    });
    (proposalsData?.techProposals ?? []).forEach((p) => {
      add({
        id: `proposal-${p.id}`,
        recordId: p.id,
        type: "proposal",
        typeLabel: EVENT_LABELS.proposal,
        dateKey: toDateKey(p.sentDate),
        timeLabel: null,
        businessName: p.businessLead?.businessName ?? name,
        sellerName: seller,
        extra: p.status,
      });
    });
    (tasksData?.techFollowUpTasks ?? []).forEach((t) => {
      add({
        id: `followup-${t.id}`,
        recordId: t.id,
        type: "followup",
        typeLabel: EVENT_LABELS.followup,
        dateKey: toDateKey(t.scheduledDate),
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

  return (
    <SalesCalendarView
      eventsByDate={eventsByDate}
      title="Calendario"
      className="mt-8"
    />
  );
}
