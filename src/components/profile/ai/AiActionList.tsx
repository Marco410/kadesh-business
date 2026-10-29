"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { AI_ACTION_KINDS, classifyAiAction, type AiActionKind } from "./actionKinds";
import type { AiActionLink } from "./useAiActionLinks";
import { ExpandableCopy } from "./ExpandableCopy";
import { AiActionLinkButton, AiKindChip } from "./AiVisuals";
import {
  aiFadeUpVariants,
  aiMotionTransition,
  aiStaggerContainer,
} from "./motion";

export type AiActionItem = {
  title: string;
  detail: string;
};

type LinkFor = (kind: AiActionKind) => AiActionLink | null;

/**
 * Pasos en orden (resumen del día): número, tipo, qué hacer y a dónde ir.
 */
export function AiStepTimeline({
  items,
  linkFor,
}: {
  items: AiActionItem[];
  linkFor?: LinkFor;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.ol
      variants={aiStaggerContainer(reduce, 0.03)}
      initial="hidden"
      animate="show"
    >
      {items.map((item, index) => {
        const kind = classifyAiAction(item.title, item.detail);
        const link = linkFor?.(kind) ?? null;
        const isLast = index === items.length - 1;

        return (
          <motion.li
            key={`${item.title}-${index}`}
            className="relative flex gap-3 pb-3 last:pb-0"
            variants={aiFadeUpVariants(reduce)}
            transition={aiMotionTransition(reduce)}
          >
            {!isLast ? (
              <span
                aria-hidden
                className="absolute bottom-0 left-[15px] top-9 w-px bg-[#e0e0e0] dark:bg-[#3a3a3a]"
              />
            ) : null}
            <span className="ai-urim-fill relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-sm">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-[#ececec] bg-[#fafafa] p-3 dark:border-[#2e2e2e] dark:bg-[#252525]">
              <AiKindChip kind={kind} />
              <p className="mt-1.5 font-semibold leading-snug text-[#212121] dark:text-white">
                {item.title}
              </p>
              <div className="mt-1">
                <ExpandableCopy text={item.detail} />
              </div>
              {link ? (
                <AiActionLinkButton link={link} className="mt-2" />
              ) : null}
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}

/**
 * Consejos sin orden (recomendaciones): tarjetas en rejilla, cada una con su tipo.
 */
export function AiTipGrid({
  items,
  linkFor,
}: {
  items: AiActionItem[];
  linkFor?: LinkFor;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.ul
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      variants={aiStaggerContainer(reduce, 0.03)}
      initial="hidden"
      animate="show"
    >
      {items.map((item, index) => {
        const kind = classifyAiAction(item.title, item.detail);
        const meta = AI_ACTION_KINDS[kind];
        const link = linkFor?.(kind) ?? null;

        return (
          <motion.li
            key={`${item.title}-${index}`}
            className="flex h-full flex-col rounded-xl border border-[#ececec] bg-[#fafafa] p-3.5 dark:border-[#2e2e2e] dark:bg-[#252525]"
            variants={aiFadeUpVariants(reduce)}
            transition={aiMotionTransition(reduce)}
          >
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                <HugeiconsIcon icon={meta.icon} size={16} />
              </span>
              <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                {meta.label}
              </span>
            </div>
            <p className="mt-2 font-semibold leading-snug text-[#212121] dark:text-white">
              {item.title}
            </p>
            <div className="mt-1">
              <ExpandableCopy text={item.detail} lines={3} />
            </div>
            {link ? (
              <div className="mt-auto pt-2">
                <AiActionLinkButton link={link} />
              </div>
            ) : null}
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
