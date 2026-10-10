import { gql } from "@apollo/client";

/**
 * Alcance CRM de una empresa (mismo criterio que `adminCompanyInsights` en el back):
 * el item es de la empresa si su workspace lo es; sin workspace, si quien lo creó
 * o lo tiene asignado es de la empresa. Los leads se comparten entre empresas.
 */
export function crmScopeWhere(
  companyId: string,
  assigneeField: "assignedSeller" | "responsible" = "assignedSeller",
) {
  const companyIs = { company: { id: { equals: companyId } } };
  return {
    OR: [
      { workspace: companyIs },
      {
        AND: [
          { workspace: null },
          { OR: [{ createdBy: companyIs }, { [assigneeField]: companyIs }] },
        ],
      },
    ],
  };
}

/* ───────────────────────── Leads ───────────────────────── */

export const ADMIN_COMPANY_LEADS_QUERY = gql`
  query AdminCompanyLeads(
    $where: TechBusinessLeadWhereInput!
    $statusWhere: TechStatusBusinessLeadWhereInput!
    $take: Int
    $skip: Int!
  ) {
    techBusinessLeads(
      where: $where
      orderBy: [{ createdAt: desc }]
      take: $take
      skip: $skip
    ) {
      id
      businessName
      category
      phone
      city
      state
      country
      source
      rating
      createdAt
      status(where: $statusWhere, take: 1) {
        id
        pipelineStatus
        opportunityLevel
        estimatedValue
        salesPerson {
          id
          name
          lastName
        }
      }
    }
    techBusinessLeadsCount(where: $where)
  }
`;

export type AdminLeadStatus = {
  id: string;
  pipelineStatus: string | null;
  opportunityLevel: string | null;
  estimatedValue: number | null;
  salesPerson: { id: string; name: string; lastName: string | null } | null;
};

export type AdminCompanyLeadRow = {
  id: string;
  businessName: string;
  category: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  source: string | null;
  rating: number | null;
  createdAt: string;
  status: AdminLeadStatus[];
};

export type AdminCompanyLeadsResponse = {
  techBusinessLeads: AdminCompanyLeadRow[];
  techBusinessLeadsCount: number;
};

/* ───────────────────────── Vista rápida de un lead ───────────────────────── */

export const ADMIN_LEAD_QUICK_VIEW_QUERY = gql`
  query AdminLeadQuickView(
    $id: ID!
    $statusWhere: TechStatusBusinessLeadWhereInput!
    $crmWhere: TechSalesActivityWhereInput!
    $followUpWhere: TechFollowUpTaskWhereInput!
    $proposalWhere: TechProposalWhereInput!
    $quotationWhere: SaasQuotationWhereInput!
  ) {
    techBusinessLead(where: { id: $id }) {
      id
      businessName
      category
      phone
      email
      address
      city
      state
      country
      rating
      reviewCount
      hasWebsite
      source
      googleMapsUrl
      createdAt
      status(where: $statusWhere, take: 1) {
        id
        pipelineStatus
        opportunityLevel
        estimatedValue
        productOffered
        firstContactDate
        notes
        salesPerson {
          id
          name
          lastName
        }
      }
      activities(where: $crmWhere, orderBy: [{ activityDate: desc }], take: 15) {
        id
        type
        title
        result
        activityDate
        assignedSeller {
          id
          name
          lastName
        }
      }
      followUpTasks(where: $followUpWhere, orderBy: [{ scheduledDate: desc }], take: 10) {
        id
        scheduledDate
        status
        priority
        notes
      }
      proposals(where: $proposalWhere, orderBy: [{ createdAt: desc }], take: 10) {
        id
        status
        amount
        product
        sentDate
      }
      quotations(where: $quotationWhere, orderBy: [{ createdAt: desc }], take: 10) {
        id
        quotationNumber
        status
        total
        currency
        createdAt
      }
    }
  }
`;

export type AdminLeadQuickView = {
  id: string;
  businessName: string;
  category: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  rating: number | null;
  reviewCount: number | null;
  hasWebsite: boolean | null;
  source: string | null;
  googleMapsUrl: string | null;
  createdAt: string | null;
  status: Array<
    AdminLeadStatus & {
      productOffered: string | null;
      firstContactDate: string | null;
      notes: string | null;
    }
  >;
  activities: Array<{
    id: string;
    type: string | null;
    title: string | null;
    result: string | null;
    activityDate: string | null;
    assignedSeller: { id: string; name: string; lastName: string | null } | null;
  }>;
  followUpTasks: Array<{
    id: string;
    scheduledDate: string | null;
    status: string | null;
    priority: string | null;
    notes: string | null;
  }>;
  proposals: Array<{
    id: string;
    status: string | null;
    amount: number | null;
    product: string | null;
    sentDate: string | null;
  }>;
  quotations: Array<{
    id: string;
    quotationNumber: string | null;
    status: string | null;
    total: number | null;
    currency: string | null;
    createdAt: string | null;
  }>;
};

export type AdminLeadQuickViewResponse = {
  techBusinessLead: AdminLeadQuickView | null;
};

export function leadQuickViewVariables(leadId: string, companyId: string) {
  return {
    id: leadId,
    statusWhere: { saasCompany: { id: { equals: companyId } } },
    crmWhere: crmScopeWhere(companyId),
    followUpWhere: crmScopeWhere(companyId),
    proposalWhere: crmScopeWhere(companyId),
    quotationWhere: { company: { id: { equals: companyId } } },
  };
}

/* ───────────────────────── Cotizaciones ───────────────────────── */

export const ADMIN_COMPANY_QUOTATIONS_QUERY = gql`
  query AdminCompanyQuotations(
    $where: SaasQuotationWhereInput!
    $take: Int
    $skip: Int!
  ) {
    saasQuotations(
      where: $where
      orderBy: [{ createdAt: desc }]
      take: $take
      skip: $skip
    ) {
      id
      quotationNumber
      status
      total
      currency
      createdAt
      sentAt
      acceptedAt
      validUntil
      lead {
        id
        businessName
      }
      createdBy {
        id
        name
        lastName
      }
      assignedSeller {
        id
        name
        lastName
      }
    }
    saasQuotationsCount(where: $where)
  }
`;

export type AdminQuotationRow = {
  id: string;
  quotationNumber: string | null;
  status: string | null;
  total: number | null;
  currency: string | null;
  createdAt: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  validUntil: string | null;
  lead: { id: string; businessName: string } | null;
  createdBy: { id: string; name: string; lastName: string | null } | null;
  assignedSeller: { id: string; name: string; lastName: string | null } | null;
};

export type AdminCompanyQuotationsResponse = {
  saasQuotations: AdminQuotationRow[];
  saasQuotationsCount: number;
};

/* ───────────────────────── Seguimiento ───────────────────────── */

export const ADMIN_COMPANY_FOLLOW_UP_QUERY = gql`
  query AdminCompanyFollowUp(
    $activityWhere: TechSalesActivityWhereInput!
    $followUpWhere: TechFollowUpTaskWhereInput!
    $taskWhere: TechTaskWhereInput!
    $proposalWhere: TechProposalWhereInput!
  ) {
    techSalesActivities(
      where: $activityWhere
      orderBy: [{ createdAt: desc }]
      take: 25
    ) {
      id
      type
      title
      result
      activityDate
      createdAt
      businessLead {
        id
        businessName
      }
      createdBy {
        id
        name
        lastName
      }
      assignedSeller {
        id
        name
        lastName
      }
    }
    techSalesActivitiesCount(where: $activityWhere)
    techFollowUpTasks(
      where: $followUpWhere
      orderBy: [{ scheduledDate: asc }]
      take: 25
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
    techFollowUpTasksCount(where: $followUpWhere)
    techTasks(where: $taskWhere, orderBy: [{ createdAt: desc }], take: 15) {
      id
      title
      priority
      startDate
      dueDate
      createdAt
      businessLead {
        id
        businessName
      }
      responsible {
        id
        name
        lastName
      }
    }
    techTasksCount(where: $taskWhere)
    techProposals(where: $proposalWhere, orderBy: [{ createdAt: desc }], take: 15) {
      id
      status
      amount
      product
      sentDate
      approved
      paid
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
    techProposalsCount(where: $proposalWhere)
  }
`;

type PersonLite = { id: string; name: string; lastName: string | null } | null;
type LeadLite = { id: string; businessName: string } | null;

export type AdminCompanyFollowUpResponse = {
  techSalesActivities: Array<{
    id: string;
    type: string | null;
    title: string | null;
    result: string | null;
    activityDate: string | null;
    createdAt: string | null;
    businessLead: LeadLite;
    createdBy: PersonLite;
    assignedSeller: PersonLite;
  }>;
  techSalesActivitiesCount: number;
  techFollowUpTasks: Array<{
    id: string;
    scheduledDate: string | null;
    status: string | null;
    priority: string | null;
    notes: string | null;
    businessLead: LeadLite;
    assignedSeller: PersonLite;
  }>;
  techFollowUpTasksCount: number;
  techTasks: Array<{
    id: string;
    title: string | null;
    priority: string | null;
    startDate: string | null;
    dueDate: string | null;
    createdAt: string | null;
    businessLead: LeadLite;
    responsible: PersonLite;
  }>;
  techTasksCount: number;
  techProposals: Array<{
    id: string;
    status: string | null;
    amount: number | null;
    product: string | null;
    sentDate: string | null;
    approved: boolean | null;
    paid: boolean | null;
    businessLead: LeadLite;
    assignedSeller: PersonLite;
  }>;
  techProposalsCount: number;
};

export function companyFollowUpVariables(companyId: string) {
  return {
    activityWhere: crmScopeWhere(companyId),
    followUpWhere: crmScopeWhere(companyId),
    taskWhere: crmScopeWhere(companyId, "responsible"),
    proposalWhere: crmScopeWhere(companyId),
  };
}

/* ───────────────────────── Espacios de trabajo ───────────────────────── */

export const ADMIN_COMPANY_WORKSPACES_QUERY = gql`
  query AdminCompanyWorkspaces($where: SaasWorkspaceWhereInput!) {
    saasWorkspaces(where: $where, orderBy: [{ name: asc }]) {
      id
      name
      showActivities
      showProposals
      showFollowUpTasks
      showTasks
      members {
        id
        name
        lastName
      }
      crmStatuses(orderBy: [{ order: asc }]) {
        id
        name
        color
        isArchived
      }
      salesActivitiesCount
      followUpTasksCount
      proposalsCount
      tasksCount
    }
  }
`;

export type AdminWorkspaceRow = {
  id: string;
  name: string;
  showActivities: boolean | null;
  showProposals: boolean | null;
  showFollowUpTasks: boolean | null;
  showTasks: boolean | null;
  members: Array<{ id: string; name: string; lastName: string | null }>;
  crmStatuses: Array<{
    id: string;
    name: string | null;
    color: string | null;
    isArchived: boolean | null;
  }>;
  salesActivitiesCount: number | null;
  followUpTasksCount: number | null;
  proposalsCount: number | null;
  tasksCount: number | null;
};

export type AdminCompanyWorkspacesResponse = {
  saasWorkspaces: AdminWorkspaceRow[];
};
