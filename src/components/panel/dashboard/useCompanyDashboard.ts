"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  FOLLOW_UP_TASK_STATUS,
  PIPELINE_STATUS,
  Role,
} from "kadesh/constants/constans";
import {
  COMPANY_VENDEDORES_WITH_STATS_QUERY,
  type CompanyVendedoresWithStatsResponse,
  type CompanyVendedoresWithStatsVariables,
} from "kadesh/components/profile/sales/vendedores/queries";
import { useRemainingCredits } from "kadesh/components/panel/hooks";
import { aggregateDashboard } from "./aggregate";
import { getDashboardDateRanges } from "./dates";
import {
  COMPANY_DASHBOARD_QUERY,
  DASHBOARD_FOLLOW_UPS_TAKE,
  DASHBOARD_PROJECTS_TAKE,
  DASHBOARD_QUOTATIONS_TAKE,
  DASHBOARD_RECENT_LEADS_TAKE,
  DASHBOARD_STATUS_TAKE,
  type CompanyDashboardResponse,
  type CompanyDashboardVariables,
} from "./queries";

function sellerLeadFilter(userId: string) {
  return { salesPerson: { some: { id: { equals: userId } } } };
}

export function useCompanyDashboard({
  companyId,
  userId,
  hasCompanyWideLeadScope,
  isAdminCompany,
}: {
  companyId: string | null;
  userId: string;
  hasCompanyWideLeadScope: boolean;
  isAdminCompany: boolean;
}) {
  const dates = useMemo(() => getDashboardDateRanges(), []);

  const variables = useMemo<CompanyDashboardVariables | null>(() => {
    if (!companyId) return null;

    const sellerLeads = hasCompanyWideLeadScope ? {} : sellerLeadFilter(userId);
    const statusWhere = hasCompanyWideLeadScope
      ? { saasCompany: { id: { equals: companyId } } }
      : {
          saasCompany: { id: { equals: companyId } },
          salesPerson: { id: { equals: userId } },
        };
    const quotationsWhere = hasCompanyWideLeadScope
      ? {}
      : { assignedSeller: { id: { equals: userId } } };
    const projectsWhere = hasCompanyWideLeadScope
      ? {}
      : { responsible: { id: { equals: userId } } };

    const followUpBase = {
      status: {
        in: [FOLLOW_UP_TASK_STATUS.PENDIENTE, FOLLOW_UP_TASK_STATUS.POSPUESTO],
      },
      businessLead: { saasCompany: { some: { id: { equals: companyId } } } },
      ...(hasCompanyWideLeadScope
        ? {}
        : { assignedSeller: { id: { equals: userId } } }),
    };

    return {
      companyId,
      leadsWhere: sellerLeads,
      leadsThisMonthWhere: {
        ...sellerLeads,
        createdAt: { gte: dates.thisMonthStartIso },
      },
      leadsLastMonthWhere: {
        ...sellerLeads,
        createdAt: {
          gte: dates.lastMonthStartIso,
          lt: dates.thisMonthStartIso,
        },
      },
      unassignedWhere: hasCompanyWideLeadScope
        ? { salesPerson: { none: {} } }
        : { id: { equals: "__none__" } },
      wonWhere: {
        ...sellerLeads,
        status: {
          some: {
            pipelineStatus: { equals: PIPELINE_STATUS.CERRADO_GANADO },
            saasCompany: { id: { equals: companyId } },
            ...(hasCompanyWideLeadScope
              ? {}
              : { salesPerson: { id: { equals: userId } } }),
          },
        },
      },
      contactedWhere: {
        ...sellerLeads,
        status: {
          some: {
            firstContactDate: { gte: "1970-01-01" },
            saasCompany: { id: { equals: companyId } },
            ...(hasCompanyWideLeadScope
              ? {}
              : { salesPerson: { id: { equals: userId } } }),
          },
        },
      },
      statusWhere,
      quotationsWhere,
      projectsWhere,
      followUpsWhere: {
        ...followUpBase,
        scheduledDate: { lte: dates.plus7 },
      },
      overdueFollowUpsWhere: {
        ...followUpBase,
        scheduledDate: { lt: dates.today },
      },
      statusTake: DASHBOARD_STATUS_TAKE,
      recentLeadsTake: DASHBOARD_RECENT_LEADS_TAKE,
      quotationsTake: DASHBOARD_QUOTATIONS_TAKE,
      projectsTake: DASHBOARD_PROJECTS_TAKE,
      followUpsTake: DASHBOARD_FOLLOW_UPS_TAKE,
    };
  }, [companyId, dates, hasCompanyWideLeadScope, userId]);

  const dashboardQuery = useQuery<
    CompanyDashboardResponse,
    CompanyDashboardVariables
  >(COMPANY_DASHBOARD_QUERY, {
    variables: variables ?? undefined,
    skip: !variables,
    fetchPolicy: "cache-and-network",
  });

  const teamQuery = useQuery<
    CompanyVendedoresWithStatsResponse,
    CompanyVendedoresWithStatsVariables
  >(COMPANY_VENDEDORES_WITH_STATS_QUERY, {
    variables: {
      where: {
        company: { id: { equals: companyId ?? "" } },
        roles: { some: { name: { equals: Role.VENDEDOR } } },
      },
    },
    skip: !companyId || !isAdminCompany,
  });

  const credits = useRemainingCredits(companyId);

  const stats = useMemo(
    () => aggregateDashboard(dashboardQuery.data, dates),
    [dashboardQuery.data, dates],
  );

  return {
    stats,
    loading: dashboardQuery.loading && !dashboardQuery.data,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
    team: teamQuery.data?.users ?? [],
    teamLoading: teamQuery.loading && !teamQuery.data,
    credits,
    dates,
  };
}
