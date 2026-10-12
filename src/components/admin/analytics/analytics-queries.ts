import { gql } from "@apollo/client";
import type { AdminPersonRef } from "../clients/clients-queries";

/** Consultas de Analítica (kadesh-back `graphql/customs/queries/admin/`). Solo admin de Kadesh. */

const HEALTH_FLAG_FIELDS = `
  key
  reason
  label
`;

export const ADMIN_HEALTH_QUERY = gql`
  query AdminHealth($input: AdminHealthInput) {
    adminHealth(input: $input) {
      ready
      computedThrough
      windowDays
      total
      counts {
        key
        count
      }
      items {
        companyId
        companyName
        planName
        subscriptionStatus
        score
        label
        trend
        changePct
        components {
          activity
          adoption
          usage
          engagement
          billing
        }
        flags {
          ${HEALTH_FLAG_FIELDS}
        }
        teamSize
        activeUsers
        lastSeenAt
        accountManager {
          id
          name
          lastName
          email
        }
      }
    }
  }
`;

export type AdminHealthFlag = { key: string; reason: string; label: string };

export type AdminHealthBrief = {
  score: number;
  label: string;
  trend: string;
  changePct: number | null;
  flags: AdminHealthFlag[];
};

export type AdminCompanyHealth = AdminHealthBrief & {
  companyId: string;
  companyName: string;
  planName: string | null;
  subscriptionStatus: string | null;
  components: Record<"activity" | "adoption" | "usage" | "engagement" | "billing", number>;
  teamSize: number;
  activeUsers: number;
  lastSeenAt: string | null;
  accountManager: AdminPersonRef | null;
};

export type AdminHealthResponse = {
  adminHealth: {
    ready: boolean;
    computedThrough: string | null;
    windowDays: number;
    total: number;
    counts: Array<{ key: string; count: number }>;
    items: AdminCompanyHealth[];
  };
};

export const ADMIN_ACTIVATION_FUNNEL_QUERY = gql`
  query AdminActivationFunnel($input: AdminActivationInput) {
    adminActivationFunnel(input: $input) {
      from
      to
      cohortSize
      steps {
        key
        label
        companies
        pct
        medianDays
      }
      byMonth {
        month
        companies
        extraction
        contact
        quotation
        paid
      }
    }
  }
`;

export type AdminActivationFunnelResponse = {
  adminActivationFunnel: {
    from: string;
    to: string;
    cohortSize: number;
    steps: Array<{
      key: string;
      label: string;
      companies: number;
      pct: number;
      medianDays: number | null;
    }>;
    byMonth: Array<{
      month: string;
      companies: number;
      extraction: number;
      contact: number;
      quotation: number;
      paid: number;
    }>;
  };
};

export const ADMIN_COHORTS_QUERY = gql`
  query AdminCohorts($input: AdminCohortsInput) {
    adminCohorts(input: $input) {
      rows {
        month
        size
        active
      }
    }
  }
`;

export type AdminCohortsResponse = {
  adminCohorts: { rows: Array<{ month: string; size: number; active: number[] }> };
};

export const ADMIN_ENGAGEMENT_QUERY = gql`
  query AdminEngagement($input: AdminEngagementInput) {
    adminEngagement(input: $input) {
      ready
      through
      series {
        day
        users
        companies
      }
      dau
      wau
      mau
      stickiness
      activeCompanies7d
      activeCompanies30d
      plans {
        planName
        companies
        modules {
          key
          companies
        }
      }
      sections {
        key
        views
        users
      }
    }
  }
`;

export type AdminEngagementResponse = {
  adminEngagement: {
    ready: boolean;
    through: string;
    series: Array<{ day: string; users: number; companies: number }>;
    dau: number;
    wau: number;
    mau: number;
    stickiness: number;
    activeCompanies7d: number;
    activeCompanies30d: number;
    plans: Array<{
      planName: string;
      companies: number;
      modules: Array<{ key: string; companies: number }>;
    }>;
    sections: Array<{ key: string; views: number; users: number }>;
  };
};

export const ADMIN_DEMAND_GAPS_QUERY = gql`
  query AdminDemandGaps($input: AdminDemandGapsInput) {
    adminDemandGaps(input: $input) {
      days
      threshold
      runs
      lowRuns
      categories {
        category
        runs
        lowRuns
        avgResults
        companies
      }
      zones {
        lat
        lng
        runs
        lowRuns
        avgResults
        companies
        topCategories
      }
      gaps {
        category
        lat
        lng
        runs
        lowRuns
        avgResults
        companies
        lastAt
      }
    }
  }
`;

export type AdminDemandGapsResponse = {
  adminDemandGaps: {
    days: number;
    threshold: number;
    runs: number;
    lowRuns: number;
    categories: Array<{
      category: string;
      runs: number;
      lowRuns: number;
      avgResults: number;
      companies: number;
    }>;
    zones: Array<{
      lat: number;
      lng: number;
      runs: number;
      lowRuns: number;
      avgResults: number;
      companies: number;
      topCategories: string[];
    }>;
    gaps: Array<{
      category: string;
      lat: number;
      lng: number;
      runs: number;
      lowRuns: number;
      avgResults: number;
      companies: number;
      lastAt: string | null;
    }>;
  };
};

export const ADMIN_ACQUISITION_QUERY = gql`
  query AdminAcquisition($input: AdminAcquisitionInput) {
    adminAcquisition(input: $input) {
      days
      companies
      withData
      channels {
        key
        companies
        activated
        paid
      }
      landings {
        key
        companies
        activated
        paid
      }
      campaigns {
        key
        companies
        activated
        paid
      }
    }
  }
`;

export type AdminAcquisitionRow = {
  key: string;
  companies: number;
  activated: number;
  paid: number;
};

export type AdminAcquisitionResponse = {
  adminAcquisition: {
    days: number;
    companies: number;
    withData: number;
    channels: AdminAcquisitionRow[];
    landings: AdminAcquisitionRow[];
    campaigns: AdminAcquisitionRow[];
  };
};

export const ADMIN_SALES_VELOCITY_QUERY = gql`
  query AdminSalesVelocity($input: AdminSalesVelocityInput) {
    adminSalesVelocity(input: $input) {
      days
      dataSince
      stages {
        stage
        entered
        advanced
        lost
        medianDays
        stalled
      }
      won
      lost
      winRate
      wonValue
      medianCycleDays
      cycleSample
      newLeads
      contacted
      contactedWithin2Days
      medianFirstContactHours
      stalled
      whatsappInbound
      whatsappAnswered
      whatsappAnsweredWithin1h
      whatsappMedianResponseMinutes
      whatsappConversations
      whatsappReplied
      companies {
        companyId
        companyName
        entered
        won
        lost
        winRate
        medianCycleDays
        medianFirstContactHours
        stalled
      }
    }
  }
`;

export type AdminSalesVelocity = {
  days: number;
  dataSince: string | null;
  stages: Array<{
    stage: string;
    entered: number;
    advanced: number;
    lost: number;
    medianDays: number | null;
    stalled: number;
  }>;
  won: number;
  lost: number;
  winRate: number | null;
  wonValue: number;
  medianCycleDays: number | null;
  cycleSample: number;
  newLeads: number;
  contacted: number;
  contactedWithin2Days: number;
  medianFirstContactHours: number | null;
  stalled: number;
  whatsappInbound: number;
  whatsappAnswered: number;
  whatsappAnsweredWithin1h: number;
  whatsappMedianResponseMinutes: number | null;
  whatsappConversations: number;
  whatsappReplied: number;
  companies: Array<{
    companyId: string;
    companyName: string;
    entered: number;
    won: number;
    lost: number;
    winRate: number | null;
    medianCycleDays: number | null;
    medianFirstContactHours: number | null;
    stalled: number;
  }>;
};

export type AdminSalesVelocityResponse = { adminSalesVelocity: AdminSalesVelocity };
