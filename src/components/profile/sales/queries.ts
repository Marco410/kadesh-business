import { gql } from "@apollo/client";

/** Custom query: subscriptionStatus(companyId) - use for subscription data in sales module. */
export const SUBSCRIPTION_STATUS_QUERY = gql`
  query SubscriptionStatus($companyId: ID) {
    subscriptionStatus(companyId: $companyId) {
      success
      message
      daysUntilNextBilling
      subscriptionActive
      subscription {
        id
        activatedAt
        planCost
        planCurrency
        planFrequency
        planLeadLimit
        planName
        planFeatures
        status
        stripeCustomerId
        stripeSubscriptionId
        currentPeriodEnd
      }
    }
  }
`;

export interface SubscriptionStatusVariables {
  companyId: string | null;
}

/** Plan feature item from subscription (key, name, included, description). */
export interface PlanFeatureItem {
  key: string;
  name: string;
  included: boolean;
  description: string;
}

export interface SubscriptionData {
  id: string | null;
  activatedAt: string | null;
  planCost: number | null;
  planCurrency: string | null;
  planFrequency: string | null;
  planLeadLimit: number | null;
  planName: string | null;
  planFeatures: PlanFeatureItem[] | null;
  status: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
}

export interface SubscriptionStatusResult {
  success: boolean;
  message: string | null;
  daysUntilNextBilling: number | null;
  subscriptionActive: boolean | null;
  subscription: SubscriptionData | null;
}

export interface SubscriptionStatusResponse {
  subscriptionStatus: SubscriptionStatusResult | null;
}

export const USER_COMPANY_CATEGORIES_QUERY = gql`
  query UserCompanyCategories($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      salesComission
      stripeCustomerId
      company {
        id
        name
        allowedGooglePlaceCategories
      }
    }
  }
`;

export interface UserCompanyCategoriesVariables {
  where: { id: string };
}

export interface UserCompanyCategoriesResponse {
  user: {
    id: string;
    salesComission: number;
    stripeCustomerId: string;
    company: {
      id: string;
      name: string;
      allowedGooglePlaceCategories: string[];
    } | null;
  } | null;
}

export const TECH_BUSINESS_LEADS_QUERY = gql`
  query TechBusinessLeads(
    $where: TechBusinessLeadWhereInput!
    $take: Int
    $skip: Int
    $orderBy: [TechBusinessLeadOrderByInput!]
    $statusWhere: TechStatusBusinessLeadWhereInput
    $salesPersonWhere2: UserWhereInput!
  ) {
    techBusinessLeads(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
      id
      address
      businessName
      category
      city
      state
      country
      createdAt
      phone
      rating
      source
      salesPerson(where: $salesPersonWhere2) {
        id
        name
        lastName
      }
      status(where: $statusWhere) {
        id
        estimatedValue
        firstContactDate
        nextFollowUpDate
        opportunityLevel
        pipelineStatus
        salesPerson {
          id
          name
          lastName
        }
        saasCompany {
          id
          name
        }
      }
    }
  }
`;

/** Filtro para la relación status (solo devolver el status de esta company/vendedor). */
export interface TechStatusBusinessLeadWhereInputFilter {
  AND?: Array<{
    salesPerson?: { id: { equals: string } } | null;
    saasCompany?: { id: { equals: string } };
  }>;
  salesPerson?: { id: { equals: string } } | null;
  saasCompany?: { id: { equals: string } };
}

export interface TechBusinessLeadsVariables {
  where: {
    id?: { equals: string };
    /** some: por vendedor; none: {} para leads sin asignar (salesPerson vacío). */
    salesPerson?: { some: { id: { equals: string } } } | { none: Record<string, never> };
    saasCompany?: { some: { id: { equals: string } } };
    status?: {
      pipelineStatus?: { equals: string | null };
      some?: {
        AND?: Array<{
          salesPerson?: { id: { equals: string } } | null;
          saasCompany?: { id: { equals: string } };
          pipelineStatus?: { equals: string | null };
        }>;
        salesPerson?: { id: { equals: string } } | null;
        saasCompany?: { id: { equals: string } };
      };
    };
    category?: { equals: string } | { in: string[] };
    businessName?: { contains: string; mode?: "insensitive" };
    city?: { contains: string; mode?: "insensitive" };
    state?: { contains: string; mode?: "insensitive" };
    country?: { contains: string; mode?: "insensitive" };
  };
  /** Filtro aplicado a la relación status: solo se devuelven status que coincidan (company + opcionalmente salesPerson). */
  statusWhere?: TechStatusBusinessLeadWhereInputFilter | null;
  salesPersonWhere2?: UserWhereInput | null;
  take?: number;
  skip?: number;
  orderBy?: Array<Record<string, "asc" | "desc">>;
}

export interface UserWhereInput {
  company?: { id: { equals: string } };
}

export interface TechBusinessLeadsResponse {
  techBusinessLeads: Array<{
    id: string;
    address: string | null;
    businessName: string;
    category: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    createdAt: string;
    phone: string | null;
    rating: number | null;
    source: string | null;
    salesPerson: Array<{
      id: string;
      name: string;
      lastName: string;
    }> | null;
    status: Array<{
      id: string;
      estimatedValue: number | null;
      firstContactDate: string | null;
      nextFollowUpDate: string | null;
      opportunityLevel: string | null;
      pipelineStatus: string | null;
      salesPerson: {
        id: string;
        name: string;
        lastName: string;
      } | null;
      saasCompany: {
        id: string;
        name: string;
      } | null;
    }> | null;
  }>;
}

/** Query para obtener un lead por id filtrando por acceso (salesPerson + saasCompany en status). Usar take: 1. */
export const TECH_BUSINESS_LEAD_ACCESSIBLE_QUERY = gql`
  query TechBusinessLeadAccessible(
    $where: TechBusinessLeadWhereInput!
    $take: Int
  ) {
    techBusinessLeads(where: $where, take: $take) {
      id
      address
      businessName
      category
      city
      state
      country
      createdAt
      facebook
      googleMapsUrl
      hasWebsite
      instagram
      websiteUrl
      phone
      rating
      reviewCount
      source
      tiktok
      topReview1
      topReview2
      topReview3
      topReview4
      topReview5
      updatedAt
      xTwitter
      status {
        id
        estimatedValue
        firstContactDate
        nextFollowUpDate
        notes
        opportunityLevel
        pipelineStatus
        productOffered
        salesPerson {
          id
          name
        }
        saasCompany {
          id
          name
        }
      }
    }
  }
`;

export interface TechBusinessLeadAccessibleVariables {
  where: TechBusinessLeadsVariables["where"];
  take?: number;
}

export interface TechBusinessLeadAccessibleResponse {
  techBusinessLeads: Array<{
    id: string;
    address: string | null;
    businessName: string;
    category: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    createdAt: string;
    facebook: string | null;
    googleMapsUrl: string | null;
    hasWebsite: boolean | null;
    instagram: string | null;
    websiteUrl: string | null;
    phone: string | null;
    rating: number | null;
    reviewCount: number | null;
    source: string | null;
    tiktok: string | null;
    topReview1: string | null;
    topReview2: string | null;
    topReview3: string | null;
    topReview4: string | null;
    topReview5: string | null;
    updatedAt: string | null;
    xTwitter: string | null;
    status: {
      id: string;
      estimatedValue: number | null;
      firstContactDate: string | null;
      nextFollowUpDate: string | null;
      notes: string | null;
      opportunityLevel: string | null;
      pipelineStatus: string | null;
      productOffered: string | null;
      salesPerson: { id: string; name: string } | null;
      saasCompany: { id: string; name: string } | null;
    } | null;
  }>;
}

export const TECH_BUSINESS_LEADS_COUNT_QUERY = gql`
  query TechBusinessLeadsCount($where: TechBusinessLeadWhereInput!) {
    techBusinessLeadsCount(where: $where)
  }
`;

export interface TechBusinessLeadsCountVariables {
  where: {
    id?: { equals: string };
    /** some: por vendedor o some: {}; none: {} para leads sin asignar (salesPerson vacío). */
    salesPerson?: { some: { id?: { equals: string } } } | { none: Record<string, never> };
    saasCompany?: { some: { id: { equals: string } } };
    status?: {
      pipelineStatus?: { equals: string | null };
      firstContactDate?: { not: null } | null;
      some?: {
        AND?: Array<{
          salesPerson?: { id: { equals: string } } | null;
          saasCompany?: { id: { equals: string } };
          pipelineStatus?: { equals: string | null };
        }>;
        salesPerson?: { id: { equals: string } } | null;
        saasCompany?: { id: { equals: string } };
      };
    };
    category?: { equals: string } | { in: string[] };
    businessName?: { contains: string; mode?: "insensitive" };
    city?: { contains: string; mode?: "insensitive" };
    state?: { contains: string; mode?: "insensitive" };
    country?: { contains: string; mode?: "insensitive" };
  };
}

export interface TechBusinessLeadsCountResponse {
  techBusinessLeadsCount: number;
}

export const TECH_BUSINESS_LEAD_QUERY = gql`
  query TechBusinessLead(
    $where: TechBusinessLeadWhereUniqueInput!
    $statusWhere: TechStatusBusinessLeadWhereInput
  ) {
    techBusinessLead(where: $where) {
      id
      address
      businessName
      category
      city
      state
      createdAt
      facebook
      googleMapsUrl
      hasWebsite
      instagram
      websiteUrl
      phone
      rating
      reviewCount
      source
      tiktok
      topReview1
      topReview2
      topReview3
      topReview4
      topReview5
      updatedAt
      xTwitter
      status(where: $statusWhere) {
        id
        estimatedValue
        firstContactDate
        nextFollowUpDate
        notes
        opportunityLevel
        pipelineStatus
        productOffered
        salesPerson {
          id
          name
        }
        saasCompany {
          id
          name
        }
      }
    }
  }
`;

export interface TechBusinessLeadVariables {
  where: { id: string };
  /** Filtro para la relación status: solo devolver el de esta company (y vendedor si no es admin). */
  statusWhere?: TechStatusBusinessLeadWhereInputFilter | null;
}

export interface TechBusinessLeadResponse {
  techBusinessLead: {
    id: string;
    address: string | null;
    businessName: string;
    category: string | null;
    city: string | null;
    state: string | null;
    createdAt: string;
    facebook: string | null;
    googleMapsUrl: string | null;
    hasWebsite: boolean | null;
    instagram: string | null;
    websiteUrl: string | null;
    phone: string | null;
    rating: number | null;
    reviewCount: number | null;
    source: string | null;
    tiktok: string | null;
    topReview1: string | null;
    topReview2: string | null;
    topReview3: string | null;
    topReview4: string | null;
    topReview5: string | null;
    updatedAt: string | null;
    xTwitter: string | null;
    status: Array<{
      id: string;
      estimatedValue: number | null;
      firstContactDate: string | null;
      nextFollowUpDate: string | null;
      notes: string | null;
      opportunityLevel: string | null;
      pipelineStatus: string | null;
      productOffered: string | null;
      salesPerson: {
        id: string;
        name: string;
      } | null;
      saasCompany: {
        id: string;
        name: string;
      } | null;
    }> | null;
  } | null;
}

export const UPDATE_TECH_BUSINESS_LEAD_MUTATION = gql`
  mutation UpdateTechBusinessLead(
    $where: TechBusinessLeadWhereUniqueInput!
    $data: TechBusinessLeadUpdateInput!
  ) {
    updateTechBusinessLead(where: $where, data: $data) {
      id
      facebook
      instagram
      tiktok
      xTwitter
      hasWebsite
      updatedAt
    }
  }
`;

export interface UpdateTechBusinessLeadVariables {
  where: { id: string };
  data: {
    facebook?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    xTwitter?: string | null;
    hasWebsite?: boolean | null;
    websiteUrl?: string | null;
    salesPerson?: { connect: Array<{ id: string }> };
  };
}

export interface UpdateTechBusinessLeadMutation {
  updateTechBusinessLead: {
    id: string;
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
    xTwitter: string | null;
    hasWebsite: boolean | null;
    updatedAt: string | null;
  };
}

/** Campos que viven en TechStatusBusinessLead (relación 1:1 con TechBusinessLead). */
export const UPDATE_TECH_STATUS_BUSINESS_LEAD_MUTATION = gql`
  mutation UpdateTechStatusBusinessLead(
    $where: TechStatusBusinessLeadWhereUniqueInput!
    $data: TechStatusBusinessLeadUpdateInput!
  ) {
    updateTechStatusBusinessLead(where: $where, data: $data) {
      id
      estimatedValue
      firstContactDate
      nextFollowUpDate
      notes
      opportunityLevel
      pipelineStatus
      productOffered
    }
  }
`;

export interface UpdateTechStatusBusinessLeadVariables {
  where: { id: string };
  data: {
    estimatedValue?: number | null;
    firstContactDate?: string | null;
    nextFollowUpDate?: string | null;
    notes?: string | null;
    opportunityLevel?: string | null;
    pipelineStatus?: string | null;
    productOffered?: string | null;
    salesPerson?: { connect: { id: string } };
    saasCompany?: { connect: { id: string } };
  };
}

export interface UpdateTechStatusBusinessLeadMutation {
  updateTechStatusBusinessLead: {
    id: string;
    estimatedValue: number | null;
    firstContactDate: string | null;
    nextFollowUpDate: string | null;
    notes: string | null;
    opportunityLevel: string | null;
    pipelineStatus: string | null;
    productOffered: string | null;
  };
}

export const CREATE_TECH_STATUS_BUSINESS_LEAD_MUTATION = gql`
  mutation CreateTechStatusBusinessLead(
    $data: TechStatusBusinessLeadCreateInput!
  ) {
    createTechStatusBusinessLead(data: $data) {
      id
      estimatedValue
      firstContactDate
      nextFollowUpDate
      notes
      opportunityLevel
      pipelineStatus
      productOffered
    }
  }
`;

export interface CreateTechStatusBusinessLeadVariables {
  data: {
    businessLead: { connect: { id: string } };
    estimatedValue?: number | null;
    firstContactDate?: string | null;
    nextFollowUpDate?: string | null;
    notes?: string | null;
    opportunityLevel?: string | null;
    pipelineStatus?: string | null;
    productOffered?: string | null;
    salesPerson?: { connect: { id: string } };
    saasCompany?: { connect: { id: string } };
  };
}

export interface CreateTechStatusBusinessLeadMutation {
  createTechStatusBusinessLead: {
    id: string;
    estimatedValue: number | null;
    firstContactDate: string | null;
    nextFollowUpDate: string | null;
    notes: string | null;
    opportunityLevel: string | null;
    pipelineStatus: string | null;
    productOffered: string | null;
  };
}

/** Lista status por lead ids y vendedor para saber cuáles ya tienen status (evitar duplicados al asignar). */
export const TECH_STATUS_BUSINESS_LEADS_BY_LEADS_AND_SALES_PERSON_QUERY = gql`
  query TechStatusBusinessLeadsByLeadsAndSalesPerson(
    $where: TechStatusBusinessLeadWhereInput!
  ) {
    techStatusBusinessLeads(where: $where, take: 500) {
      businessLead {
        id
      }
    }
  }
`;

export interface TechStatusBusinessLeadsByLeadsAndSalesPersonVariables {
  where: {
    businessLead: { id: { in: string[] } };
    salesPerson: { id: { equals: string } };
  };
}

export interface TechStatusBusinessLeadsByLeadsAndSalesPersonResponse {
  techStatusBusinessLeads: Array<{
    businessLead: { id: string };
  }>;
}

export const TECH_SALES_ACTIVITIES_COUNT_QUERY = gql`
  query TechSalesActivitiesCount($where: TechSalesActivityWhereInput!) {
    techSalesActivitiesCount(where: $where)
  }
`;

export interface TechSalesActivitiesCountResponse {
  techSalesActivitiesCount: number;
}

export const TECH_SALES_ACTIVITIES_QUERY = gql`
  query TechSalesActivities($where: TechSalesActivityWhereInput!) {
    techSalesActivities(where: $where) {
      id
      activityDate
      type
      result
      comments
      createdAt
      businessLead {
        id
        businessName
      }
      assignedSeller {
        id
      }
    }
  }
`;

export interface TechSalesActivitiesVariables {
  where: {
    AND?: Array<{
      assignedSeller: { id: { equals: string } };
      businessLead: { id: { equals: string } };
    }>;
    assignedSeller?: { id: { in: string[] } };
  };
}

/** Filtro por múltiples vendedores (ej. calendario de empresa). */
export interface TechSalesActivitiesCalendarVariables {
  where: { assignedSeller: { id: { in: string[] } } };
}

export interface TechSalesActivitiesResponse {
  techSalesActivities: Array<{
    id: string;
    activityDate: string;
    type: string;
    result: string | null;
    comments: string | null;
    createdAt: string;
    businessLead: { id: string; businessName: string } | null;
    assignedSeller?: { id: string } | null;
  }>;
}

export const TECH_SALES_ACTIVITY_QUERY = gql`
  query TechSalesActivity($where: TechSalesActivityWhereUniqueInput!) {
    techSalesActivity(where: $where) {
      id
      activityDate
      type
      result
      comments
      createdAt
      businessLead {
        id
        businessName
      }
    }
  }
`;

export interface TechSalesActivityVariables {
  where: { id: string };
}

export interface TechSalesActivityResponse {
  techSalesActivity: {
    id: string;
    activityDate: string;
    type: string;
    result: string | null;
    comments: string | null;
    createdAt: string;
    businessLead: { id: string; businessName: string } | null;
  } | null;
}

export const CREATE_TECH_SALES_ACTIVITY_MUTATION = gql`
  mutation CreateTechSalesActivity($data: TechSalesActivityCreateInput!) {
    createTechSalesActivity(data: $data) {
      id
      type
      activityDate
      result
      comments
    }
  }
`;

export interface CreateTechSalesActivityVariables {
  data: {
    type: string;
    activityDate: string;
    result?: string | null;
    comments?: string | null;
    businessLead: { connect: { id: string } };
    assignedSeller: { connect: { id: string } };
  };
}

export interface CreateTechSalesActivityMutation {
  createTechSalesActivity: {
    id: string;
    type: string;
    activityDate: string;
    result: string | null;
    comments: string | null;
  };
}

// --- TechProposal ---

export const TECH_PROPOSALS_QUERY = gql`
  query TechProposals($where: TechProposalWhereInput!) {
    techProposals(where: $where) {
      id
      sentDate
      amount
      status
      fileOrUrl
      product
      notes
      createdAt
      updatedAt
      approved
      paid
      businessLead {
        id
        businessName
      }
      assignedSeller {
        id
      }
      project {
        id
      }
    }
  }
`;

export const TECH_PROPOSALS_COUNT_QUERY = gql`
  query TechProposalsCount($where: TechProposalWhereInput!) {
    techProposalsCount(where: $where)
  }
`;

export interface TechProposalsVariables {
  where: {
    AND?: Array<{
      assignedSeller: { id: { equals: string } };
      businessLead: { id: { equals: string } };
    }>;
    assignedSeller?: { id: { in: string[] } };
  };
}

export interface TechProposalsCalendarVariables {
  where: { assignedSeller: { id: { in: string[] } } };
}

/** Variables para filtrar propuestas por vendedor y estado (ej. comisiones = status Comprada) */
export interface TechProposalsBySellerAndStatusVariables {
  where: {
    AND: [
      { assignedSeller: { id: { equals: string } } },
      { status: { equals: string } },
    ];
  };
}

/** Variables para filtrar solo por vendedor (todas las propuestas del usuario) */
export interface TechProposalsBySellerVariables {
  where: {
    assignedSeller: { id: { equals: string } };
  };
}

export interface TechProposalsResponse {
  techProposals: Array<{
    id: string;
    sentDate: string;
    amount: number | null;
    status: string;
    fileOrUrl: string | null;
    product: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string | null;
    approved: boolean | null;
    paid: boolean | null;
    businessLead: { id: string; businessName: string } | null;
    assignedSeller?: { id: string } | null;
    project: { id: string } | null;
  }>;
}

export interface TechProposalsCountResponse {
  techProposalsCount: number;
}

export const TECH_PROPOSAL_QUERY = gql`
  query TechProposal($where: TechProposalWhereUniqueInput!) {
    techProposal(where: $where) {
      id
      sentDate
      amount
      status
      fileOrUrl
      product
      notes
      createdAt
      updatedAt
      businessLead {
        id
        businessName
      }
      project {
        id
      }
    }
  }
`;

export interface TechProposalVariables {
  where: { id: string };
}

export interface TechProposalResponse {
  techProposal: {
    id: string;
    sentDate: string;
    amount: number | null;
    status: string;
    fileOrUrl: string | null;
    product: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string | null;
    businessLead: { id: string; businessName: string } | null;
    project: { id: string } | null;
  } | null;
}

export const CREATE_TECH_PROPOSAL_MUTATION = gql`
  mutation CreateTechProposal($data: TechProposalCreateInput!) {
    createTechProposal(data: $data) {
      id
      sentDate
      amount
      status
      fileOrUrl
      product
      notes
      businessLead {
        businessName
      }
      assignedSeller {
        name
      }
      createdAt
    }
  }
`;

export interface CreateTechProposalVariables {
  data: {
    sentDate: string;
    amount?: number | null;
    status?: string | null;
    fileOrUrl?: string | null;
    product?: string | null;
    notes?: string | null;
    businessLead: { connect: { id: string } };
    assignedSeller: { connect: { id: string } };
  };
}

export interface CreateTechProposalMutation {
  createTechProposal: {
    id: string;
    sentDate: string;
    amount: number | null;
    status: string;
    fileOrUrl: string | null;
    product: string | null;
    notes: string | null;
    businessLead: { businessName: string } | null;
    assignedSeller: { name: string } | null;
    createdAt: string;
  };
}

export const UPDATE_TECH_PROPOSAL_MUTATION = gql`
  mutation UpdateTechProposal(
    $where: TechProposalWhereUniqueInput!
    $data: TechProposalUpdateInput!
  ) {
    updateTechProposal(where: $where, data: $data) {
      id
      amount
      createdAt
      fileOrUrl
      sentDate
      status
      product
      notes
      updatedAt
      businessLead {
        businessName
      }
    }
  }
`;

export interface UpdateTechProposalVariables {
  where: { id: string };
  data: {
    sentDate?: string | null;
    amount?: number | null;
    status?: string | null;
    fileOrUrl?: string | null;
    product?: string | null;
    notes?: string | null;
    approved?: boolean | null;
    paid?: boolean | null;
  };
}

export interface UpdateTechProposalMutation {
  updateTechProposal: {
    id: string;
    amount: number | null;
    createdAt: string;
    fileOrUrl: string | null;
    sentDate: string;
    status: string;
    product: string | null;
    notes: string | null;
    updatedAt: string | null;
    businessLead: { businessName: string } | null;
  };
}

// --- TechFollowUpTask ---

export const TECH_FOLLOW_UP_TASKS_QUERY = gql`
  query TechFollowUpTasks($where: TechFollowUpTaskWhereInput!) {
    techFollowUpTasks(where: $where) {
      id
      scheduledDate
      status
      priority
      notes
      createdAt
      updatedAt
      businessLead {
        id
        businessName
      }
      assignedSeller {
        id
      }
    }
  }
`;

export const TECH_FOLLOW_UP_TASKS_COUNT_QUERY = gql`
  query TechFollowUpTasksCount($where: TechFollowUpTaskWhereInput!) {
    techFollowUpTasksCount(where: $where)
  }
`;

export interface TechFollowUpTasksVariables {
  where: {
    AND?: Array<{
      assignedSeller: { id: { equals: string } };
      businessLead: { id: { equals: string } };
    }>;
    assignedSeller?: { id: { in: string[] } };
  };
}

export interface TechFollowUpTasksCalendarVariables {
  where: { assignedSeller: { id: { in: string[] } } };
}

export interface TechFollowUpTasksResponse {
  techFollowUpTasks: Array<{
    id: string;
    scheduledDate: string;
    status: string;
    priority: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string | null;
    businessLead: { id: string; businessName: string } | null;
    assignedSeller?: { id: string } | null;
  }>;
}

export interface TechFollowUpTasksCountResponse {
  techFollowUpTasksCount: number;
}

export const TECH_FOLLOW_UP_TASK_QUERY = gql`
  query TechFollowUpTask($where: TechFollowUpTaskWhereUniqueInput!) {
    techFollowUpTask(where: $where) {
      id
      scheduledDate
      status
      priority
      notes
      createdAt
      updatedAt
      businessLead {
        id
        businessName
      }
    }
  }
`;

export interface TechFollowUpTaskVariables {
  where: { id: string };
}

export interface TechFollowUpTaskResponse {
  techFollowUpTask: {
    id: string;
    scheduledDate: string;
    status: string;
    priority: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string | null;
    businessLead: { id: string; businessName: string } | null;
  } | null;
}

export const CREATE_TECH_FOLLOW_UP_TASK_MUTATION = gql`
  mutation CreateTechFollowUpTask($data: TechFollowUpTaskCreateInput!) {
    createTechFollowUpTask(data: $data) {
      id
      scheduledDate
      status
      priority
      notes
      businessLead {
        businessName
      }
      assignedSeller {
        name
      }
      createdAt
    }
  }
`;

export interface CreateTechFollowUpTaskVariables {
  data: {
    scheduledDate: string;
    status?: string | null;
    priority?: string | null;
    notes?: string | null;
    businessLead: { connect: { id: string } };
    assignedSeller: { connect: { id: string } };
  };
}

export interface CreateTechFollowUpTaskMutation {
  createTechFollowUpTask: {
    id: string;
    scheduledDate: string;
    status: string;
    priority: string;
    notes: string | null;
    businessLead: { businessName: string } | null;
    assignedSeller: { name: string } | null;
    createdAt: string;
  };
}

export const UPDATE_TECH_FOLLOW_UP_TASK_MUTATION = gql`
  mutation UpdateTechFollowUpTask(
    $where: TechFollowUpTaskWhereUniqueInput!
    $data: TechFollowUpTaskUpdateInput!
  ) {
    updateTechFollowUpTask(where: $where, data: $data) {
      id
      scheduledDate
      status
      priority
      notes
      updatedAt
      businessLead {
        businessName
      }
    }
  }
`;

export interface UpdateTechFollowUpTaskVariables {
  where: { id: string };
  data: {
    scheduledDate?: string | null;
    status?: string | null;
    priority?: string | null;
    notes?: string | null;
  };
}

export interface UpdateTechFollowUpTaskMutation {
  updateTechFollowUpTask: {
    id: string;
    scheduledDate: string;
    status: string;
    priority: string;
    notes: string | null;
    updatedAt: string | null;
    businessLead: { businessName: string } | null;
  };
}

// ─── Agregar vendedor ───────────────────────────────────────────────────────

export const COMPANY_VENDEDORES_QUERY = gql`
  query CompanyVendedores($where: UserWhereInput!) {
    users(where: $where, orderBy: [{ name: asc }]) {
      id
      name
      lastName
      email
      phone
      birthday
      salesComission
      salesPersonVerified
    }
  }
`;

export interface CompanyVendedoresVariables {
  where: {
    company?: { id?: { equals: string } };
    roles?: { some?: { name?: { equals: string } } };
  };
}

export interface CompanyVendedoresResponse {
  users: Array<{
    id: string;
    name: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    birthday: string | null;
    salesComission: number | null;
    salesPersonVerified: boolean | null;
  }>;
}


export const UPDATE_VENDEDOR_MUTATION = gql`
  mutation UpdateVendedor(
    $where: UserWhereUniqueInput!
    $data: UserUpdateInput!
  ) {
    updateUser(where: $where, data: $data) {
      id
      name
      lastName
      email
      phone
      birthday
      salesComission
      salesPersonVerified
    }
  }
`;

export interface UpdateVendedorVariables {
  where: { id: string };
  data: {
    name?: string;
    lastName?: string | null;
    email?: string | null;
    password?: string | null;
    phone?: string | null;
    birthday?: string | null;
    salesComission?: number | null;
    salesPersonVerified?: boolean | null;
  };
}

export interface UpdateVendedorResponse {
  updateUser: {
    id: string;
    name: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    birthday: string | null;
    salesComission: number | null;
    salesPersonVerified: boolean | null;
  } | null;
}

export const ROLES_BY_NAMES_QUERY = gql`
  query RolesByNames($where: RoleWhereInput!) {
    roles(where: $where) {
      id
      name
    }
  }
`;

export interface RolesByNamesVariables {
  where: { name?: { in?: string[] } };
}

export interface RolesByNamesResponse {
  roles: Array<{ id: string; name: string }>;
}

export const CREATE_SALES_PERSON_MUTATION = gql`
  mutation CreateSalesPerson($data: UserCreateInput!) {
    createUser(data: $data) {
      id
      name
      email
      phone
      birthday
      salesComission
      salesPersonVerified
      company {
        id
        name
      }
      roles {
        id
        name
      }
    }
  }
`;

export interface CreateSalesPersonVariables {
  data: {
    name: string;
    lastName?: string | null;
    email: string;
    password?: string | null;
    phone?: string | null;
    birthday?: string | null;
    salesComission?: number | null;
    salesPersonVerified?: boolean | null;
    roles?: { connect: Array<{ id: string }> };
    company?: { connect: { id: string } };
  };
}

export interface CreateSalesPersonResponse {
  createUser: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    birthday: string | null;
    salesComission: number | null;
    salesPersonVerified: boolean | null;
    company: { id: string; name: string } | null;
    roles: Array<{ id: string; name: string }>;
  };
}

// ─── Planes SaaS ───────────────────────────────────────────────────────────

export const SAAS_PLANS_QUERY = gql`
  query SaasPlans {
    saasPlans {
      id
      name
      active
      cost
      currency
      frequency
      leadLimit
      stripePriceId
      stripeProductId
      bestSeller
      planFeatures
    }
  }
`;

export interface SaasPlanItem {
  id: string;
  name: string;
  active: boolean;
  cost: number;
  currency: string;
  frequency: string;
  leadLimit: number | null;
  stripePriceId: string | null;
  stripeProductId: string | null;
  bestSeller?: boolean | null;
  planFeatures: PlanFeatureItem[] | null;
}

export interface SaasPlansResponse {
  saasPlans: SaasPlanItem[];
}

// ─── Pago / Suscripción empresa ─────────────────────────────────────────────

export const GET_STRIPE_PAYMENT_METHODS = gql`
  query StripePaymentMethods($email: String!) {
    StripePaymentMethods(email: $email) {
      message
      success
      data {
        data {
          id
          livemode
          type
          card {
            brand
            country
            exp_month
            exp_year
            last4
          }
        }
      }
    }
  }
`;

export const GET_PAYMENT_METHOD = gql`
  query GetSaasPaymentMethod($where: SaasPaymentMethodWhereUniqueInput!) {
    saasPaymentMethod(where: $where) {
      id
    }
  }
`;

export const CREATE_PAYMENT_METHOD = gql`
  mutation CreatePaymentMethod($data: SaasPaymentMethodCreateInput!) {
    createSaasPaymentMethod(data: $data) {
      id
    }
  }
`;

export const CREATE_COMPANY_SUBSCRIPTION = gql`
  mutation CreateCompanySubscription(
    $input: CreateCompanySubscriptionInput!
  ) {
    createCompanySubscription(input: $input) {
      success
      message
      subscriptionId
      paymentId
    }
  }
`;

export interface CreateCompanySubscriptionInput {
  planId: string;
  notes?: string | null;
  nameCard: string;
  email: string;
  paymentMethodId: string;
  total: string;
  paymentType: string;
  noDuplicatePaymentMethod?: boolean | null;
}

export interface CreateCompanySubscriptionResult {
  success: boolean;
  message: string;
  subscriptionId: string | null;
  paymentId: string | null;
}

export interface CreateCompanySubscriptionResponse {
  createCompanySubscription: CreateCompanySubscriptionResult;
}
