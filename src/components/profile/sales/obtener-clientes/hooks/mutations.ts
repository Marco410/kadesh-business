import { gql } from "@apollo/client";

export const SYNC_LEADS_FRONT_MUTATION = gql`
  mutation SyncLeadsFront($input: SyncLeadsFrontInput!) {
    syncLeadsFront(input: $input) {
      leadLimit
      message
      success
      syncedCount
      created
      alreadyInDb
      skippedLowRating
      syncedLeadsCount
    }
  }
`;

export interface SyncLeadsFrontInput {
  category: string | null;
  lat: number | null;
  lng: number | null;
  maxResults: number | null;
  radius: number | null;
}

export interface SyncLeadsFrontResult {
  leadLimit: number | null;
  message: string;
  success: boolean;
  syncedCount: number | null;
  created: number | null;
  alreadyInDb: number | null;
  skippedLowRating: number | null;
  syncedLeadsCount: number | null;
}

export interface SyncLeadsFrontMutationResponse {
  syncLeadsFront: SyncLeadsFrontResult;
}
