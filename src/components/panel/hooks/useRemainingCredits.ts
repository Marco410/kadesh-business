"use client";

import { useCallback, useEffect } from "react";
import { useMutation } from "@apollo/client";
import {
  REMAINING_CREDITS_MUTATION,
  type RemainingCreditsMutationResponse,
  type RemainingCreditsResult,
  type RemainingCreditsVariables,
} from "./mutations";

export function useRemainingCredits(companyId: string | null) {
  const [fetchRemainingCredits, { data, loading, error }] = useMutation<
    RemainingCreditsMutationResponse,
    RemainingCreditsVariables
  >(REMAINING_CREDITS_MUTATION);

  const refetch = useCallback(async (): Promise<RemainingCreditsResult | null> => {
    if (!companyId) return null;
    const result = await fetchRemainingCredits({ variables: { companyId } });
    return result.data?.remainingCredits ?? null;
  }, [companyId, fetchRemainingCredits]);

  useEffect(() => {
    if (companyId) {
      void refetch();
    }
  }, [companyId, refetch]);

  const credits = data?.remainingCredits ?? null;

  return {
    credits,
    remainingQuota: credits?.remainingQuota ?? null,
    syncedCount: credits?.syncedCount ?? null,
    leadLimit: credits?.leadLimit ?? null,
    success: credits?.success ?? false,
    message: credits?.message ?? null,
    year: credits?.year ?? null,
    month: credits?.month ?? null,
    loading,
    error,
    refetch,
  };
}
