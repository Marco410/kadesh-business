"use client";

import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import {
  AI_BILLING_MODE,
  TYPICAL_DIGEST_CREDITS,
} from "./constants";
import { useCompanyAiLive } from "./useCompanyAiLive";
import {
  DAILY_DIGEST_QUERY,
  GENERATE_DAILY_DIGEST_MUTATION,
  type DailyDigestQueryResponse,
  type DailyDigestQueryVariables,
  type GenerateDailyDigestResponse,
  type GenerateDailyDigestVariables,
} from "./queries";

/**
 * Resumen del día (3 pasos). Lo comparten Inicio y la tab Dashboard de Kadesh AI.
 */
export function useDailyDigest({
  companyId,
  remainingQuota,
  onGenerated,
}: {
  companyId: string;
  remainingQuota?: number | null;
  onGenerated?: () => void;
}) {
  const live = useCompanyAiLive(companyId);

  const digestQuery = useQuery<
    DailyDigestQueryResponse,
    DailyDigestQueryVariables
  >(DAILY_DIGEST_QUERY, {
    variables: { companyId },
    skip: !companyId || !live.isAiLive,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const [generateDigest, { loading: generating }] = useMutation<
    GenerateDailyDigestResponse,
    GenerateDailyDigestVariables
  >(GENERATE_DAILY_DIGEST_MUTATION, {
    update(cache, { data }) {
      const payload = data?.generateDailyDigest;
      if (!payload?.success || !payload.insight) return;
      cache.writeQuery<DailyDigestQueryResponse, DailyDigestQueryVariables>({
        query: DAILY_DIGEST_QUERY,
        variables: { companyId },
        data: { dailyDigest: payload },
      });
    },
  });

  const insight = digestQuery.data?.dailyDigest?.insight ?? null;
  const isManaged = live.billingMode === AI_BILLING_MODE.MANAGED;
  const creditHint = isManaged
    ? remainingQuota != null
      ? `Suele costar unos ${TYPICAL_DIGEST_CREDITS} créditos. Te quedan ${remainingQuota}.`
      : `Suele costar unos ${TYPICAL_DIGEST_CREDITS} créditos.`
    : "Con tu API key no se descuentan créditos de Kadesh.";

  async function generate(force: boolean) {
    try {
      const response = await generateDigest({
        variables: { companyId, force },
      });
      const payload = response.data?.generateDailyDigest;
      if (!payload?.success || !payload.insight) {
        sileo.error({
          title: payload?.message || "No se pudo generar el resumen",
        });
        return;
      }
      onGenerated?.();
      if (payload.cached) {
        sileo.success({ title: payload.message });
        return;
      }
      const charged = payload.creditsCharged ?? 0;
      sileo.success({
        title: payload.message,
        ...(charged > 0
          ? {
              description: `${charged} crédito${charged === 1 ? "" : "s"} debitados.`,
            }
          : {}),
      });
    } catch (err) {
      sileo.error({
        title:
          err instanceof Error ? err.message : "No se pudo generar el resumen",
      });
    }
  }

  return {
    isAiLive: live.isAiLive,
    configured: live.configured,
    liveLoading: live.loading,
    insight,
    actions: insight?.actions ?? [],
    loading: digestQuery.loading && !insight,
    error: digestQuery.error && !insight ? digestQuery.error : null,
    generating,
    generate,
    isManaged,
    creditHint,
  };
}
