"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client";
import { useCompanyAiLive } from "./useCompanyAiLive";
import {
  COMPANY_AI_BRIEF_QUERY,
  GENERATE_COMPANY_AI_BRIEF_MUTATION,
  type CompanyAiBriefQueryResponse,
  type GenerateCompanyAiBriefResponse,
  type GenerateCompanyAiBriefVariables,
} from "./queries";

type RefreshOptions = {
  force: boolean;
};

/**
 * Regenera el brief de negocio. No lanza: el guardado del perfil no debe fallar si la IA falla.
 */
export function useRefreshCompanyAiBrief(companyId: string | null) {
  const { isAiLive } = useCompanyAiLive(companyId);
  const [generate, { loading }] = useMutation<
    GenerateCompanyAiBriefResponse,
    GenerateCompanyAiBriefVariables
  >(GENERATE_COMPANY_AI_BRIEF_MUTATION);

  const refresh = useCallback(
    async (options: RefreshOptions): Promise<boolean> => {
      if (!companyId || !isAiLive) return false;
      try {
        const response = await generate({
          variables: { companyId, force: options.force },
          update(cache, { data }) {
            const payload = data?.generateCompanyAiBrief;
            if (!payload?.success) return;
            cache.writeQuery<CompanyAiBriefQueryResponse>({
              query: COMPANY_AI_BRIEF_QUERY,
              variables: { companyId },
              data: { companyAiBrief: payload },
            });
          },
        });
        return Boolean(response.data?.generateCompanyAiBrief?.success);
      } catch {
        return false;
      }
    },
    [companyId, generate, isAiLive],
  );

  return { refresh, isAiLive, loading };
}
