"use client";

import { useQuery } from "@apollo/client";
import { isCompanyAiConfigured } from "./constants";
import {
  COMPANY_AI_LIVE_QUERY,
  type CompanyAiLiveStatusResponse,
  type CompanyAiLiveStatusVariables,
} from "./queries";

/**
 * True cuando la empresa tiene Kadesh Urim AI configurado y al menos un ping de conexión exitoso.
 */
export function useCompanyAiLive(companyId: string | null) {
  const { data, loading } = useQuery<
    CompanyAiLiveStatusResponse,
    CompanyAiLiveStatusVariables
  >(COMPANY_AI_LIVE_QUERY, {
    variables: { companyId: companyId ?? "" },
    skip: !companyId,
  });

  const configured = isCompanyAiConfigured(data?.saasCompany);
  const connectionTested = (data?.techAiCallLogs?.length ?? 0) > 0;

  return {
    isAiLive: configured && connectionTested,
    configured,
    billingMode: data?.saasCompany?.aiBillingMode ?? null,
    loading,
  };
}
