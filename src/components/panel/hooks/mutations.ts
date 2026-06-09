import { gql } from "@apollo/client";

export const REMAINING_CREDITS_MUTATION = gql`
  mutation RemainingCredits($companyId: ID) {
    remainingCredits(companyId: $companyId) {
      success
      message
      remainingQuota
      syncedCount
      leadLimit
      year
      month
    }
  }
`;

export interface RemainingCreditsResult {
  success: boolean;
  message: string | null;
  remainingQuota: number;
  syncedCount: number;
  leadLimit: number | null;
  year: number;
  month: number;
}

export interface RemainingCreditsVariables {
  companyId?: string | null;
}

export interface RemainingCreditsMutationResponse {
  remainingCredits: RemainingCreditsResult;
}
