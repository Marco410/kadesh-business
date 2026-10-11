import { gql } from "@apollo/client";

/* ───────────────────────── Lista de empresas ───────────────────────── */

export const ADMIN_COMPANIES_LIST_QUERY = gql`
  query AdminCompaniesList($input: AdminCompaniesInput) {
    adminCompanies(input: $input) {
      items {
        id
        name
        createdAt
        contactEmail
        isTest
        planName
        subscriptionId
        subscriptionStatus
        activatedAt
        currentPeriodEnd
        trialEndsAt
        creditsPlan
        creditsBonus
        creditsUsed
        creditsRemaining
        usersCount
        leadsCount
        lastLoginAt
        lastSeenAt
        owner {
          id
          name
          lastName
          email
        }
      }
      total
      statusCounts {
        key
        count
      }
    }
  }
`;

export type AdminPersonRef = {
  id: string;
  name: string;
  lastName: string | null;
  email: string | null;
};

export type AdminCompanyListItem = {
  id: string;
  name: string;
  createdAt: string | null;
  contactEmail: string | null;
  isTest: boolean;
  planName: string | null;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  activatedAt: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  creditsPlan: number;
  creditsBonus: number;
  creditsUsed: number;
  creditsRemaining: number;
  usersCount: number;
  leadsCount: number;
  lastLoginAt: string | null;
  /** Última vez que alguien del equipo tuvo el panel abierto (latido). */
  lastSeenAt: string | null;
  owner: AdminPersonRef | null;
};

export type AdminCompaniesListResponse = {
  adminCompanies: {
    items: AdminCompanyListItem[];
    total: number;
    statusCounts: Array<{ key: string; count: number }>;
  };
};

/* ───────────────────────── Ficha (cabecera del 360) ───────────────────────── */

export const ADMIN_COMPANY_PROFILE_QUERY = gql`
  query AdminCompanyProfile($id: ID!, $year: Int!, $month: Int!) {
    saasCompany(where: { id: $id }) {
      id
      name
      createdAt
      contactEmail
      contactPhone
      purchasedBonusCredits
      subscriptionStartedAt
      allowedGooglePlaceCategories
      onboardingMainOffer
      onboardingIdealCustomer
      onboardingAvgTicketValue
      onboardingSalesPain
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
      users(take: 100, orderBy: [{ name: asc }]) {
        id
        name
        lastName
        secondLastName
        email
        phone
        verified
        createdAt
        lastLoginAt
        roles {
          name
        }
      }
      usersCount
      leadsCount
      subscriptions(take: 1, orderBy: [{ createdAt: desc }]) {
        id
        planName
        planCost
        planCurrency
        planFrequency
        planLeadLimit
        planFeatures
        status
        activatedAt
        currentPeriodEnd
        stripeCustomerId
        stripeSubscriptionId
        createdAt
      }
    }
  }
`;

export type AdminCompanyMember = {
  id: string;
  name: string;
  lastName: string | null;
  secondLastName: string | null;
  email: string | null;
  phone: string | null;
  verified: boolean | null;
  createdAt: string | null;
  lastLoginAt: string | null;
  roles: Array<{ name: string }>;
};

export type AdminCompanySubscription = {
  id: string;
  planName: string | null;
  planCost: number | null;
  planCurrency: string | null;
  planFrequency: string | null;
  planLeadLimit: number | null;
  planFeatures: unknown;
  status: string | null;
  activatedAt: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string | null;
};

export type AdminCompanyProfile = {
  id: string;
  name: string;
  createdAt: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  purchasedBonusCredits: number | null;
  subscriptionStartedAt: string | null;
  allowedGooglePlaceCategories: unknown;
  onboardingMainOffer: string | null;
  onboardingIdealCustomer: string | null;
  onboardingAvgTicketValue: string | null;
  onboardingSalesPain: string | null;
  plan: { id: string; name: string; leadLimit: number | null } | null;
  creditPeriods: Array<{
    id: string;
    planAllowance: number | null;
    bonusAllowance: number | null;
    used: number | null;
  }>;
  users: AdminCompanyMember[];
  usersCount: number | null;
  leadsCount: number | null;
  subscriptions: AdminCompanySubscription[];
};

export type AdminCompanyProfileResponse = {
  saasCompany: AdminCompanyProfile | null;
};

/* ───────────────────────── Métricas del 360 ───────────────────────── */

export const ADMIN_COMPANY_INSIGHTS_QUERY = gql`
  query AdminCompanyInsights($id: ID!, $days: Int) {
    adminCompanyInsights(companyId: $id, days: $days) {
      companyId
      days
      lastActivityAt
      team {
        userId
        logins
        failedLogins
        lastLoginAt
        lastActivityAt
        leadsAssigned
        activities
        quotations
        extractions
        aiCalls
        whatsappSent
        toursCompleted
        toursSkipped
        lastSeenAt
        activeDays
        activeMinutes
        changes
      }
      pipeline {
        key
        count
      }
      leadsTotal
      leadsWithoutOwner
      extraction {
        runs
        failed
        created
        alreadyInDb
        creditsUsed
      }
      creditsByDay {
        date
        value
      }
      ai {
        calls
        failed
        credits
        byFeature {
          feature
          calls
          credits
        }
      }
      activitiesByType {
        key
        count
      }
      followUpsPending
      followUpsOverdue
      proposalsByStatus {
        key
        count
        amount
      }
      quotationsByStatus {
        key
        count
        amount
      }
      whatsapp {
        outbound
        inbound
        failed
        lastMessageAt
      }
      calendarAccounts
      calendarLastSyncedAt
      calendarLastError
      checkoutFailures
      usage {
        ready
        activeUsers
        activeMinutes
        minutesByDay {
          date
          value
        }
        topSections {
          key
          count
        }
        lockedFeatures {
          key
          count
        }
        upgradeClicks
        exports
      }
    }
  }
`;

export type AdminTeamMemberStats = {
  userId: string;
  logins: number;
  failedLogins: number;
  lastLoginAt: string | null;
  lastActivityAt: string | null;
  leadsAssigned: number;
  activities: number;
  quotations: number;
  extractions: number;
  aiCalls: number;
  whatsappSent: number;
  toursCompleted: number;
  toursSkipped: number;
  /** Última vez con el panel abierto (latido). La sesión dura 30 días: es más fiel que el login. */
  lastSeenAt: string | null;
  activeDays: number;
  activeMinutes: number;
  /** Cambios registrados (CRM, equipo, ajustes) en la ventana. */
  changes: number;
};

/** Uso del panel. `ready: false` hasta que el back corra la migración de la Fase 2. */
export type AdminUsageStats = {
  ready: boolean;
  activeUsers: number;
  activeMinutes: number;
  minutesByDay: Array<{ date: string; value: number }>;
  topSections: Array<{ key: string; count: number }>;
  lockedFeatures: Array<{ key: string; count: number }>;
  upgradeClicks: number;
  exports: number;
};

export type AdminCompanyInsights = {
  companyId: string;
  days: number;
  lastActivityAt: string | null;
  team: AdminTeamMemberStats[];
  pipeline: Array<{ key: string; count: number }>;
  leadsTotal: number;
  leadsWithoutOwner: number;
  extraction: {
    runs: number;
    failed: number;
    created: number;
    alreadyInDb: number;
    creditsUsed: number;
  };
  creditsByDay: Array<{ date: string; value: number }>;
  ai: {
    calls: number;
    failed: number;
    credits: number;
    byFeature: Array<{ feature: string; calls: number; credits: number }>;
  };
  activitiesByType: Array<{ key: string; count: number }>;
  followUpsPending: number;
  followUpsOverdue: number;
  proposalsByStatus: Array<{ key: string; count: number; amount: number }>;
  quotationsByStatus: Array<{ key: string; count: number; amount: number }>;
  whatsapp: {
    outbound: number;
    inbound: number;
    failed: number;
    lastMessageAt: string | null;
  };
  calendarAccounts: number;
  calendarLastSyncedAt: string | null;
  calendarLastError: string | null;
  checkoutFailures: number;
  usage: AdminUsageStats;
};

export type AdminCompanyInsightsResponse = {
  adminCompanyInsights: AdminCompanyInsights;
};

/* ───────────────────────── Accesos (historial de login) ───────────────────────── */

export const ADMIN_AUTH_LOGS_QUERY = gql`
  query AdminAuthLogs($where: UserAuthLogWhereInput!, $take: Int, $skip: Int!) {
    userAuthLogs(
      where: $where
      orderBy: [{ createdAt: desc }]
      take: $take
      skip: $skip
    ) {
      id
      source
      step
      success
      message
      emailMasked
      createdAt
      user {
        id
        name
        lastName
      }
    }
    userAuthLogsCount(where: $where)
  }
`;

export type AdminAuthLogRow = {
  id: string;
  source: string | null;
  step: string | null;
  success: boolean | null;
  message: string | null;
  emailMasked: string | null;
  createdAt: string;
  user: { id: string; name: string; lastName: string | null } | null;
};

export type AdminAuthLogsResponse = {
  userAuthLogs: AdminAuthLogRow[];
  userAuthLogsCount: number;
};

/* ───────────────────────── Plan y pagos ───────────────────────── */

export const ADMIN_COMPANY_BILLING_QUERY = gql`
  query AdminCompanyBilling(
    $companyWhere: SaasCompanyWhereUniqueInput!
    $logsWhere: SaasSubscriptionLogWhereInput!
    $paymentsWhere: SaasPaymentWhereInput!
    $methodsWhere: SaasPaymentMethodWhereInput!
    $commissionsWhere: SaasReferralCommissionWhereInput!
  ) {
    saasCompany(where: $companyWhere) {
      id
      subscriptions(orderBy: [{ createdAt: desc }]) {
        id
        planName
        planCost
        planCurrency
        planFrequency
        planLeadLimit
        planFeatures
        status
        activatedAt
        currentPeriodEnd
        stripeCustomerId
        stripeSubscriptionId
        createdAt
      }
    }
    saasSubscriptionLogs(
      where: $logsWhere
      orderBy: [{ createdAt: desc }]
      take: 20
    ) {
      id
      step
      success
      message
      totalSubmitted
      createdAt
      user {
        id
        name
        lastName
      }
      plan {
        name
      }
    }
    saasPayments(where: $paymentsWhere, orderBy: [{ createdAt: desc }], take: 25) {
      id
      amount
      status
      paymentMethodType
      notes
      stripeErrorMessage
      createdAt
      plan {
        name
      }
      user {
        id
        name
        lastName
      }
    }
    saasPaymentMethods(where: $methodsWhere, orderBy: [{ createdAt: desc }]) {
      id
      cardType
      lastFourDigits
      expMonth
      expYear
      ownerName
      createdAt
      user {
        id
        name
        lastName
      }
    }
    saasReferralCommissions(
      where: $commissionsWhere
      orderBy: [{ createdAt: desc }]
      take: 20
    ) {
      id
      type
      percentage
      amount
      currency
      status
      periodStart
      periodEnd
      createdAt
      referrer {
        id
        name
        lastName
      }
    }
  }
`;

export type AdminSubscriptionLogRow = {
  id: string;
  step: string | null;
  success: boolean | null;
  message: string | null;
  totalSubmitted: string | null;
  createdAt: string;
  user: { id: string; name: string; lastName: string | null } | null;
  plan: { name: string } | null;
};

export type AdminPaymentRow = {
  id: string;
  amount: string | number | null;
  status: string | null;
  paymentMethodType: string | null;
  notes: string | null;
  stripeErrorMessage: string | null;
  createdAt: string;
  plan: { name: string } | null;
  user: { id: string; name: string; lastName: string | null } | null;
};

export type AdminPaymentMethodRow = {
  id: string;
  cardType: string | null;
  lastFourDigits: string | null;
  expMonth: string | null;
  expYear: string | null;
  ownerName: string | null;
  createdAt: string | null;
  user: { id: string; name: string; lastName: string | null } | null;
};

export type AdminReferralCommissionRow = {
  id: string;
  type: string | null;
  percentage: number | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string | null;
  referrer: { id: string; name: string; lastName: string | null } | null;
};

export type AdminCompanyBillingResponse = {
  saasCompany: { id: string; subscriptions: AdminCompanySubscription[] } | null;
  saasSubscriptionLogs: AdminSubscriptionLogRow[];
  saasPayments: AdminPaymentRow[];
  saasPaymentMethods: AdminPaymentMethodRow[];
  saasReferralCommissions: AdminReferralCommissionRow[];
};

export function companyBillingVariables(companyId: string) {
  const companyIs = { id: { equals: companyId } };
  return {
    companyWhere: { id: companyId },
    logsWhere: { company: companyIs },
    paymentsWhere: {
      OR: [{ subscription: { company: companyIs } }, { user: { company: companyIs } }],
    },
    methodsWhere: { user: { company: companyIs } },
    commissionsWhere: { company: companyIs },
  };
}

/* ───────────────────────── Integraciones ───────────────────────── */

export const ADMIN_COMPANY_INTEGRATIONS_QUERY = gql`
  query AdminCompanyIntegrations(
    $companyWhere: SaasCompanyWhereUniqueInput!
    $accountsWhere: GoogleCalendarAccountWhereInput!
    $syncLogsWhere: TechGoogleCalendarSyncLogWhereInput!
  ) {
    saasCompany(where: $companyWhere) {
      id
      whatsappDisplayPhoneNumber
      whatsappConnectedAt
      whatsappWebhookConfiguredAt
      whatsappLastWebhookAt
      whatsappTemplateName
      whatsappTemplateStatus
      aiBillingMode
      aiProvider
      aiModel
      aiKeyUpdatedAt
    }
    googleCalendarAccounts(where: $accountsWhere, orderBy: [{ createdAt: desc }]) {
      id
      scopeType
      googleAccountEmail
      isActive
      lastSyncedAt
      lastSyncError
      createdAt
      user {
        id
        name
        lastName
      }
      connectedByUser {
        id
        name
        lastName
      }
    }
    techGoogleCalendarSyncLogs(
      where: $syncLogsWhere
      orderBy: [{ createdAt: desc }]
      take: 15
    ) {
      id
      direction
      operation
      success
      errorMessage
      durationMs
      createdAt
    }
  }
`;

export type AdminCompanyIntegrationsResponse = {
  saasCompany: {
    id: string;
    whatsappDisplayPhoneNumber: string | null;
    whatsappConnectedAt: string | null;
    whatsappWebhookConfiguredAt: string | null;
    whatsappLastWebhookAt: string | null;
    whatsappTemplateName: string | null;
    whatsappTemplateStatus: string | null;
    aiBillingMode: string | null;
    aiProvider: string | null;
    aiModel: string | null;
    aiKeyUpdatedAt: string | null;
  } | null;
  googleCalendarAccounts: Array<{
    id: string;
    scopeType: string | null;
    googleAccountEmail: string | null;
    isActive: boolean | null;
    lastSyncedAt: string | null;
    lastSyncError: string | null;
    createdAt: string | null;
    user: { id: string; name: string; lastName: string | null } | null;
    connectedByUser: { id: string; name: string; lastName: string | null } | null;
  }>;
  techGoogleCalendarSyncLogs: Array<{
    id: string;
    direction: string | null;
    operation: string | null;
    success: boolean | null;
    errorMessage: string | null;
    durationMs: number | null;
    createdAt: string;
  }>;
};

export function companyIntegrationsVariables(companyId: string) {
  const companyIs = { id: { equals: companyId } };
  const accountOfCompany = {
    OR: [{ company: companyIs }, { user: { company: companyIs } }],
  };
  return {
    companyWhere: { id: companyId },
    accountsWhere: accountOfCompany,
    syncLogsWhere: { account: accountOfCompany },
  };
}

/* ───────────────────────── Persona ───────────────────────── */

export const ADMIN_PERSON_HEADER_QUERY = gql`
  query AdminPersonHeader($id: ID!) {
    user(where: { id: $id }) {
      id
      name
      lastName
      secondLastName
      email
      phone
      verified
      createdAt
      lastLoginAt
      roles {
        name
      }
      company {
        id
        name
      }
    }
  }
`;

export type AdminPersonHeader = {
  id: string;
  name: string;
  lastName: string | null;
  secondLastName: string | null;
  email: string | null;
  phone: string | null;
  verified: boolean | null;
  createdAt: string | null;
  lastLoginAt: string | null;
  roles: Array<{ name: string }>;
  company: { id: string; name: string } | null;
};

export type AdminPersonHeaderResponse = {
  user: AdminPersonHeader | null;
};
