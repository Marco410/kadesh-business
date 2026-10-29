"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import {
  KADESH_URIM_AI_NAME,
  ONBOARDING_CONTEXT_FIELDS,
  formatAiDateInline,
  type OnboardingContextKey,
} from "./constants";
import { useCompanyAiLive } from "./useCompanyAiLive";
import { useRefreshCompanyAiBrief } from "./useRefreshCompanyAiBrief";
import { useCompanyKnowledge } from "./useCompanyKnowledge";
import type { PillarCoverage } from "./companyKnowledge";
import { ExpandableCopy } from "./ExpandableCopy";
import {
  AiSegmentMeter,
  PILLAR_STATE_META,
  PillarStateIcon,
} from "./AiVisuals";
import {
  aiFadeUpVariants,
  aiMotionTransition,
  aiStaggerContainer,
} from "./motion";

type AiCompanyKnowledgeCardProps = {
  companyId: string;
  onOpenCompanyInfo: (step?: OnboardingContextKey) => void;
};

const FIELD_BY_KEY = Object.fromEntries(
  ONBOARDING_CONTEXT_FIELDS.map((field) => [field.key, field]),
) as Record<
  OnboardingContextKey,
  (typeof ONBOARDING_CONTEXT_FIELDS)[number]
>;

/**
 * Lo que Kadesh AI ya sabe de la empresa (Qué / Quién / Cuánto / Cómo):
 * estado de cada pregunta, resumen y, plegado, lo que aún falta.
 */
export function AiCompanyKnowledgeCard({
  companyId,
  onOpenCompanyInfo,
}: AiCompanyKnowledgeCardProps) {
  const { isAiLive, loading: liveLoading } = useCompanyAiLive(companyId);
  const { refresh, loading: generating } = useRefreshCompanyAiBrief(companyId);
  const knowledge = useCompanyKnowledge(companyId);
  const { insight, isStale, hasProfile, briefLoading, loading } = knowledge;
  const autoRequested = useRef(false);
  const reduce = useReducedMotion();

  // Pide el brief la primera vez, o si el perfil cambió desde el último.
  // Una sola vez por montaje: si falla, no reintenta en bucle.
  useEffect(() => {
    if (autoRequested.current) return;
    if (liveLoading || !isAiLive || !hasProfile) return;
    if (loading || briefLoading) return;
    if (insight && !isStale) return;
    autoRequested.current = true;
    void refresh({ force: Boolean(insight) });
  }, [
    briefLoading,
    hasProfile,
    insight,
    isAiLive,
    isStale,
    liveLoading,
    loading,
    refresh,
  ]);

  const updatedLabel =
    insight?.generatedAt && !isStale
      ? `Actualizado ${formatAiDateInline(insight.generatedAt)}`
      : "Según tu perfil";

  return (
    <section className="rounded-2xl border border-[#e0e0e0] bg-white shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-[#ececec] bg-white px-4 py-3 dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
        <div className="flex items-start justify-between gap-3">
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
              {updatedLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenCompanyInfo()}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400"
          >
            Editar
            <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
          </button>
        </div>
        {!loading ? (
          <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
            <span className="font-semibold text-[#212121] dark:text-white">
              {knowledge.answered} de {ONBOARDING_CONTEXT_FIELDS.length}
            </span>{" "}
            preguntas respondidas · conoce tu negocio al{" "}
            <span className="font-semibold text-[#212121] dark:text-white">
              {knowledge.percent}%
            </span>
          </p>
        ) : null}
        <AnimatePresence>
          {generating ? (
            <motion.p
              role="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-center gap-2 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
            >
              <span className="size-3 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {KADESH_URIM_AI_NAME} está leyendo tu perfil…
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="space-y-3 p-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-14 animate-pulse rounded-lg bg-[#ececec] dark:bg-[#2a2a2a]"
            />
          ))}
        </div>
      ) : (
        <motion.ul
          className="divide-y divide-[#ececec] dark:divide-[#2a2a2a]"
          variants={aiStaggerContainer(reduce, 0.03)}
          initial="hidden"
          animate="show"
        >
          {knowledge.coverage.map((pillar) => (
            <motion.li
              key={pillar.key}
              variants={aiFadeUpVariants(reduce)}
              transition={aiMotionTransition(reduce)}
            >
              <PillarRow
                pillar={pillar}
                onAnswer={() => onOpenCompanyInfo(pillar.key)}
              />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}

function PillarRow({
  pillar,
  onAnswer,
}: {
  pillar: PillarCoverage;
  onAnswer: () => void;
}) {
  const [showGaps, setShowGaps] = useState(false);
  const field = FIELD_BY_KEY[pillar.key];
  const stateMeta = PILLAR_STATE_META[pillar.state];

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5">
        <PillarStateIcon state={pillar.state} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-semibold text-[#212121] dark:text-white">
            {field.shortLabel}
            <span className="font-normal text-[#616161] dark:text-[#b0b0b0]">
              {" "}
              · {field.label}
            </span>
          </p>
          <AiSegmentMeter covered={pillar.covered} />
        </div>
        <p className={cn("text-xs font-medium", stateMeta.className)}>
          {stateMeta.label}
        </p>

        {pillar.state === "empty" ? (
          <div className="mt-1.5">
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              {field.question}
            </p>
            <button
              type="button"
              onClick={onAnswer}
              className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
            >
              Responder
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
          </div>
        ) : (
          <div className="mt-1.5">
            <ExpandableCopy text={pillar.summary} />
          </div>
        )}

        {pillar.gaps.length > 0 ? (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowGaps((current) => !current)}
              aria-expanded={showGaps}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#616161] hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:text-white"
            >
              Para afinar ({pillar.gaps.length})
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={12}
                className={cn(
                  "transition-transform",
                  showGaps && "rotate-180",
                )}
              />
            </button>
            {showGaps ? (
              <div className="mt-1.5 rounded-lg bg-[#fafafa] p-2.5 dark:bg-[#252525]">
                <ul className="space-y-1">
                  {pillar.gaps.map((gap) => (
                    <li
                      key={gap}
                      className="flex gap-2 text-xs leading-snug text-[#616161] dark:text-[#b0b0b0]"
                    >
                      <span
                        aria-hidden
                        className="mt-1.5 size-1 shrink-0 rounded-full bg-violet-400"
                      />
                      {gap}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={onAnswer}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400"
                >
                  Agregarlo
                  <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
