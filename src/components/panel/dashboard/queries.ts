import { gql } from "@apollo/client";

export const COMPANY_DASHBOARD_QUERY = gql`
  query CompanyDashboard(
    $companyId: ID!
    $leadsWhere: TechBusinessLeadWhereInput!
    $leadsThisMonthWhere: TechBusinessLeadWhereInput!
    $leadsLastMonthWhere: TechBusinessLeadWhereInput!
    $unassignedWhere: TechBusinessLeadWhereInput!
    $wonWhere: TechBusinessLeadWhereInput!
    $contactedWhere: TechBusinessLeadWhereInput!
    $statusWhere: TechStatusBusinessLeadWhereInput!
    $quotationsWhere: SaasQuotationWhereInput!
    $projectsWhere: SaasProjectWhereInput!
    $followUpsWhere: TechFollowUpTaskWhereInput!
    $overdueFollowUpsWhere: TechFollowUpTaskWhereInput!
    $statusTake: Int!
    $recentLeadsTake: Int!
    $quotationsTake: Int!
    $projectsTake: Int!
    $followUpsTake: Int!
  ) {
    saasCompany(where: { id: $companyId }) {
      id
      name
      purchasedBonusCredits
      plan {
        id
        name
      }
      usersCount
      workspacesCount
      leadsCount(where: $leadsWhere)
      leadsThisMonth: leadsCount(where: $leadsThisMonthWhere)
      leadsLastMonth: leadsCount(where: $leadsLastMonthWhere)
      unassignedLeads: leadsCount(where: $unassignedWhere)
      wonLeads: leadsCount(where: $wonWhere)
      contactedLeads: leadsCount(where: $contactedWhere)
      quotationsCount(where: $quotationsWhere)
      projectsCount(where: $projectsWhere)
      pipelineCount: techStatusBusinessLeadsCount(where: $statusWhere)
      pipeline: techStatusBusinessLeads(where: $statusWhere, take: $statusTake) {
        id
        pipelineStatus
        estimatedValue
        opportunityLevel
        firstContactDate
        salesPerson {
          id
          name
          lastName
        }
        businessLead {
          id
          businessName
          category
          city
          source
          createdAt
        }
      }
      recentLeads: leads(
        where: $leadsWhere
        orderBy: [{ createdAt: desc }]
        take: $recentLeadsTake
      ) {
        id
        businessName
        category
        city
        source
        phone
        createdAt
        status(where: $statusWhere) {
          pipelineStatus
          estimatedValue
          opportunityLevel
        }
      }
      recentQuotations: quotations(
        where: $quotationsWhere
        orderBy: [{ createdAt: desc }]
        take: $quotationsTake
      ) {
        id
        quotationNumber
        status
        total
        currency
        validUntil
        createdAt
        lead {
          id
          businessName
        }
      }
      recentProjects: projects(
        where: $projectsWhere
        orderBy: [{ updatedAt: desc }]
        take: $projectsTake
      ) {
        id
        name
        status
        serviceType
        businessLead {
          id
          businessName
        }
      }
    }
    followUpsDue: techFollowUpTasks(
      where: $followUpsWhere
      orderBy: [{ scheduledDate: asc }]
      take: $followUpsTake
    ) {
      id
      scheduledDate
      status
      priority
      notes
      businessLead {
        id
        businessName
      }
      assignedSeller {
        id
        name
        lastName
      }
    }
    overdueFollowUpsCount: techFollowUpTasksCount(where: $overdueFollowUpsWhere)
  }
`;

export const DASHBOARD_STATUS_TAKE = 2000;
export const DASHBOARD_RECENT_LEADS_TAKE = 8;
export const DASHBOARD_QUOTATIONS_TAKE = 80;
export const DASHBOARD_PROJECTS_TAKE = 40;
export const DASHBOARD_FOLLOW_UPS_TAKE = 24;

export interface DashboardPipelineRow {
  id: string;
  pipelineStatus: string | null;
  estimatedValue: number | null;
  opportunityLevel: string | null;
  firstContactDate: string | null;
  salesPerson: { id: string; name: string; lastName: string | null } | null;
  businessLead: {
    id: string;
    businessName: string;
    category: string | null;
    city: string | null;
    source: string | null;
    createdAt: string;
  } | null;
}

export interface DashboardRecentLead {
  id: string;
  businessName: string;
  category: string | null;
  city: string | null;
  source: string | null;
  phone: string | null;
  createdAt: string;
  status: Array<{
    pipelineStatus: string | null;
    estimatedValue: number | null;
    opportunityLevel: string | null;
  }> | null;
}

export interface DashboardQuotation {
  id: string;
  quotationNumber: string;
  status: string | null;
  total: number | null;
  currency: string | null;
  validUntil: string | null;
  createdAt: string;
  lead: { id: string; businessName: string | null } | null;
}

export interface DashboardProject {
  id: string;
  name: string;
  status: string | null;
  serviceType: string | null;
  businessLead: { id: string; businessName: string | null } | null;
}

export interface DashboardFollowUp {
  id: string;
  scheduledDate: string;
  status: string;
  priority: string;
  notes: string | null;
  businessLead: { id: string; businessName: string } | null;
  assignedSeller: { id: string; name: string; lastName: string | null } | null;
}

export interface CompanyDashboardResponse {
  saasCompany: {
    id: string;
    name: string | null;
    purchasedBonusCredits: number | null;
    plan: { id: string; name: string | null } | null;
    usersCount: number;
    workspacesCount: number;
    leadsCount: number;
    leadsThisMonth: number;
    leadsLastMonth: number;
    unassignedLeads: number;
    wonLeads: number;
    contactedLeads: number;
    quotationsCount: number;
    projectsCount: number;
    pipelineCount: number;
    pipeline: DashboardPipelineRow[];
    recentLeads: DashboardRecentLead[];
    recentQuotations: DashboardQuotation[];
    recentProjects: DashboardProject[];
  } | null;
  followUpsDue: DashboardFollowUp[];
  overdueFollowUpsCount: number;
}

export type JsonFilter = Record<string, unknown>;

export interface CompanyDashboardVariables {
  companyId: string;
  leadsWhere: JsonFilter;
  leadsThisMonthWhere: JsonFilter;
  leadsLastMonthWhere: JsonFilter;
  unassignedWhere: JsonFilter;
  wonWhere: JsonFilter;
  contactedWhere: JsonFilter;
  statusWhere: JsonFilter;
  quotationsWhere: JsonFilter;
  projectsWhere: JsonFilter;
  followUpsWhere: JsonFilter;
  overdueFollowUpsWhere: JsonFilter;
  statusTake: number;
  recentLeadsTake: number;
  quotationsTake: number;
  projectsTake: number;
  followUpsTake: number;
}
