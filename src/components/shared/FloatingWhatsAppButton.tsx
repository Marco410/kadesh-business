"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Message01Icon } from "@hugeicons/core-free-icons";
import {
  buildSupportWhatsAppUrl,
  PANEL_SUPPORT_PROMPTS,
  PANEL_SUPPORT_WHATSAPP_MESSAGE,
} from "kadesh/constants/support";
import { cn } from "kadesh/utils/cn";

const LANDING_WHATSAPP_MESSAGE =
  "Hola KADESH, tengo una duda sobre la plataforma y me gustaría recibir ayuda.";

const FIRST_PROMPT_MS = 12_000;
const PROMPT_VISIBLE_MS = 10_000;
const PROMPT_GAP_MS = 60_000;

const ENTER_EASE: [number, number, number, number] = [0.2, 0, 0, 1];
const EXIT_EASE: [number, number, number, number] = [0.3, 0, 1, 1];

export type FloatingWhatsAppButtonProps = {
  className?: string;
  message?: string;
  /** Globos periódicos de soporte (panel autenticado). */
  showPrompts?: boolean;
};

export default function FloatingWhatsAppButton({
  className,
  message,
  showPrompts = false,
}: FloatingWhatsAppButtonProps) {
  const reduceMotion = useReducedMotion();
  const [promptIndex, setPromptIndex] = useState(0);
  const [promptVisible, setPromptVisible] = useState(false);
  const indexRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  const revealPrompt = () => {
    setPromptIndex(indexRef.current);
    setPromptVisible(true);
    schedule(() => {
      setPromptVisible(false);
      indexRef.current = (indexRef.current + 1) % PANEL_SUPPORT_PROMPTS.length;
      schedule(revealPrompt, PROMPT_GAP_MS);
    }, PROMPT_VISIBLE_MS);
  };

  const dismissPrompt = () => {
    setPromptVisible(false);
    clearTimers();
    indexRef.current = (indexRef.current + 1) % PANEL_SUPPORT_PROMPTS.length;
    schedule(revealPrompt, PROMPT_GAP_MS);
  };

  useEffect(() => {
    if (!showPrompts) return;
    schedule(revealPrompt, FIRST_PROMPT_MS);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cycle once on mount
  }, [showPrompts]);

  const prompt = PANEL_SUPPORT_PROMPTS[promptIndex];
  const defaultMessage =
    message ??
    (showPrompts ? PANEL_SUPPORT_WHATSAPP_MESSAGE : LANDING_WHATSAPP_MESSAGE);
  const activeMessage =
    showPrompts && promptVisible ? prompt.message : defaultMessage;
  const href = buildSupportWhatsAppUrl(activeMessage);

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6",
        className,
      )}
    >
      <AnimatePresence>
        {showPrompts && promptVisible ? (
          <motion.div
            key={prompt.id}
            role="status"
            initial={
              reduceMotion ? { opacity: 1 } : { opacity: 0, x: 14, scale: 0.96 }
            }
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    x: 10,
                    scale: 0.98,
                    transition: { duration: 0.18, ease: EXIT_EASE },
                  }
            }
            transition={{
              duration: reduceMotion ? 0.12 : 0.28,
              ease: ENTER_EASE,
            }}
            className="absolute bottom-16 right-0 w-[min(18.5rem,calc(100vw-2.5rem))] sm:bottom-4 sm:right-16"
          >
            <div className="relative rounded-2xl border border-[#e0e0e0] bg-white p-3.5 pr-9 shadow-[0_8px_28px_rgba(0,0,0,0.14)] dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
              <a
                href={buildSupportWhatsAppUrl(prompt.message)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm leading-relaxed text-[#212121] hover:text-[#128C7E] dark:text-white dark:hover:text-[#25D366]"
              >
                {prompt.teaser}
              </a>
              <button
                type="button"
                onClick={dismissPrompt}
                className="absolute right-1.5 top-1.5 rounded-md p-1 text-[#9e9e9e] transition-colors hover:bg-[#f5f5f5] hover:text-[#212121] dark:hover:bg-[#2a2a2a] dark:hover:text-white"
                aria-label="Cerrar mensaje de soporte"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp si tienes dudas"
        className="group relative flex items-center"
      >
        {!showPrompts ? (
          <span
            className="pointer-events-none absolute right-full mr-3 hidden rounded-full bg-[#212121] px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block dark:bg-white dark:text-[#212121]"
            aria-hidden
          >
            ¿Dudas?
          </span>
        ) : null}

        <span
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_rgba(37,211,102,0.45)] ring-1 ring-white/20 transition-colors duration-200 group-hover:bg-[#1ebe57] group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-[#25D366] group-focus-visible:ring-offset-2 dark:group-focus-visible:ring-offset-[#0d0d0d]",
            showPrompts && !reduceMotion && "whatsapp-fab-pulse",
          )}
        >
          <HugeiconsIcon
            icon={Message01Icon}
            size={26}
            className="shrink-0"
            aria-hidden
          />
        </span>
      </a>
    </div>
  );
}
