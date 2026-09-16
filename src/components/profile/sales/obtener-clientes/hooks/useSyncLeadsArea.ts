"use client";

import { useMutation } from "@apollo/client";
import {
  SYNC_LEADS_FROM_INEGI_MUTATION,
  SYNC_LEADS_FRONT_MUTATION,
  type LeadSyncSource,
  type SyncLeadsFromInegiInput,
  type SyncLeadsFromInegiMutationResponse,
  type SyncLeadsFrontInput,
  type SyncLeadsFrontMutationResponse,
  type SyncLeadsFrontResult,
} from "./mutations";

export interface SyncLeadsAreaParams {
  source?: LeadSyncSource;
  lat: number;
  lng: number;
  radiusKm: number;
  category: string;
  maxResults?: number;
  minRating?: number | null;
  minReviews?: number | null;
}

export function useSyncLeadsArea() {
  const [syncGoogle, googleState] = useMutation<SyncLeadsFrontMutationResponse>(
    SYNC_LEADS_FRONT_MUTATION
  );
  const [syncInegi, inegiState] =
    useMutation<SyncLeadsFromInegiMutationResponse>(
      SYNC_LEADS_FROM_INEGI_MUTATION
    );

  const syncLeadsArea = async (
    params: SyncLeadsAreaParams
  ): Promise<SyncLeadsFrontResult | null> => {
    const maxResults = params.maxResults ?? 60;

    if (params.source === "inegi") {
      const input: SyncLeadsFromInegiInput = {
        category: params.category,
        lat: params.lat,
        lng: params.lng,
        maxResults,
        radius: params.radiusKm,
      };
      const result = await syncInegi({ variables: { input } });
      return result.data?.syncLeadsFromInegi ?? null;
    }

    const input: SyncLeadsFrontInput = {
      category: params.category || null,
      lat: params.lat,
      lng: params.lng,
      maxResults,
      radius: params.radiusKm,
      minRating: params.minRating ?? null,
      minReviews: params.minReviews ?? null,
    };
    const result = await syncGoogle({ variables: { input } });
    return result.data?.syncLeadsFront ?? null;
  };

  return {
    syncLeadsArea,
    result: googleState.data?.syncLeadsFront ?? inegiState.data?.syncLeadsFromInegi ?? null,
    loading: googleState.loading || inegiState.loading,
    error: googleState.error ?? inegiState.error,
  };
}
