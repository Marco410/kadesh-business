"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { ONBOARDING_CONTEXT_FIELDS } from "./constants";
import {
  buildCompanyKnowledgePillars,
  buildPillarCoverage,
  companyBriefSourceHash,
  companyHasOnboardingText,
  knowledgePercent,
} from "./companyKnowledge";
import {
  COMPANY_AI_BRIEF_QUERY,
  COMPANY_AI_SETTINGS_QUERY,
  type CompanyAiBriefQueryResponse,
  type CompanyAiSettingsResponse,
  type CompanyAiSettingsVariables,
  type DailyDigestQueryVariables,
} from "./queries";

const SOURCE_SEPARATOR = "\n---\n";

/**
 * Lo que Kadesh AI sabe del negocio y qué tan completo está.
 * Si una respuesta cambió después del último brief, esa pregunta usa la
 * lectura local (sin IA) hasta que se regenere: nunca muestra huecos viejos.
 */
export function useCompanyKnowledge(companyId: string) {
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

  return useMemo(() => {
    const local = buildCompanyKnowledgePillars(company);
    const briefSource = insight?.sourceHash.split(SOURCE_SEPARATOR) ?? [];
    const briefMatchesShape =
      briefSource.length === ONBOARDING_CONTEXT_FIELDS.length;

    const aiKeys = new Set<string>();
    const pillars = local.map((localPillar, index) => {
      const field = ONBOARDING_CONTEXT_FIELDS[index];
      const fromAi = insight?.pillars.find((p) => p.key === localPillar.key);
      const current = company?.[field.key]?.trim() ?? "";
      const sameText = briefMatchesShape && briefSource[index] === current;
      if (!fromAi || !sameText) return localPillar;
      aiKeys.add(localPillar.key);
      return fromAi;
    });

    const coverage = buildPillarCoverage(pillars, company, aiKeys);
    const answered = coverage.filter((pillar) => pillar.state !== "empty")
      .length;
    const firstIncomplete =
      coverage.find((pillar) => pillar.state === "empty") ??
      coverage.find((pillar) => pillar.state === "partial") ??
      null;

    return {
      company,
      insight,
      coverage,
      percent: knowledgePercent(coverage),
      answered,
      firstIncompleteKey: firstIncomplete?.key ?? null,
      hasProfile: companyHasOnboardingText(company),
      isStale: Boolean(
        insight && insight.sourceHash !== companyBriefSourceHash(company),
      ),
      loading: settingsQuery.loading && !company,
      briefLoading: briefQuery.loading && !insight,
    };
  }, [
    briefQuery.loading,
    company,
    insight,
    settingsQuery.loading,
  ]);
}
