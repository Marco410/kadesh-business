"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  CheckmarkCircle02Icon,
  Key01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import {
  AI_PROVIDER,
  AI_PROVIDER_KEY_GUIDES,
  type AiProviderKey,
} from "./constants";
import {
  aiFadeUpVariants,
  aiMotionTransition,
  aiStaggerContainer,
} from "./motion";

const PROVIDER_ORDER: AiProviderKey[] = [
  AI_PROVIDER.ANTHROPIC,
  AI_PROVIDER.OPENAI,
  AI_PROVIDER.GEMINI,
];

type ByokApiKeyGuideProps = {
  provider: string;
  onSelectProvider: (provider: AiProviderKey) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Cómo sacar la API key de Claude, OpenAI o Gemini. Solo se muestra en BYOK.
 */
export function ByokApiKeyGuide({
  provider,
  onSelectProvider,
  disabled = false,
  className,
}: ByokApiKeyGuideProps) {
  const reduce = useReducedMotion();
  const fadeUp = aiFadeUpVariants(reduce);

  return (
    <div
      className={cn(
        "h-fit w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-5 sm:p-6 dark:border-[#3a3a3a] dark:bg-[#252525]",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#8b5cf6] shadow-sm dark:bg-[#1e1e1e]">
          <HugeiconsIcon icon={Key01Icon} size={16} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-[#212121] dark:text-white">
            Cómo conseguir tu API key
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
            Crea una key en la consola del proveedor, elige ese proveedor a la
            izquierda y pégala. En esta modalidad Kadesh no descuenta créditos.
          </p>
        </div>
      </div>

      <motion.ul
        className="mt-4 grid grid-cols-1 gap-3"
        variants={aiStaggerContainer(reduce, 0.04)}
        initial="hidden"
        animate="show"
      >
        {PROVIDER_ORDER.map((key) => {
          const guide = AI_PROVIDER_KEY_GUIDES[key];
          const selected = provider === key;
          return (
            <motion.li
              key={key}
              variants={fadeUp}
              transition={aiMotionTransition(reduce)}
              className={cn(
                "relative rounded-xl border bg-white p-4 dark:bg-[#1e1e1e]",
                selected
                  ? "border-[var(--ai-urim-purple)] shadow-[0_6px_14px_rgba(139,92,246,0.18)]"
                  : "border-[#ececec] hover:border-orange-300 dark:border-[#3a3a3a] dark:hover:border-orange-500/50",
              )}
            >
              <button
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-label={
                  selected ? `${guide.name}, elegido` : `Elegir ${guide.name}`
                }
                onClick={() => onSelectProvider(key)}
                className="absolute inset-0 cursor-pointer rounded-xl disabled:cursor-not-allowed"
              />
              <div className="pointer-events-none relative z-[1]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#212121] dark:text-white">
                    {guide.name}
                  </p>
                  {selected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ai-urim-purple)]">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                      Elegido
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                      Elegir
                    </span>
                  )}
                </div>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                  {guide.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
              <a
                href={guide.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-[2] mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                {guide.consoleLabel}
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
              </a>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
