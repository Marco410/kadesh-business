"use client";

import { useMemo } from "react";
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
  type TechSalesActivitiesResponse,
  type TechSalesActivitiesCalendarVariables,
  type TechProposalsResponse,
  type TechProposalsCalendarVariables,
  type TechFollowUpTasksResponse,
  type TechFollowUpTasksCalendarVariables,
} from "kadesh/components/profile/sales/queries";
import { Role } from "kadesh/constants/constans";
import { EVENT_LABELS } from "kadesh/components/profile/sales/constants";
import SalesCalendarView, { type CalendarEvent } from "kadesh/components/profile/sales/SalesCalendarView";
import { COMPANY_VENDEDORES_WITH_STATS_QUERY, type CompanyVendedoresWithStatsResponse, type CompanyVendedoresWithStatsVariables } from "./queries";

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
    skip: !companyId,
  });

  const vendedores = vendedoresData?.users ?? [];
  const vendedorIds = useMemo(() => vendedores.map((v) => v.id), [vendedores]);
  const sellerIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    vendedores.forEach((v) => {
      map[v.id] = formatSellerName(v.name, v.lastName, v.secondLastName);
    });
    return map;
  }, [vendedores]);

  const whereCalendar: TechSalesActivitiesCalendarVariables["where"] = {
    assignedSeller: { id: { in: vendedorIds } },
  };

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

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    const add = (e: CalendarEvent) => {
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

    return map;
  }, [
    activitiesData?.techSalesActivities,
    proposalsData?.techProposals,
    tasksData?.techFollowUpTasks,
    sellerIdToName,
  ]);

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
    <SalesCalendarView
      eventsByDate={eventsByDate}
      title="Calendario de vendedores"
    />
  );
}
