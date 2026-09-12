"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { formatDate } from "kadesh/utils/format-date";
import { cn } from "kadesh/utils/cn";
import { useRemainingCredits } from "kadesh/components/panel/hooks";
import {
  AI_BILLING_MODE,
  KADESH_URIM_AI_NAME,
  TYPICAL_DIGEST_CREDITS,
} from "./constants";
import { useCompanyAiLive } from "./useCompanyAiLive";
import { buildProfileRecommendations } from "./profileRecommendations";
import { ExpandableCopy } from "./ExpandableCopy";
import {
  AI_PLAYBOOK_QUERY,
  COMPANY_AI_SETTINGS_QUERY,
  GENERATE_AI_PLAYBOOK_MUTATION,
  type AiPlaybookQueryResponse,
  type CompanyAiSettingsResponse,
  type CompanyAiSettingsVariables,
  type DailyDigestQueryVariables,
  type GenerateAiPlaybookResponse,
  type GenerateAiPlaybookVariables,
} from "./queries";

type AiRecommendationsCardProps = {
  companyId: string;
  onOpenSettings?: () => void;
  onOpenCompanyInfo?: () => void;
};

/**
 * Recomendaciones de industria/perfil: heurísticas inmediatas + playbook de IA cacheado.
 */
export function AiRecommendationsCard({
  companyId,
  onOpenSettings,
  onOpenCompanyInfo,
}: AiRecommendationsCardProps) {
  const { isAiLive, billingMode } = useCompanyAiLive(companyId);
  const { remainingQuota, refetch: refetchCredits } =
    useRemainingCredits(companyId);
  const isManaged = billingMode === AI_BILLING_MODE.MANAGED;

  const settingsQuery = useQuery<
    CompanyAiSettingsResponse,
    CompanyAiSettingsVariables
  >(COMPANY_AI_SETTINGS_QUERY, {
    variables: { id: companyId },
    skip: !companyId,
  });

  const playbookQuery = useQuery<
    AiPlaybookQueryResponse,
    DailyDigestQueryVariables
  >(AI_PLAYBOOK_QUERY, {
    variables: { companyId },
    skip: !companyId || !isAiLive,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const [generatePlaybook, { loading: generating }] = useMutation<
    GenerateAiPlaybookResponse,
    GenerateAiPlaybookVariables
  >(GENERATE_AI_PLAYBOOK_MUTATION, {
    update(cache, { data }) {
      const payload = data?.generateAiPlaybook;
      if (!payload?.success || !payload.insight) return;
      cache.writeQuery<AiPlaybookQueryResponse, DailyDigestQueryVariables>({
        query: AI_PLAYBOOK_QUERY,
        variables: { companyId },
        data: { aiPlaybook: payload },
      });
    },
  });

  const company = settingsQuery.data?.saasCompany ?? null;
  const heuristicRecs = useMemo(
    () => buildProfileRecommendations(company),
    [company],
  );
  const insight = playbookQuery.data?.aiPlaybook?.insight ?? null;
  const aiActions = insight?.actions ?? [];
  const items =
    aiActions.length > 0
      ? aiActions.map((action) => ({
          title: action.title,
          detail: action.detail,
        }))
      : heuristicRecs;

  const creditHint = isManaged
    ? remainingQuota != null
      ? `Suele costar unos ${TYPICAL_DIGEST_CREDITS} créditos. Te quedan ${remainingQuota}.`
      : `Suele costar unos ${TYPICAL_DIGEST_CREDITS} créditos.`
    : "Con tu API key no se descuentan créditos de Kadesh.";

  async function runGenerate(force: boolean) {
    try {
      const response = await generatePlaybook({
        variables: { companyId, force },
      });
      const payload = response.data?.generateAiPlaybook;
      if (!payload?.success || !payload.insight) {
        sileo.error({
          title: payload?.message || "No se pudieron generar recomendaciones",
        });
        return;
      }
      void refetchCredits();
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
          err instanceof Error
            ? err.message
            : "No se pudieron generar recomendaciones",
      });
    }
  }

  return (
    <section className="rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="ai-urim-icon">
              <HugeiconsIcon icon={SparklesIcon} size={20} />
            </span>
            <h3 className="text-base font-semibold text-[#212121] dark:text-white">
              Recomendaciones
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#9e9e9e] dark:text-[#7a7a7a]">
            {insight?.generatedAt
              ? formatDate(insight.generatedAt)
              : "Según tu perfil"}
          </p>
        </div>
        {isAiLive && insight ? (
          <button
            type="button"
            onClick={() => void runGenerate(true)}
            disabled={generating}
            title={isManaged ? creditHint : undefined}
            className="shrink-0 text-sm font-medium text-[#616161] hover:text-orange-600 disabled:opacity-50 dark:text-[#b0b0b0] dark:hover:text-orange-400"
          >
            {generating ? "Regenerando…" : "Regenerar"}
          </button>
        ) : null}
      </div>

      {settingsQuery.loading && !company ? (
        <div className="h-28 animate-pulse rounded-xl bg-[#ececec] dark:bg-[#2a2a2a]" />
      ) : items.length === 0 ? (
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          Completa el perfil de empresa para ver recomendaciones a tu medida.
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((item, index) => (
            <li key={`${item.title}-${index}`} className="flex gap-2.5">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--ai-urim-purple), var(--ai-urim-blue))",
                }}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[#212121] dark:text-white">
                  {item.title}
                </span>
                <ExpandableCopy text={item.detail} />
                {"action" in item &&
                item.action === "info" &&
                onOpenCompanyInfo ? (
                  <button
                    type="button"
                    onClick={onOpenCompanyInfo}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
                  >
                    Completar ahora
                    <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                  </button>
                ) : "href" in item && item.href ? (
                  <Link
                    href={item.href}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
                  >
                    Ir ahora
                    <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                  </Link>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      )}

      {isAiLive && !insight ? (
        <div className="mt-4">
          <p className="text-sm text-[#9e9e9e] dark:text-[#7a7a7a]">
            {creditHint}
          </p>
          <button
            type="button"
            onClick={() => void runGenerate(false)}
            disabled={generating}
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
            style={{
              background:
                "linear-gradient(135deg, var(--ai-urim-purple), var(--ai-urim-blue))",
            }}
          >
            <HugeiconsIcon
              icon={SparklesIcon}
              size={16}
              className={generating ? "animate-spin" : undefined}
            />
            {generating
              ? "Generando…"
              : `Pedir recomendaciones a ${KADESH_URIM_AI_NAME}`}
          </button>
        </div>
      ) : !isAiLive && onOpenSettings ? (
        <button
          type="button"
          onClick={onOpenSettings}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
        >
          Activa {KADESH_URIM_AI_NAME} para recomendaciones más precisas
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
        </button>
      ) : null}
    </section>
  );
}
