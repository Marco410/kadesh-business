"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { Routes } from "kadesh/core/routes";
import { formatDate } from "kadesh/utils/format-date";
import { cn } from "kadesh/utils/cn";
import {
  AI_BILLING_MODE,
  KADESH_URIM_AI_NAME,
  TYPICAL_DIGEST_CREDITS,
} from "kadesh/components/profile/ai/constants";
import { useCompanyAiLive } from "kadesh/components/profile/ai/useCompanyAiLive";
import {
  DAILY_DIGEST_QUERY,
  GENERATE_DAILY_DIGEST_MUTATION,
  type DailyDigestQueryResponse,
  type DailyDigestQueryVariables,
  type GenerateDailyDigestResponse,
  type GenerateDailyDigestVariables,
} from "kadesh/components/profile/ai/queries";

type DailyDigestCardProps = {
  companyId: string;
  canManageAi: boolean;
  isCompanyWide: boolean;
  remainingQuota?: number | null;
  onGenerated?: () => void;
};

const DIGEST_SOURCES = [
  "Cotizaciones enviadas sin respuesta",
  "Clientes sin primer contacto",
  "Seguimientos vencidos",
  "Leads que se enfriaron",
] as const;

function DigestDescription({ isCompanyWide }: { isCompanyWide: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
        {isCompanyWide
          ? `${KADESH_URIM_AI_NAME} revisa el pipeline de la empresa y te propone 3 siguientes pasos para hoy: a quién contactar, qué cotización empujar y qué seguimiento no puede esperar.`
          : `${KADESH_URIM_AI_NAME} revisa tus clientes y te propone 3 siguientes pasos para hoy: a quién contactar, qué cotización empujar y qué seguimiento no puede esperar.`}
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {DIGEST_SOURCES.map((source) => (
          <li
            key={source}
            className="flex items-center gap-2 text-sm text-[#616161] dark:text-[#b0b0b0]"
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--ai-urim-purple), var(--ai-urim-blue))",
              }}
              aria-hidden
            />
            {source}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Resumen del día de Kadesh AI: 3 siguientes pasos, cacheado por día.
 */
export function DailyDigestCard({
  companyId,
  canManageAi,
  isCompanyWide,
  remainingQuota,
  onGenerated,
}: DailyDigestCardProps) {
  const {
    isAiLive,
    configured,
    billingMode,
    loading: liveLoading,
  } = useCompanyAiLive(companyId);

  const digestQuery = useQuery<
    DailyDigestQueryResponse,
    DailyDigestQueryVariables
  >(DAILY_DIGEST_QUERY, {
    variables: { companyId },
    skip: !companyId || !isAiLive,
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

  const result = digestQuery.data?.dailyDigest;
  const insight = result?.insight ?? null;
  const actions = insight?.actions ?? [];
  const isManaged = billingMode === AI_BILLING_MODE.MANAGED;
  const title = isCompanyWide ? "Resumen del día" : "Tu resumen del día";
  const generateLabel = isCompanyWide
    ? "Generar el resumen del día"
    : "Generar mi resumen del día";

  const creditHint = isManaged
    ? remainingQuota != null
      ? `En modalidad administrada suele costar unos ${TYPICAL_DIGEST_CREDITS} créditos. Te quedan ${remainingQuota}.`
      : `En modalidad administrada suele costar unos ${TYPICAL_DIGEST_CREDITS} créditos.`
    : "Con tu API key no se descuentan créditos de Kadesh.";

  async function runGenerate(force: boolean) {
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

  if (liveLoading && !configured) {
    return (
      <section
        className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm"
        aria-hidden
      >
        <div className="h-20 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
      </section>
    );
  }

  if (!isAiLive) {
    return (
      <section className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="ai-urim-icon mt-0.5">
            <HugeiconsIcon icon={SparklesIcon} size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-[#212121] dark:text-white">
              {title}
            </h3>
            <div className="mt-1">
              <DigestDescription isCompanyWide={isCompanyWide} />
            </div>
            {configured ? (
              <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
                Prueba la conexión de {KADESH_URIM_AI_NAME} para desbloquearlo.
              </p>
            ) : null}
            {canManageAi ? (
              <Link
                href={Routes.panelAi}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
              >
                {configured
                  ? "Probar conexión"
                  : `Configurar ${KADESH_URIM_AI_NAME}`}
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
              </Link>
            ) : (
              <p className="mt-2 text-sm text-[#9e9e9e] dark:text-[#7a7a7a]">
                Pide al administrador de la empresa que active{" "}
                {KADESH_URIM_AI_NAME}.
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="ai-urim-icon">
              <HugeiconsIcon icon={SparklesIcon} size={20} />
            </span>
            <h3 className="text-lg font-semibold text-[#212121] dark:text-white">
              {title}
            </h3>
          </div>
          {insight ? (
            <p className="mt-0.5 text-sm text-[#616161] dark:text-[#b0b0b0]">
              {insight.generatedAt
                ? `Generado ${formatDate(insight.generatedAt).toLowerCase()}.`
                : "Tres siguientes pasos para hoy."}
            </p>
          ) : null}
        </div>
        {insight ? (
          <button
            type="button"
            onClick={() => void runGenerate(true)}
            disabled={generating}
            title={isManaged ? creditHint : undefined}
            className="shrink-0 text-sm font-medium text-[#616161] dark:text-[#b0b0b0] hover:text-orange-600 dark:hover:text-orange-400 disabled:opacity-50"
          >
            {generating ? "Regenerando…" : "Regenerar"}
          </button>
        ) : null}
      </div>

      {digestQuery.error && !insight ? (
        <p className="text-sm text-red-700 dark:text-red-400">
          No se pudo cargar el resumen del día. Inténtalo de nuevo en un
          momento.
        </p>
      ) : digestQuery.loading && !insight ? (
        <div className="h-24 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
      ) : actions.length > 0 ? (
        <ol className="space-y-2.5">
          {actions.map((action, index) => (
            <li key={`${action.title}-${index}`} className="flex gap-3">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--ai-urim-purple), var(--ai-urim-blue))",
                }}
              >
                {index + 1}
              </span>
              <span>
                <span className="block text-base font-medium text-[#212121] dark:text-white">
                  {action.title}
                </span>
                <span className="block text-sm text-[#616161] dark:text-[#b0b0b0]">
                  {action.detail}
                </span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <div>
          <DigestDescription isCompanyWide={isCompanyWide} />
          <p className="mt-2 text-sm text-[#9e9e9e] dark:text-[#7a7a7a]">
            {creditHint}
          </p>
          <button
            type="button"
            onClick={() => void runGenerate(false)}
            disabled={generating}
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white",
              "disabled:opacity-60 disabled:cursor-not-allowed",
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
            {generating ? "Generando…" : generateLabel}
          </button>
        </div>
      )}
    </section>
  );
}
