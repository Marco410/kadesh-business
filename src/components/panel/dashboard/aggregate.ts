import {
  PIPELINE_STATUS,
  PROJECT_STATUS,
  QUOTATION_STATUS,
} from "kadesh/constants/constans";
import {
  OPEN_PIPELINE_STATUSES,
  PIPELINE_ORDER,
  TOP_BREAKDOWN_COUNT,
  WEEKLY_BAR_COUNT,
} from "./constants";
import {
  formatWeekLabel,
  startOfIsoWeekYmd,
  toYmd,
  type DashboardDateRanges,
} from "./dates";
import type {
  CompanyDashboardResponse,
  DashboardFollowUp,
  DashboardProject,
  DashboardQuotation,
  DashboardRecentLead,
} from "./queries";

export type NamedCount = {
  key: string;
  label: string;
  count: number;
};

export type PipelineBar = {
  status: string;
  label: string;
  count: number;
  value: number;
};

export type WeeklyBar = {
  weekStart: string;
  label: string;
  count: number;
};

export type DashboardStats = {
  companyName: string;
  planName: string | null;
  usersCount: number;
  workspacesCount: number;
  leadsCount: number;
  leadsThisMonth: number;
  leadsLastMonth: number;
  leadsMonthDeltaPct: number | null;
  unassignedLeads: number;
  wonLeads: number;
  lostLeads: number;
  contactedLeads: number;
  closeRate: number | null;
  conversionRate: number | null;
  openPipelineValue: number;
  wonPipelineValue: number;
  pipelineCount: number;
  pipelineTruncated: boolean;
  pipelineBars: PipelineBar[];
  weeklyBars: WeeklyBar[];
  topCategories: NamedCount[];
  topCities: NamedCount[];
  topSources: NamedCount[];
  opportunityBars: NamedCount[];
  quotationsCount: number;
  quotationStatus: NamedCount[];
  acceptedQuotationValue: number;
  expiringQuotations: DashboardQuotation[];
  projectsCount: number;
  projectStatus: NamedCount[];
  overdueFollowUpsCount: number;
  followUpsToday: DashboardFollowUp[];
  followUpsOverdue: DashboardFollowUp[];
  followUpsUpcoming: DashboardFollowUp[];
  recentLeads: DashboardRecentLead[];
  recentQuotations: DashboardQuotation[];
  recentProjects: DashboardProject[];
};

function pipelineLabel(status: string): string {
  return status.replace(/^\d+\s*-\s*/, "");
}

function countBy(
  items: Array<string | null | undefined>,
  limit = TOP_BREAKDOWN_COUNT,
): NamedCount[] {
  const map = new Map<string, number>();
  for (const raw of items) {
    const key = (raw ?? "").trim() || "Sin dato";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, label: key, count }));
}

const EMPTY_STATS: DashboardStats = {
  companyName: "",
  planName: null,
  usersCount: 0,
  workspacesCount: 0,
  leadsCount: 0,
  leadsThisMonth: 0,
  leadsLastMonth: 0,
  leadsMonthDeltaPct: null,
  unassignedLeads: 0,
  wonLeads: 0,
  lostLeads: 0,
  contactedLeads: 0,
  closeRate: null,
  conversionRate: null,
  openPipelineValue: 0,
  wonPipelineValue: 0,
  pipelineCount: 0,
  pipelineTruncated: false,
  pipelineBars: [],
  weeklyBars: [],
  topCategories: [],
  topCities: [],
  topSources: [],
  opportunityBars: [],
  quotationsCount: 0,
  quotationStatus: [],
  acceptedQuotationValue: 0,
  expiringQuotations: [],
  projectsCount: 0,
  projectStatus: [],
  overdueFollowUpsCount: 0,
  followUpsToday: [],
  followUpsOverdue: [],
  followUpsUpcoming: [],
  recentLeads: [],
  recentQuotations: [],
  recentProjects: [],
};

export function aggregateDashboard(
  data: CompanyDashboardResponse | undefined,
  dates: DashboardDateRanges,
): DashboardStats | null {
  const company = data?.saasCompany;
  if (!company) return data ? EMPTY_STATS : null;

  const pipeline = company.pipeline ?? [];
  const lostLeads = pipeline.filter(
    (row) => row.pipelineStatus === PIPELINE_STATUS.CERRADO_PERDIDO,
  ).length;

  const pipelineMap = new Map<string, { count: number; value: number }>();
  for (const status of PIPELINE_ORDER) {
    pipelineMap.set(status, { count: 0, value: 0 });
  }
  let openPipelineValue = 0;
  let wonPipelineValue = 0;
  for (const row of pipeline) {
    const status = row.pipelineStatus ?? PIPELINE_STATUS.DETECTADO;
    const current = pipelineMap.get(status) ?? { count: 0, value: 0 };
    const value = row.estimatedValue ?? 0;
    current.count += 1;
    current.value += value;
    pipelineMap.set(status, current);
    if (OPEN_PIPELINE_STATUSES.has(status)) openPipelineValue += value;
    if (status === PIPELINE_STATUS.CERRADO_GANADO) wonPipelineValue += value;
  }

  const pipelineBars: PipelineBar[] = PIPELINE_ORDER.map((status) => {
    const entry = pipelineMap.get(status) ?? { count: 0, value: 0 };
    return {
      status,
      label: pipelineLabel(status),
      count: entry.count,
      value: entry.value,
    };
  }).filter((bar) => bar.count > 0);

  const weekCounts = new Map(dates.weekStarts.map((week) => [week, 0]));
  for (const row of pipeline) {
    const created = toYmd(row.businessLead?.createdAt);
    if (!created) continue;
    const week = startOfIsoWeekYmd(created);
    if (weekCounts.has(week)) {
      weekCounts.set(week, (weekCounts.get(week) ?? 0) + 1);
    }
  }
  const weeklyBars: WeeklyBar[] = dates.weekStarts
    .slice(-WEEKLY_BAR_COUNT)
    .map((weekStart) => ({
      weekStart,
      label: formatWeekLabel(weekStart),
      count: weekCounts.get(weekStart) ?? 0,
    }));

  const leadsThisMonth = company.leadsThisMonth ?? 0;
  const leadsLastMonth = company.leadsLastMonth ?? 0;
  const leadsMonthDeltaPct =
    leadsLastMonth > 0
      ? ((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100
      : leadsThisMonth > 0
        ? 100
        : null;

  const wonLeads = company.wonLeads ?? 0;
  const contactedLeads = company.contactedLeads ?? 0;
  const closed = wonLeads + lostLeads;
  const closeRate = closed > 0 ? (wonLeads / closed) * 100 : null;
  const conversionRate =
    company.leadsCount > 0 ? (wonLeads / company.leadsCount) * 100 : null;

  const quotationStatusMap = new Map<string, number>();
  for (const option of Object.values(QUOTATION_STATUS)) {
    quotationStatusMap.set(option, 0);
  }
  let acceptedQuotationValue = 0;
  for (const quotation of company.recentQuotations ?? []) {
    const status = quotation.status ?? QUOTATION_STATUS.DRAFT;
    quotationStatusMap.set(status, (quotationStatusMap.get(status) ?? 0) + 1);
    if (status === QUOTATION_STATUS.ACCEPTED) {
      acceptedQuotationValue += quotation.total ?? 0;
    }
  }
  const quotationLabels: Record<string, string> = {
    [QUOTATION_STATUS.DRAFT]: "Borrador",
    [QUOTATION_STATUS.SENT]: "Enviada",
    [QUOTATION_STATUS.ACCEPTED]: "Aceptada",
    [QUOTATION_STATUS.REJECTED]: "Rechazada",
    [QUOTATION_STATUS.EXPIRED]: "Expirada",
  };
  const quotationStatus: NamedCount[] = [...quotationStatusMap.entries()]
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      label: quotationLabels[key] ?? key,
      count,
    }));

  const expiringQuotations = (company.recentQuotations ?? []).filter((q) => {
    if (!q.validUntil) return false;
    if (q.status !== QUOTATION_STATUS.SENT && q.status !== QUOTATION_STATUS.DRAFT)
      return false;
    const until = toYmd(q.validUntil);
    return until != null && until >= dates.today && until <= dates.plus7;
  });

  const projectStatusMap = new Map<string, number>();
  for (const option of Object.values(PROJECT_STATUS)) {
    projectStatusMap.set(option, 0);
  }
  for (const project of company.recentProjects ?? []) {
    const status = project.status ?? PROJECT_STATUS.PENDIENTE;
    projectStatusMap.set(status, (projectStatusMap.get(status) ?? 0) + 1);
  }
  const projectStatus: NamedCount[] = [...projectStatusMap.entries()]
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({ key, label: key, count }));

  const followUps = data.followUpsDue ?? [];
  const followUpsOverdue = followUps.filter((task) => {
    const day = toYmd(task.scheduledDate);
    return day != null && day < dates.today;
  });
  const followUpsToday = followUps.filter(
    (task) => toYmd(task.scheduledDate) === dates.today,
  );
  const followUpsUpcoming = followUps.filter((task) => {
    const day = toYmd(task.scheduledDate);
    return day != null && day > dates.today;
  });

  return {
    companyName: company.name ?? "",
    planName: company.plan?.name ?? null,
    usersCount: company.usersCount ?? 0,
    workspacesCount: company.workspacesCount ?? 0,
    leadsCount: company.leadsCount ?? 0,
    leadsThisMonth,
    leadsLastMonth,
    leadsMonthDeltaPct,
    unassignedLeads: company.unassignedLeads ?? 0,
    wonLeads,
    lostLeads,
    contactedLeads,
    closeRate,
    conversionRate,
    openPipelineValue,
    wonPipelineValue,
    pipelineCount: company.pipelineCount ?? pipeline.length,
    pipelineTruncated: (company.pipelineCount ?? 0) > pipeline.length,
    pipelineBars,
    weeklyBars,
    topCategories: countBy(pipeline.map((row) => row.businessLead?.category)),
    topCities: countBy(pipeline.map((row) => row.businessLead?.city)),
    topSources: countBy(pipeline.map((row) => row.businessLead?.source)),
    opportunityBars: countBy(
      pipeline.map((row) => row.opportunityLevel),
      3,
    ),
    quotationsCount: company.quotationsCount ?? 0,
    quotationStatus,
    acceptedQuotationValue,
    expiringQuotations,
    projectsCount: company.projectsCount ?? 0,
    projectStatus,
    overdueFollowUpsCount: data.overdueFollowUpsCount ?? followUpsOverdue.length,
    followUpsToday,
    followUpsOverdue,
    followUpsUpcoming,
    recentLeads: company.recentLeads ?? [],
    recentQuotations: company.recentQuotations ?? [],
    recentProjects: company.recentProjects ?? [],
  };
}
