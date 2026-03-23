import { gql } from "@apollo/client";

export const REFERRED_USERS_QUERY = gql`
  query ReferredUsers($where: UserWhereInput!) {
    users(where: $where) {
      name
      email
      createdAt
      lastLoginAt
    }
  }
`;

export interface ReferredUser {
  name: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface ReferredUsersResponse {
  users: ReferredUser[];
}

export interface ReferredUsersVariables {
  where: {
    referredBy: {
      id: {
        equals: string;
      };
    };
  };
}

export const REFERRAL_COMMISSIONS_QUERY = gql`
  query ReferralCommissions($where: SaasReferralCommissionWhereInput!, $orderBy: [SaasReferralCommissionOrderByInput!]) {
    saasReferralCommissions(where: $where, orderBy: $orderBy) {
      amount
      currency
      id
      notes
      periodEnd
      periodIndex
      periodStart
      status
      type
      updatedAt
      createdAt
      referredUser {
        id
        name
        lastName
      }
      plan {
        name
      }
    }
  }
`;

export type CommissionStatus = "PENDING" | "PAID" | "CANCELLED";
export type CommissionType = "UPFRONT" | "RECURRING";

export interface ReferralCommission {
  amount: number;
  currency: string;
  id: string;
  notes: string | null;
  periodEnd: string | null;
  periodIndex: number;
  periodStart: string | null;
  status: CommissionStatus;
  type: CommissionType;
  updatedAt: string;
  createdAt: string;
  referredUser: {
    id: string;
    name: string;
    lastName: string;
  };
  plan: {
    name: string;
  };
}

export interface ReferralCommissionsResponse {
  saasReferralCommissions: ReferralCommission[];
}

export interface ReferralCommissionsVariables {
  where: {
    referrer: {
      id: {
        equals: string;
      };
    };
  };
  orderBy?: { createdAt: "asc" | "desc" }[];
}
