import { gql } from "@apollo/client";

export const ADMIN_COMPANIES_QUERY = gql`
  query AdminCompanies(
    $where: SaasCompanyWhereInput!
    $take: Int
    $skip: Int!
    $year: Int!
    $month: Int!
  ) {
    saasCompanies(
      where: $where
      orderBy: [{ name: asc }]
      take: $take
      skip: $skip
    ) {
      id
      name
      purchasedBonusCredits
      subscriptionStartedAt
      createdAt
      plan {
        id
        name
        leadLimit
      }
      creditPeriods(
        where: { year: { equals: $year }, month: { equals: $month } }
        take: 1
      ) {
        id
        planAllowance
        bonusAllowance
        used
      }
      usersCount
      leadsCount
      subscriptions(
        take: 1
        orderBy: [{ createdAt: desc }]
      ) {
        id
        planName
        status
      }
    }
    saasCompaniesCount(where: $where)
  }
`;

export type AdminCompanyListRow = {
  id: string;
  name: string;
  purchasedBonusCredits: number | null;
  subscriptionStartedAt: string | null;
  createdAt: string;
  plan: { id: string; name: string; leadLimit: number | null } | null;
  creditPeriods: Array<{
    id: string;
    planAllowance: number | null;
    bonusAllowance: number | null;
    used: number | null;
  }>;
  usersCount: number | null;
  leadsCount: number | null;
  subscriptions: Array<{
    id: string;
    planName: string | null;
    status: string | null;
  }>;
};

export type AdminCompaniesResponse = {
  saasCompanies: AdminCompanyListRow[];
  saasCompaniesCount: number;
};

export const ADMIN_COMPANY_DETAIL_QUERY = gql`
  query AdminCompanyDetail(
    $where: SaasCompanyWhereUniqueInput!
    $year: Int!
    $month: Int!
  ) {
    saasCompany(where: $where) {
      id
      name
      purchasedBonusCredits
      subscriptionStartedAt
      allowedGooglePlaceCategories
      contactEmail
      contactPhone
      colorPrimary
      colorSecondary
      onboardingMainOffer
      onboardingIdealCustomer
      createdAt
      updatedAt
      plan {
        id
        name
        cost
        currency
        frequency
        leadLimit
      }
      creditPeriods(
        where: { year: { equals: $year }, month: { equals: $month } }
        take: 1
      ) {
        id
        year
        month
        planAllowance
        bonusAllowance
        used
      }
      users(take: 40, orderBy: [{ name: asc }]) {
        id
        name
        lastName
        email
        roles {
          name
        }
      }
      subscriptions(take: 8, orderBy: [{ createdAt: desc }]) {
        id
        planName
        planLeadLimit
        status
        activatedAt
        currentPeriodEnd
        createdAt
      }
      usersCount
      leadsCount
      creditLedgerEntriesCount
      leadSyncLogsCount
    }
  }
`;

export type AdminCompanyDetail = {
  id: string;
  name: string;
  purchasedBonusCredits: number | null;
  subscriptionStartedAt: string | null;
  allowedGooglePlaceCategories: unknown;
  contactEmail: string | null;
  contactPhone: string | null;
  colorPrimary: string | null;
  colorSecondary: string | null;
  onboardingMainOffer: string | null;
  onboardingIdealCustomer: string | null;
  createdAt: string;
  updatedAt: string;
  plan: {
    id: string;
    name: string;
    cost: number | null;
    currency: string | null;
    frequency: string | null;
    leadLimit: number | null;
  } | null;
  creditPeriods: Array<{
    id: string;
    year: number;
    month: number;
    planAllowance: number | null;
    bonusAllowance: number | null;
    used: number | null;
  }>;
  users: Array<{
    id: string;
    name: string;
    lastName: string | null;
    email: string | null;
    roles: Array<{ name: string }>;
  }>;
  subscriptions: Array<{
    id: string;
    planName: string | null;
    planLeadLimit: number | null;
    status: string | null;
    activatedAt: string | null;
    currentPeriodEnd: string | null;
    createdAt: string;
  }>;
  usersCount: number | null;
  leadsCount: number | null;
  creditLedgerEntriesCount: number | null;
  leadSyncLogsCount: number | null;
};

export type AdminCompanyDetailResponse = {
  saasCompany: AdminCompanyDetail | null;
};

export const ADMIN_COMPANY_LEDGER_QUERY = gql`
  query AdminCompanyLedger(
    $where: SaasCompanyCreditLedgerWhereInput!
    $take: Int
    $skip: Int!
  ) {
    saasCompanyCreditLedgers(
      where: $where
      orderBy: [{ createdAt: desc }]
      take: $take
      skip: $skip
    ) {
      id
      type
      amount
      balanceAfter
      referenceType
      referenceId
      notes
      metadata
      createdAt
      period {
        id
        year
        month
      }
    }
    saasCompanyCreditLedgersCount(where: $where)
  }
`;

export type AdminLedgerRow = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number | null;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  metadata: unknown;
  createdAt: string;
  period: { id: string; year: number; month: number } | null;
};

export type AdminCompanyLedgerResponse = {
  saasCompanyCreditLedgers: AdminLedgerRow[];
  saasCompanyCreditLedgersCount: number;
};

export const ADMIN_SYNC_LOGS_QUERY = gql`
  query AdminSyncLogs(
    $where: TechLeadSyncLogWhereInput!
    $take: Int
    $skip: Int!
  ) {
    techLeadSyncLogs(
      where: $where
      orderBy: [{ createdAt: desc }]
      take: $take
      skip: $skip
    ) {
      id
      success
      message
      created
      alreadyInDb
      skippedLowRating
      syncedLeadsCount
      syncedCount
      leadLimit
      category
      lat
      lng
      radius
      createdAt
      company {
        id
        name
      }
      user {
        id
        name
        lastName
        email
      }
    }
    techLeadSyncLogsCount(where: $where)
  }
`;

/** @deprecated Alias: misma query con company incluida. */
export const ADMIN_COMPANY_SYNC_LOGS_QUERY = ADMIN_SYNC_LOGS_QUERY;

export type AdminSyncLogRow = {
  id: string;
  success: boolean;
  message: string | null;
  created: number | null;
  alreadyInDb: number | null;
  skippedLowRating: number | null;
  syncedLeadsCount: number | null;
  syncedCount: number | null;
  leadLimit: number | null;
  category: string | null;
  lat: number | null;
  lng: number | null;
  radius: number | null;
  createdAt: string;
  company: { id: string; name: string } | null;
  user: {
    id: string;
    name: string;
    lastName: string | null;
    email: string | null;
  } | null;
};

export type AdminSyncLogsResponse = {
  techLeadSyncLogs: AdminSyncLogRow[];
  techLeadSyncLogsCount: number;
};

export type AdminCompanySyncLogsResponse = AdminSyncLogsResponse;

export const ADMIN_COMPANY_LEADS_QUERY = gql`
  query AdminCompanyLeads(
    $where: TechBusinessLeadWhereInput!
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
      salesPerson(take: 3) {
        id
        name
        lastName
      }
    }
    techBusinessLeadsCount(where: $where)
  }
`;

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
  salesPerson: Array<{
    id: string;
    name: string;
    lastName: string | null;
  }>;
};

export type AdminCompanyLeadsResponse = {
  techBusinessLeads: AdminCompanyLeadRow[];
  techBusinessLeadsCount: number;
};
