"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { formatDate } from "kadesh/utils/format-date";
import { KADESH_URIM_AI_NAME, ONBOARDING_CONTEXT_FIELDS } from "./constants";
import { useCompanyAiLive } from "./useCompanyAiLive";
import { useRefreshCompanyAiBrief } from "./useRefreshCompanyAiBrief";
import {
  buildCompanyKnowledgePillars,
  companyHasOnboardingText,
} from "./companyKnowledge";
import { ExpandableCopy } from "./ExpandableCopy";
import {
  COMPANY_AI_BRIEF_QUERY,
  COMPANY_AI_SETTINGS_QUERY,
  type CompanyAiBriefQueryResponse,
  type CompanyAiSettingsResponse,
  type CompanyAiSettingsVariables,
  type DailyDigestQueryVariables,
} from "./queries";

type AiCompanyKnowledgeCardProps = {
  companyId: string;
  onOpenCompanyInfo: () => void;
};

const PILLAR_HEADING = Object.fromEntries(
  ONBOARDING_CONTEXT_FIELDS.map((field) => [
    field.key,
    `${field.shortLabel} — ${field.label}`,
  ]),
) as Record<string, string>;

const PILLAR_SHORT = Object.fromEntries(
  ONBOARDING_CONTEXT_FIELDS.map((field) => [field.key, field.shortLabel]),
) as Record<string, string>;

/**
 * Lo que Kadesh AI ya sabe de la empresa (Qué / Quién / Cuánto / Cómo) y qué falta precisar.
 */
export function AiCompanyKnowledgeCard({
  companyId,
  onOpenCompanyInfo,
}: AiCompanyKnowledgeCardProps) {
  const { isAiLive, loading: liveLoading } = useCompanyAiLive(companyId);
  const { refresh, loading: generating } = useRefreshCompanyAiBrief(companyId);
  const autoRequested = useRef(false);

  const settingsQuery = useQuery<
    CompanyAiSettingsResponse,
    CompanyAiSettingsVariables
  >(COMPANY_AI_SETTINGS_QUERY, {
    variables: { id: companyId },
    skip: !companyId,
  });

  const briefQuery = useQuery<
    CompanyAiBriefQueryResponse,
    DailyDigestQueryVariables
  >(COMPANY_AI_BRIEF_QUERY, {
    variables: { companyId },
    skip: !companyId,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const company = settingsQuery.data?.saasCompany ?? null;
  const insight = briefQuery.data?.companyAiBrief?.insight ?? null;
  const heuristicPillars = useMemo(
    () => buildCompanyKnowledgePillars(company),
    [company],
  );
  const pillars = insight?.pillars?.length ? insight.pillars : heuristicPillars;
  const missing = pillars.flatMap((pillar) =>
    pillar.gaps.map((gap) => ({
      key: pillar.key,
      label: PILLAR_SHORT[pillar.key] ?? pillar.title,
      gap,
    })),
  );
  const hasProfile = companyHasOnboardingText(company);

  useEffect(() => {
    if (autoRequested.current) return;
    if (liveLoading || !isAiLive || insight || !hasProfile) return;
    if (briefQuery.loading) return;
    autoRequested.current = true;
    void refresh({ force: false }).then((ok) => {
      if (!ok) autoRequested.current = false;
    });
  }, [briefQuery.loading, hasProfile, insight, isAiLive, liveLoading, refresh]);

  const waiting =
    (settingsQuery.loading && !company) ||
    (generating && !insight) ||
    (isAiLive && briefQuery.loading && !insight);

  return (
    <section className="rounded-2xl border border-[#e0e0e0] bg-white shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#ececec] bg-white px-4 py-3 dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="ai-urim-icon">
              <HugeiconsIcon icon={SparklesIcon} size={18} />
            </span>
            <h3 className="text-base font-semibold text-[#212121] dark:text-white">
              Lo que {KADESH_URIM_AI_NAME} sabe
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#9e9e9e] dark:text-[#7a7a7a]">
            {insight?.generatedAt
              ? formatDate(insight.generatedAt)
              : "Según tu perfil"}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCompanyInfo}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400"
        >
          Editar
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
        </button>
      </div>

      {waiting ? (
        <div className="space-y-3 p-4">
          <div className="h-16 animate-pulse rounded-lg bg-[#ececec] dark:bg-[#2a2a2a]" />
          <div className="h-16 animate-pulse rounded-lg bg-[#ececec] dark:bg-[#2a2a2a]" />
        </div>
      ) : (
        <>
          <ul className="divide-y divide-[#ececec] dark:divide-[#2a2a2a]">
            {pillars.map((pillar) => {
              const heading = PILLAR_HEADING[pillar.key] ?? pillar.title;

              return (
                <li key={pillar.key} className="px-4 py-3">
                  <p className="text-sm font-semibold text-[#212121] dark:text-white">
                    {heading}
                  </p>
                  <div className="mt-1">
                    <ExpandableCopy text={pillar.summary} />
                  </div>
                </li>
              );
            })}
          </ul>
          {missing.length > 0 ? (
            <div className="border-t border-[#ececec] bg-[#fafafa] px-4 py-3 dark:border-[#2a2a2a] dark:bg-[#252525]">
              <p className="text-sm font-semibold text-[#212121] dark:text-white">
                Para afinar lo que sabe
              </p>
              <p className="mt-0.5 text-xs text-[#9e9e9e] dark:text-[#7a7a7a]">
                Si lo agregas en Información, el resumen y las recomendaciones se
                ajustan.
              </p>
              <ul className="mt-2 space-y-1.5">
                {missing.map((item) => (
                  <li
                    key={`${item.key}-${item.gap}`}
                    className="text-xs leading-snug text-[#616161] dark:text-[#b0b0b0]"
                  >
                    <span className="font-medium text-[#212121] dark:text-white">
                      {item.label} —
                    </span>{" "}
                    {item.gap}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onOpenCompanyInfo}
                className="mt-2 text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400"
              >
                Agregarlo en Información
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
