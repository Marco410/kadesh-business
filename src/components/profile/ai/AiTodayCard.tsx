"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  LockIcon,
  RefreshIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import { KADESH_URIM_AI_NAME, formatAiDateInline } from "./constants";
import {
  AI_ACTION_KINDS,
  AI_SIGNAL_KIND,
  type AiActionKind,
} from "./actionKinds";
import type { AiActionLink } from "./useAiActionLinks";
import { useDailyDigest } from "./useDailyDigest";
import {
  useAiPipelineSignals,
  type AiPipelineSignal,
} from "./useAiPipelineSignals";
import { AiStepTimeline } from "./AiActionList";
import { AiThinking } from "./AiVisuals";
import {
  aiFadeUpVariants,
  aiMotionTransition,
  aiStaggerContainer,
} from "./motion";

type AiTodayCardProps = {
  companyId: string;
  canManageAi: boolean;
  isCompanyWide: boolean;
  remainingQuota?: number | null;
  onGenerated?: () => void;
  onConfigure?: () => void;
  linkFor?: (kind: AiActionKind) => AiActionLink | null;
};

const DIGEST_STEPS = [
  "Revisando seguimientos vencidos",
  "Revisando cotizaciones sin respuesta",
  "Buscando clientes sin primer contacto",
  "Detectando leads fríos",
  "Eligiendo tus 3 pasos de hoy",
] as const;

const countFormat = new Intl.NumberFormat("es-MX", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Resumen del día en la tab de Kadesh AI: qué revisa del pipeline (conteos
 * reales del CRM) y los 3 pasos que propone para hoy.
 */
export function AiTodayCard({
  companyId,
  canManageAi,
  isCompanyWide,
  remainingQuota,
  onGenerated,
  onConfigure,
  linkFor,
}: AiTodayCardProps) {
  const digest = useDailyDigest({ companyId, remainingQuota, onGenerated });
  const pipeline = useAiPipelineSignals(companyId, isCompanyWide);
  const title = isCompanyWide ? "Resumen del día" : "Tu resumen del día";

  return (
    <section className="rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="ai-urim-icon">
              <HugeiconsIcon icon={SparklesIcon} size={20} />
            </span>
            <h3 className="text-base font-semibold text-[#212121] dark:text-white">
              {title}
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#9e9e9e] dark:text-[#7a7a7a]">
            {digest.insight?.generatedAt
              ? `Generado ${formatAiDateInline(digest.insight.generatedAt)}`
              : isCompanyWide
                ? "Pipeline de la empresa"
                : "Tus clientes asignados"}
          </p>
        </div>
        {digest.isAiLive && digest.insight ? (
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

      {pipeline.error ? null : (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[#212121] dark:text-white">
            Lo que revisa en tu pipeline
            {!pipeline.loading ? (
              <span className="font-normal text-[#616161] dark:text-[#b0b0b0]">
                {" "}
                · {pipeline.total.toLocaleString("es-MX")} pendientes
              </span>
            ) : null}
          </p>
          <SignalTiles
            signals={pipeline.signals}
            loading={pipeline.loading}
            linkFor={linkFor}
          />
        </div>
      )}

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-[#212121] dark:text-white">
          Tus 3 pasos para hoy
        </p>
        {digest.liveLoading && !digest.configured ? (
          <StepsSkeleton />
        ) : !digest.isAiLive ? (
          <LockedSteps
            configured={digest.configured}
            canManageAi={canManageAi}
            onConfigure={onConfigure}
          />
        ) : digest.generating ? (
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
          <StepsSkeleton />
        ) : digest.actions.length > 0 ? (
          <AiStepTimeline items={digest.actions} linkFor={linkFor} />
        ) : (
          <div className="rounded-xl border border-dashed border-violet-300 bg-violet-50/60 p-4 dark:border-violet-500/40 dark:bg-violet-500/10">
            <p className="text-sm font-medium text-[#212121] dark:text-white">
              {KADESH_URIM_AI_NAME} todavía no arma tus pasos de hoy.
            </p>
            <p className="mt-0.5 text-sm text-[#616161] dark:text-[#b0b0b0]">
              Revisa los pendientes de arriba y te dice a quién contactar, qué
              cotización empujar y qué seguimiento no puede esperar.
            </p>
            <p className="mt-2 text-xs text-[#9e9e9e] dark:text-[#7a7a7a]">
              {digest.creditHint}
            </p>
            <button
              type="button"
              onClick={() => void digest.generate(false)}
              className="ai-urim-fill mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
            >
              <HugeiconsIcon icon={SparklesIcon} size={16} />
              Generar mis 3 pasos de hoy
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Un número por señal, en el orden en que el resumen las prioriza. La primera
 * con pendientes se resalta: es por donde empieza Kadesh AI.
 */
function SignalTiles({
  signals,
  loading,
  linkFor,
}: {
  signals: AiPipelineSignal[];
  loading: boolean;
  linkFor?: (kind: AiActionKind) => AiActionLink | null;
}) {
  const reduce = useReducedMotion();

  if (loading) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[7.5rem] animate-pulse rounded-xl bg-[#ececec] dark:bg-[#2a2a2a]"
          />
        ))}
      </div>
    );
  }

  const focusKey = signals.find((signal) => signal.count > 0)?.key ?? null;

  return (
    <>
      <motion.ul
        className="mt-2 grid grid-cols-2 gap-2 xl:grid-cols-4"
        variants={aiStaggerContainer(reduce, 0)}
        initial="hidden"
        animate="show"
      >
        {signals.map((signal) => {
          const kind = AI_SIGNAL_KIND[signal.key];
          const meta = AI_ACTION_KINDS[kind];
          const link = signal.count > 0 ? (linkFor?.(kind) ?? null) : null;
          const focus = signal.key === focusKey;
          const tileClass = cn(
            "flex h-full flex-col rounded-xl border p-3 text-left transition-colors",
            focus
              ? "border-violet-300 bg-violet-50/70 dark:border-violet-500/50 dark:bg-violet-500/10"
              : "border-[#ececec] bg-[#fafafa] dark:border-[#2e2e2e] dark:bg-[#252525]",
            link?.href &&
              "hover:border-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:border-violet-400/60",
          );
          const body = (
            <>
              <span className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg",
                    focus
                      ? "ai-urim-fill"
                      : "bg-[#efefef] text-[#616161] dark:bg-[#2e2e2e] dark:text-[#b0b0b0]",
                  )}
                >
                  <HugeiconsIcon icon={meta.icon} size={15} />
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    focus
                      ? "text-violet-700 dark:text-violet-300"
                      : "text-[#9e9e9e] dark:text-[#7a7a7a]",
                  )}
                >
                  {focus ? "Empieza aquí" : `Prioridad ${signal.priority}`}
                </span>
              </span>
              <span className="mt-2 text-2xl font-semibold leading-none text-[#212121] dark:text-white">
                {countFormat.format(signal.count)}
              </span>
              <span className="mt-1 text-sm font-medium leading-tight text-[#212121] dark:text-white">
                {signal.label}
              </span>
              <span className="mt-0.5 text-xs leading-snug text-[#9e9e9e] dark:text-[#7a7a7a]">
                {signal.hint}
              </span>
            </>
          );

          return (
            <motion.li
              key={signal.key}
              variants={aiFadeUpVariants(reduce)}
              transition={aiMotionTransition(reduce)}
            >
              {link?.href ? (
                <Link
                  href={link.href}
                  className={tileClass}
                  aria-label={`${signal.count} ${signal.label}. ${link.label}`}
                >
                  {body}
                </Link>
              ) : (
                <div className={tileClass}>{body}</div>
              )}
            </motion.li>
          );
        })}
      </motion.ul>
      {focusKey === null ? (
        <p className="mt-2 text-xs text-[#616161] dark:text-[#b0b0b0]">
          Tu pipeline está al día. {KADESH_URIM_AI_NAME} te propondrá
          prospectar con tu oferta.
        </p>
      ) : null}
    </>
  );
}

function StepsSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex gap-3">
          <span className="size-8 shrink-0 animate-pulse rounded-full bg-[#ececec] dark:bg-[#2a2a2a]" />
          <span className="h-20 flex-1 animate-pulse rounded-xl bg-[#ececec] dark:bg-[#2a2a2a]" />
        </div>
      ))}
    </div>
  );
}

/** Vista previa bloqueada: deja ver la forma de los 3 pasos y qué falta para tenerlos. */
function LockedSteps({
  configured,
  canManageAi,
  onConfigure,
}: {
  configured: boolean;
  canManageAi: boolean;
  onConfigure?: () => void;
}) {
  return (
    <div className="relative">
      <div aria-hidden className="space-y-3 opacity-60 blur-[1.5px]">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ececec] text-sm font-semibold text-[#9e9e9e] dark:bg-[#2a2a2a] dark:text-[#7a7a7a]">
              {item + 1}
            </span>
            <span className="flex-1 space-y-2 rounded-xl border border-[#ececec] bg-[#fafafa] p-3 dark:border-[#2e2e2e] dark:bg-[#252525]">
              <span className="block h-3 w-24 rounded-full bg-[#e6e6e6] dark:bg-[#333]" />
              <span className="block h-3 w-3/4 rounded-full bg-[#e6e6e6] dark:bg-[#333]" />
              <span className="block h-3 w-1/2 rounded-full bg-[#ececec] dark:bg-[#2e2e2e]" />
            </span>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="max-w-sm rounded-xl border border-[#e0e0e0] bg-white p-4 text-center shadow-lg dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
          <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            <HugeiconsIcon icon={LockIcon} size={18} />
          </span>
          <p className="mt-2 text-sm font-semibold text-[#212121] dark:text-white">
            {configured
              ? "Prueba la conexión para ver tus pasos"
              : `Activa ${KADESH_URIM_AI_NAME} para ver tus pasos`}
          </p>
          <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Cada día te dice a quién contactar, qué cotización empujar y qué
            seguimiento no puede esperar.
          </p>
          {canManageAi && onConfigure ? (
            <button
              type="button"
              onClick={onConfigure}
              className="ai-urim-fill mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium"
            >
              {configured ? "Probar conexión" : `Activar ${KADESH_URIM_AI_NAME}`}
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
          ) : !canManageAi ? (
            <p className="mt-2 text-xs text-[#9e9e9e] dark:text-[#7a7a7a]">
              Pide al administrador de la empresa que la active.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
