"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  CircleIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import { AI_ACTION_KINDS, type AiActionKind } from "./actionKinds";
import { PILLAR_POINTS, type PillarState } from "./companyKnowledge";
import type { AiActionLink } from "./useAiActionLinks";
import { AI_MOTION_EASE } from "./motion";

/** Avance contra un tope (0–100). Riel del mismo tono que el relleno. */
export function AiMeter({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-violet-100 dark:bg-violet-500/20",
        className,
      )}
    >
      <motion.div
        className="ai-urim-fill h-full rounded-full"
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={
          reduce ? { duration: 0 } : { duration: 0.6, ease: AI_MOTION_EASE }
        }
      />
    </div>
  );
}

/** Puntos cubiertos de una pregunta (uno por segmento). */
export function AiSegmentMeter({
  covered,
  total = PILLAR_POINTS,
}: {
  covered: number;
  total?: number;
}) {
  return (
    <span
      role="img"
      aria-label={`${covered} de ${total} puntos cubiertos`}
      className="flex shrink-0 gap-0.5"
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 w-4 rounded-full",
            index < covered
              ? "bg-violet-500 dark:bg-violet-400"
              : "bg-violet-100 dark:bg-violet-500/20",
          )}
        />
      ))}
    </span>
  );
}

export const PILLAR_STATE_META: Record<
  PillarState,
  { label: string; icon: typeof CircleIcon; className: string }
> = {
  complete: {
    label: "Completo",
    icon: CheckmarkCircle02Icon,
    className: "text-emerald-600 dark:text-emerald-400",
  },
  partial: {
    label: "Falta afinar",
    icon: AlertCircleIcon,
    className: "text-amber-600 dark:text-amber-400",
  },
  empty: {
    label: "Sin responder",
    icon: CircleIcon,
    className: "text-[#9e9e9e] dark:text-[#7a7a7a]",
  },
};

export function PillarStateIcon({
  state,
  size = 18,
}: {
  state: PillarState;
  size?: number;
}) {
  const meta = PILLAR_STATE_META[state];
  return (
    <span className={cn("inline-flex shrink-0", meta.className)}>
      <HugeiconsIcon icon={meta.icon} size={size} />
      <span className="sr-only">{meta.label}</span>
    </span>
  );
}

export function AiKindChip({ kind }: { kind: AiActionKind }) {
  const meta = AI_ACTION_KINDS[kind];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
      <HugeiconsIcon icon={meta.icon} size={12} />
      {meta.label}
    </span>
  );
}

const LINK_CLASS =
  "inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline dark:text-orange-400";

export function AiActionLinkButton({
  link,
  className,
}: {
  link: AiActionLink;
  className?: string;
}) {
  const content = (
    <>
      {link.label}
      <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
    </>
  );
  if (link.href) {
    return (
      <Link href={link.href} className={cn(LINK_CLASS, className)}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={link.onClick}
      className={cn(LINK_CLASS, className)}
    >
      {content}
    </button>
  );
}

/**
 * Lo que hace la IA mientras genera, paso por paso. Avanza con el tiempo y se
 * queda en el último paso hasta que llega la respuesta.
 */
export function AiThinking({
  title,
  steps,
  intervalMs = 1100,
}: {
  title: string;
  steps: readonly string[];
  intervalMs?: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => Math.min(current + 1, steps.length - 1));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, steps.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-500/25 dark:bg-violet-500/10"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-[#212121] dark:text-white">
        <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {steps.map((step, index) => {
          const done = index < active;
          const current = index === active;
          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-2.5 text-sm transition-colors",
                done
                  ? "text-[#616161] dark:text-[#b0b0b0]"
                  : current
                    ? "font-medium text-[#212121] dark:text-white"
                    : "text-[#9e9e9e] dark:text-[#7a7a7a]",
              )}
            >
              {done ? (
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={16}
                  className="shrink-0 text-emerald-600 dark:text-emerald-400"
                />
              ) : current ? (
                <span className="size-4 shrink-0 rounded-full border-2 border-violet-500 animate-pulse" />
              ) : (
                <span className="size-4 shrink-0 rounded-full border-2 border-[#d6d6d6] dark:border-[#4a4a4a]" />
              )}
              {step}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
