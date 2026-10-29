"use client";

import { useMemo } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Idea01Icon,
  RefreshIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { formatDate } from "kadesh/utils/format-date";
import { useRemainingCredits } from "kadesh/components/panel/hooks";
import {
  AI_BILLING_MODE,
  KADESH_URIM_AI_NAME,
  TYPICAL_DIGEST_CREDITS,
} from "./constants";
import type { AiActionKind } from "./actionKinds";
import { useCompanyAiLive } from "./useCompanyAiLive";
import type { AiActionLink } from "./useAiActionLinks";
import { buildProfileRecommendations } from "./profileRecommendations";
import { AiTipGrid } from "./AiActionList";
import { AiThinking } from "./AiVisuals";
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
  linkFor?: (kind: AiActionKind) => AiActionLink | null;
  onOpenCompanyInfo?: () => void;
};

const PLAYBOOK_STEPS = [
  "Leyendo tu perfil",
  "Revisando tu industria y tus nichos",
  "Escribiendo recomendaciones para tu negocio",
] as const;

/**
 * Recomendaciones de industria/perfil: heurísticas inmediatas + playbook de IA cacheado.
 */
export function AiRecommendationsCard({
  companyId,
  linkFor,
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
  const fromAi = aiActions.length > 0;
  const items = fromAi ? aiActions : heuristicRecs;

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

  const subtitle = fromAi
    ? `Escritas por ${KADESH_URIM_AI_NAME}${insight?.generatedAt ? ` · ${formatDate(insight.generatedAt)}` : ""}`
    : "Sugerencias según tu perfil";

  return (
    <section className="rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="ai-urim-icon">
              <HugeiconsIcon icon={Idea01Icon} size={20} />
            </span>
            <h3 className="text-base font-semibold text-[#212121] dark:text-white">
              Recomendaciones para vender más
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#9e9e9e] dark:text-[#7a7a7a]">
            {subtitle}
          </p>
        </div>
        {isAiLive && fromAi ? (
          <button
            type="button"
            onClick={() => void runGenerate(true)}
            disabled={generating}
            title={isManaged ? creditHint : undefined}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e0e0e0] px-2.5 py-1.5 text-xs font-medium text-[#616161] hover:border-violet-300 hover:text-violet-700 disabled:opacity-50 dark:border-[#3a3a3a] dark:text-[#b0b0b0] dark:hover:border-violet-500/50 dark:hover:text-violet-300"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={14}
              className={generating ? "animate-spin" : undefined}
            />
            {generating ? "Regenerando…" : "Regenerar"}
          </button>
        ) : null}
      </div>

      {settingsQuery.loading && !company ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-32 animate-pulse rounded-xl bg-[#ececec] dark:bg-[#2a2a2a]" />
          <div className="h-32 animate-pulse rounded-xl bg-[#ececec] dark:bg-[#2a2a2a]" />
        </div>
      ) : generating ? (
        <AiThinking
          title={`${KADESH_URIM_AI_NAME} está preparando tus recomendaciones`}
          steps={PLAYBOOK_STEPS}
        />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-[#d6d6d6] p-4 dark:border-[#3a3a3a] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
            Responde las preguntas de tu negocio y aquí verás consejos para
            prospectar y cerrar en tu industria.
          </p>
          {onOpenCompanyInfo ? (
            <button
              type="button"
              onClick={onOpenCompanyInfo}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-orange-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Responder preguntas
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
          ) : null}
        </div>
      ) : (
        <AiTipGrid items={items} linkFor={linkFor} />
      )}

      {isAiLive && !fromAi && !generating && items.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3 rounded-xl bg-violet-50/70 p-3 dark:bg-violet-500/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#212121] dark:text-white">
              Pide recomendaciones escritas para tu negocio
            </p>
            <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
              {creditHint}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void runGenerate(false)}
            className="ai-urim-fill inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <HugeiconsIcon icon={SparklesIcon} size={16} />
            Pedir a {KADESH_URIM_AI_NAME}
          </button>
        </div>
      ) : !isAiLive && items.length > 0 ? (
        <p className="mt-3 text-xs text-[#9e9e9e] dark:text-[#7a7a7a]">
          Con {KADESH_URIM_AI_NAME} activa, estas recomendaciones se escriben
          para tu negocio en particular.
        </p>
      ) : null}
    </section>
  );
}
