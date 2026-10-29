"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  RefreshIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { formatDate } from "kadesh/utils/format-date";
import type { NavAccessContext } from "kadesh/components/profile/usuarios/can";
import { KADESH_URIM_AI_NAME } from "kadesh/components/profile/ai/constants";
import { useDailyDigest } from "kadesh/components/profile/ai/useDailyDigest";
import { useAiActionLinks } from "kadesh/components/profile/ai/useAiActionLinks";
import { AiStepTimeline } from "kadesh/components/profile/ai/AiActionList";
import { AiThinking } from "kadesh/components/profile/ai/AiVisuals";

type DailyDigestCardProps = {
  companyId: string;
  canManageAi: boolean;
  isCompanyWide: boolean;
  remainingQuota?: number | null;
  onGenerated?: () => void;
  onConfigure?: () => void;
  /** Con él, cada paso enlaza a la pantalla que lo resuelve (si hay permiso). */
  navCtx?: NavAccessContext;
};

const DIGEST_SOURCES = [
  "Cotizaciones enviadas sin respuesta",
  "Clientes sin primer contacto",
  "Seguimientos vencidos",
  "Leads que se enfriaron",
] as const;

const DIGEST_STEPS = [
  "Revisando seguimientos vencidos",
  "Revisando cotizaciones sin respuesta",
  "Buscando clientes sin primer contacto",
  "Detectando leads fríos",
  "Eligiendo tus 3 pasos de hoy",
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
  onConfigure,
  navCtx,
}: DailyDigestCardProps) {
  const digest = useDailyDigest({ companyId, remainingQuota, onGenerated });
  const linkFor = useAiActionLinks({ navCtx });
  const { insight, actions, configured } = digest;
  const title = isCompanyWide ? "Resumen del día" : "Tu resumen del día";
  const generateLabel = isCompanyWide
    ? "Generar el resumen del día"
    : "Generar mi resumen del día";

  if (digest.liveLoading && !configured) {
    return (
      <section
        className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm"
        aria-hidden
      >
        <div className="h-20 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
      </section>
    );
  }

  if (!digest.isAiLive) {
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
              onConfigure ? (
                <button
                  type="button"
                  onClick={onConfigure}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
                >
                  {configured
                    ? "Probar conexión"
                    : `Configurar ${KADESH_URIM_AI_NAME}`}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                </button>
              ) : (
                <Link
                  href={Routes.panelAi}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
                >
                  {configured
                    ? "Probar conexión"
                    : `Configurar ${KADESH_URIM_AI_NAME}`}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                </Link>
              )
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
            <h3 className="text-base font-semibold text-[#212121] dark:text-white">
              {title}
            </h3>
          </div>
          {insight?.generatedAt ? (
            <p className="mt-0.5 text-xs text-[#9e9e9e] dark:text-[#7a7a7a]">
              {formatDate(insight.generatedAt)}
            </p>
          ) : null}
        </div>
        {insight ? (
          <button
            type="button"
            onClick={() => void digest.generate(true)}
            disabled={digest.generating}
            title={digest.isManaged ? digest.creditHint : undefined}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e0e0e0] px-2.5 py-1.5 text-xs font-medium text-[#616161] hover:border-violet-300 hover:text-violet-700 disabled:opacity-50 dark:border-[#3a3a3a] dark:text-[#b0b0b0] dark:hover:border-violet-500/50 dark:hover:text-violet-300"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={14}
              className={digest.generating ? "animate-spin" : undefined}
            />
            {digest.generating ? "Regenerando…" : "Regenerar"}
          </button>
        ) : null}
      </div>

      {digest.generating ? (
        <AiThinking
          title={`${KADESH_URIM_AI_NAME} está revisando tu pipeline`}
          steps={DIGEST_STEPS}
        />
      ) : digest.error ? (
        <p className="text-sm text-red-700 dark:text-red-400">
          No se pudo cargar el resumen del día. Inténtalo de nuevo en un
          momento.
        </p>
      ) : digest.loading ? (
        <div className="h-24 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
      ) : actions.length > 0 ? (
        <AiStepTimeline items={actions} linkFor={linkFor} />
      ) : (
        <div>
          <DigestDescription isCompanyWide={isCompanyWide} />
          <p className="mt-2 text-sm text-[#9e9e9e] dark:text-[#7a7a7a]">
            {digest.creditHint}
          </p>
          <button
            type="button"
            onClick={() => void digest.generate(false)}
            className="ai-urim-fill mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <HugeiconsIcon icon={SparklesIcon} size={16} />
            {generateLabel}
          </button>
        </div>
      )}
    </section>
  );
}
