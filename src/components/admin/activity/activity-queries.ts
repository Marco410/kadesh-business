import { gql } from "@apollo/client";
import type { ActivityApiType } from "../constants";

export const ADMIN_ACTIVITY_FEED_QUERY = gql`
  query AdminActivityFeed($input: AdminActivityFeedInput) {
    adminActivityFeed(input: $input) {
      items {
        id
        type
        kind
        occurredAt
        title
        detail
        success
        actor {
          id
          name
          lastName
          email
        }
        company {
          id
          name
        }
        entityType
        entityId
        meta
      }
      nextBefore
      hasMore
    }
  }
`;

export type AdminActivityItem = {
  id: string;
  type: ActivityApiType;
  kind: string;
  occurredAt: string;
  title: string;
  detail: string | null;
  success: boolean;
  actor: {
    id: string;
    name: string;
    lastName: string | null;
    email: string | null;
  } | null;
  company: { id: string; name: string } | null;
  entityType: string | null;
  entityId: string | null;
  meta: Record<string, unknown> | null;
};

export type AdminActivityFeedResponse = {
  adminActivityFeed: {
    items: AdminActivityItem[];
    nextBefore: string | null;
    hasMore: boolean;
  };
};

export type AdminActivityFeedInput = {
  companyId?: string | null;
  userId?: string | null;
  types?: ActivityApiType[] | null;
  onlyErrors?: boolean;
  search?: string | null;
  before?: string | null;
  take?: number;
};

export const ADMIN_OPS_SUMMARY_QUERY = gql`
  query AdminOpsSummary {
    adminOpsSummary {
      companiesTotal
      statusCounts {
        key
        count
      }
      trialsEndingSoon
      paymentIssues
      newUsers7d
      newCompanies7d
      activeUsers7d
      syncs24h
      failedSyncs24h
      aiCalls7d
      creditsConsumedMonth
      leadsCreatedMonth
      leadsReusedMonth
      mrr {
        currency
        amount
      }
      attention {
        companyId
        companyName
        reason
        detail
        severity
        at
      }
    }
  }
`;

export type AdminAttentionItem = {
  companyId: string;
  companyName: string;
  reason: string;
  detail: string | null;
  severity: "high" | "medium" | "low";
  at: string | null;
};

export type AdminOpsSummary = {
  companiesTotal: number;
  statusCounts: Array<{ key: string; count: number }>;
  trialsEndingSoon: number;
  paymentIssues: number;
  newUsers7d: number;
  newCompanies7d: number;
  activeUsers7d: number;
  syncs24h: number;
  failedSyncs24h: number;
  aiCalls7d: number;
  creditsConsumedMonth: number;
  /** Leads del mes creados nuevos (Google Maps o catálogo INEGI). */
  leadsCreatedMonth: number;
  /** Leads del mes que salieron de la base: no se le pagó a Google ni a INEGI. */
  leadsReusedMonth: number;
  mrr: Array<{ currency: string; amount: number }>;
  attention: AdminAttentionItem[];
};

export type AdminOpsSummaryResponse = {
  adminOpsSummary: AdminOpsSummary;
};
