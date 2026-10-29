"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Radar01Icon,
  SparklesIcon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import {
  KADESH_URIM_AI_NAME,
  ONBOARDING_CONTEXT_FIELDS,
  type OnboardingContextKey,
} from "./constants";
import { useCompanyKnowledge } from "./useCompanyKnowledge";
import { useAiPipelineSignals } from "./useAiPipelineSignals";
import { useDailyDigest } from "./useDailyDigest";
import { AiMeter } from "./AiVisuals";
import {
  aiFadeUpVariants,
  aiMotionTransition,
  aiStaggerContainer,
} from "./motion";

type AiOverviewCardProps = {
  companyId: string;
  canManageAi: boolean;
  isCompanyWide: boolean;
  onOpenSettings: () => void;
  onOpenCompanyInfo: (step?: OnboardingContextKey) => void;
};

type AiStatus = "loading" | "live" | "untested" | "off";

const STATUS_META: Record<
  Exclude<AiStatus, "loading">,
  { label: string; dot: string }
> = {
  live: { label: "Activa", dot: "bg-emerald-500" },
  untested: { label: "Falta probar la conexión", dot: "bg-amber-500" },
  off: { label: "Sin activar", dot: "bg-[#9e9e9e]" },
};

/**
 * Qué hace Kadesh AI y en qué va cada parte: conoce el negocio → revisa el
 * pipeline → dice qué hacer hoy. Cada paso con su dato real.
 */
export function AiOverviewCard({
  companyId,
  canManageAi,
  isCompanyWide,
  onOpenSettings,
  onOpenCompanyInfo,
}: AiOverviewCardProps) {
  const reduce = useReducedMotion();
  const knowledge = useCompanyKnowledge(companyId);
  const pipeline = useAiPipelineSignals(companyId, isCompanyWide);
  const digest = useDailyDigest({ companyId });

  const status: AiStatus =
    digest.liveLoading && !digest.configured
      ? "loading"
      : digest.isAiLive
        ? "live"
        : digest.configured
          ? "untested"
          : "off";

  const totalQuestions = ONBOARDING_CONTEXT_FIELDS.length;
  const profileDone = knowledge.percent >= 100;

  let cta: ReactNode = null;
  if (status === "off" || status === "untested") {
    cta = canManageAi ? (
      <button
        type="button"
        onClick={onOpenSettings}
        className="ai-urim-fill inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm"
      >
        {status === "off"
          ? `Activar ${KADESH_URIM_AI_NAME}`
          : "Probar conexión"}
        <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
      </button>
    ) : (
      <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
        Pide al administrador de la empresa que la active.
      </p>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-violet-500/[0.07] to-transparent dark:from-violet-500/[0.12]"
      />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {status === "loading" ? (
            <span className="block h-6 w-24 animate-pulse rounded-full bg-[#ececec] dark:bg-[#2a2a2a]" />
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-2.5 py-0.5 text-xs font-medium text-[#212121] dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white">
              <span
                className={cn("size-2 rounded-full", STATUS_META[status].dot)}
              />
              {STATUS_META[status].label}
            </span>
          )}
          <h3 className="mt-2 text-lg font-semibold text-[#212121] dark:text-white">
            Así te ayuda {KADESH_URIM_AI_NAME}
          </h3>
          <p className="mt-0.5 max-w-xl text-sm text-[#616161] dark:text-[#b0b0b0]">
            Aprende de tu negocio, revisa tu pipeline cada día y te dice qué
            hacer primero para cerrar más ventas.
          </p>
        </div>
        {cta}
      </div>

      <motion.ol
        className="relative mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3"
        variants={aiStaggerContainer(reduce, 0.04)}
        initial="hidden"
        animate="show"
      >
        <FlowStep
          index={1}
          icon={UserEdit01Icon}
          title="Conoce tu negocio"
          description="Qué vendes, a quién, a qué precio y cómo cierras."
        >
          {knowledge.loading ? (
            <span className="block h-2 w-full animate-pulse rounded-full bg-[#ececec] dark:bg-[#2a2a2a]" />
          ) : (
            <>
              <AiMeter
                value={knowledge.percent}
                label="Qué tanto conoce tu negocio"
              />
              <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                <span className="font-semibold text-[#212121] dark:text-white">
                  {knowledge.percent}%
                </span>{" "}
                · {knowledge.answered} de {totalQuestions} respuestas
              </p>
              {!profileDone ? (
                <button
                  type="button"
                  onClick={() =>
                    onOpenCompanyInfo(knowledge.firstIncompleteKey ?? undefined)
                  }
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400"
                >
                  Completar perfil
                  <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                </button>
              ) : null}
            </>
          )}
        </FlowStep>

        <FlowStep
          index={2}
          icon={Radar01Icon}
          title="Revisa tu pipeline"
          description="Seguimientos, cotizaciones, primeros contactos y leads fríos."
        >
          {pipeline.loading ? (
            <span className="block h-7 w-16 animate-pulse rounded-md bg-[#ececec] dark:bg-[#2a2a2a]" />
          ) : pipeline.error ? null : (
            <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
              <span className="text-xl font-semibold text-[#212121] dark:text-white">
                {pipeline.total.toLocaleString("es-MX")}
              </span>{" "}
              pendientes hoy
            </p>
          )}
        </FlowStep>

        <FlowStep
          index={3}
          icon={SparklesIcon}
          title="Te dice qué hacer"
          description="3 pasos para hoy y consejos para tu industria."
          isLast
        >
          {status === "live" ? (
            digest.insight ? (
              <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                Pasos de hoy listos
              </p>
            ) : (
              <p className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
                Pasos de hoy por generar
              </p>
            )
          ) : status === "loading" ? null : (
            <p className="text-xs font-medium text-[#9e9e9e] dark:text-[#7a7a7a]">
              Se desbloquea al activarla
            </p>
          )}
        </FlowStep>
      </motion.ol>
    </section>
  );
}

function FlowStep({
  index,
  icon,
  title,
  description,
  isLast = false,
  children,
}: {
  index: number;
  icon: typeof SparklesIcon;
  title: string;
  description: string;
  isLast?: boolean;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.li
      className="relative"
      variants={aiFadeUpVariants(reduce)}
      transition={aiMotionTransition(reduce)}
    >
      <div className="flex h-full flex-col rounded-xl border border-[#ececec] bg-[#fafafa]/90 p-3 dark:border-[#2e2e2e] dark:bg-[#252525]/90">
        <div className="flex items-center gap-2">
          <span className="ai-urim-fill flex size-7 shrink-0 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={icon} size={15} />
          </span>
          <span className="text-[11px] font-semibold text-violet-700 dark:text-violet-300">
            Paso {index}
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold text-[#212121] dark:text-white">
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-snug text-[#616161] dark:text-[#b0b0b0]">
          {description}
        </p>
        <div className="mt-auto pt-3">{children}</div>
      </div>
      {!isLast ? (
        <span
          aria-hidden
          className="absolute -right-[13px] top-1/2 z-[1] hidden size-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#9e9e9e] dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-[#7a7a7a] sm:flex"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
        </span>
      ) : null}
    </motion.li>
  );
}
