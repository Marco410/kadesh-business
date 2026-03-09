"use client";

import { useMutation } from "@apollo/client";
import {
  SYNC_LEADS_FRONT_MUTATION,
  type SyncLeadsFrontInput,
  type SyncLeadsFrontMutationResponse,
} from "./mutations";

export interface SyncLeadsAreaParams {
  lat: number;
  lng: number;
  radiusKm: number;
  category: string;
  maxResults?: number;
}

export function useSyncLeadsArea() {
  const [mutate, { data, loading, error }] = useMutation<SyncLeadsFrontMutationResponse>(
    SYNC_LEADS_FRONT_MUTATION
  );

  const syncLeadsArea = async (params: SyncLeadsAreaParams) => {
    const input: SyncLeadsFrontInput = {
      category: params.category || null,
      lat: params.lat,
      lng: params.lng,
      maxResults: params.maxResults ?? 60,
      radius: params.radiusKm,
    };
    const result = await mutate({ variables: { input } });
    return result.data?.syncLeadsFront ?? null;
  };

  return {
    syncLeadsArea,
    result: data?.syncLeadsFront ?? null,
    loading,
    error,
  };
}
