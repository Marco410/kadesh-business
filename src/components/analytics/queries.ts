import { gql } from "@apollo/client";

/** Analítica de ventas de la empresa de la sesión (kadesh-back `companyAnalytics`, módulo `analytics`). */
export const COMPANY_ANALYTICS_QUERY = gql`
  query CompanyAnalytics($input: CompanyAnalyticsInput) {
    companyAnalytics(input: $input) {
      scope
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
      sellers {
        userId
        name
        entered
        contacted
        contactedWithin2Days
        won
        lost
        winRate
        medianCycleDays
        medianFirstContactHours
        stalled
        activities
        whatsappSent
      }
      stalledDeals {
        businessLeadId
        leadName
        stage
        since
        days
        sellerName
      }
    }
  }
`;

export type CompanyAnalytics = {
  scope: "team" | "own";
  days: number;
  dataSince: string | null;
  stages: Array<{ stage: string; entered: number; advanced: number; lost: number; medianDays: number | null; stalled: number }>;
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
  sellers: Array<{
    userId: string | null;
    name: string;
    entered: number;
    contacted: number;
    contactedWithin2Days: number;
    won: number;
    lost: number;
    winRate: number | null;
    medianCycleDays: number | null;
    medianFirstContactHours: number | null;
    stalled: number;
    activities: number;
    whatsappSent: number;
  }>;
  stalledDeals: Array<{
    businessLeadId: string | null;
    leadName: string;
    stage: string;
    since: string;
    days: number;
    sellerName: string | null;
  }>;
};

export type CompanyAnalyticsResponse = { companyAnalytics: CompanyAnalytics };
