import { gql } from "@apollo/client";

/* ───────────────────────── Créditos ───────────────────────── */

export const ADMIN_COMPANY_CREDIT_PERIODS_QUERY = gql`
  query AdminCompanyCreditPeriods($where: SaasCompanyCreditPeriodWhereInput!) {
    saasCompanyCreditPeriods(
      where: $where
      orderBy: [{ year: desc }, { month: desc }]
      take: 12
    ) {
      id
      year
      month
      planAllowance
      bonusAllowance
      used
    }
  }
`;

export type AdminCreditPeriodRow = {
  id: string;
  year: number;
  month: number;
  planAllowance: number | null;
  bonusAllowance: number | null;
  used: number | null;
};

export type AdminCompanyCreditPeriodsResponse = {
  saasCompanyCreditPeriods: AdminCreditPeriodRow[];
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
  createdAt: string;
  period: { id: string; year: number; month: number } | null;
};

export type AdminCompanyLedgerResponse = {
  saasCompanyCreditLedgers: AdminLedgerRow[];
  saasCompanyCreditLedgersCount: number;
};

/* ───────────────────────── Extracciones ───────────────────────── */

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

/* ───────────────────────── IA ───────────────────────── */

/** Sin prompts ni respuestas: esos se piden aparte con "Ver conversación". */
export const ADMIN_AI_CALL_LOGS_QUERY = gql`
  query AdminAiCallLogs(
    $where: TechAiCallLogWhereInput!
    $take: Int
    $skip: Int!
  ) {
    techAiCallLogs(
      where: $where
      orderBy: [{ createdAt: desc }]
      take: $take
      skip: $skip
    ) {
      id
      feature
      provider
      model
      billingMode
      inputTokens
      outputTokens
      creditsCharged
      success
      errorMessage
      durationMs
      createdAt
      user {
        id
        name
        lastName
      }
    }
    techAiCallLogsCount(where: $where)
  }
`;

export type AdminAiCallRow = {
  id: string;
  feature: string | null;
  provider: string | null;
  model: string | null;
  billingMode: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  creditsCharged: number | null;
  success: boolean | null;
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: string;
  user: { id: string; name: string; lastName: string | null } | null;
};

export type AdminAiCallLogsResponse = {
  techAiCallLogs: AdminAiCallRow[];
  techAiCallLogsCount: number;
};

export const ADMIN_AI_CALL_CONVERSATION_QUERY = gql`
  query AdminAiCallConversation($id: ID!) {
    techAiCallLog(where: { id: $id }) {
      id
      featurePrompt
      systemPrompt
      userPrompt
      response
    }
  }
`;

export type AdminAiCallConversationResponse = {
  techAiCallLog: {
    id: string;
    featurePrompt: string | null;
    systemPrompt: string | null;
    userPrompt: string | null;
    response: string | null;
  } | null;
};
