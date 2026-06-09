"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlayIcon,
  PauseIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { DEMO_STEPS, type CursorPosition } from "./demo-steps";
import DemoCursor from "./DemoCursor";

const CURSOR_MOVE_MS = 900;
const CLICK_DELAY_MS = 200;

function lerpCursor(from: CursorPosition, to: CursorPosition, t: number): CursorPosition {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}

export default function DemoPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-80px" });
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursorPos, setCursorPos] = useState<CursorPosition>({ x: 88, y: 75 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [clicking, setClicking] = useState(false);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const stepIndexRef = useRef(0);
  const hasStartedRef = useRef(false);

  const currentStep = DEMO_STEPS[stepIndex];

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const runStepAnimation = useCallback(
    (index: number, fromOverride?: CursorPosition) => {
      setClicking(false);
      const step = DEMO_STEPS[index];

      if (!step.cursor) {
        setCursorVisible(false);
        return;
      }

      const from = fromOverride ?? step.cursor.from ?? { x: 88, y: 75 };
      const to = step.cursor.to;

      setCursorVisible(true);
      setCursorPos(from);

      const start = performance.now();

      const animateCursor = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / CURSOR_MOVE_MS, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setCursorPos(lerpCursor(from, to, eased));

        if (t < 1) {
          rafRef.current = requestAnimationFrame(animateCursor);
        } else {
          rafRef.current = null;
          if (step.cursor?.clickAtEnd) {
            schedule(() => {
              setClicking(true);
              schedule(() => setClicking(false), 400);
            }, CLICK_DELAY_MS);
          }
        }
      };

      rafRef.current = requestAnimationFrame(animateCursor);
    },
    [schedule],
  );

  const advancePlayback = useCallback(() => {
    if (!isPlayingRef.current) return;

    const next = stepIndexRef.current + 1;

    if (next >= DEMO_STEPS.length) {
      schedule(() => {
        stepIndexRef.current = 0;
        setStepIndex(0);
        runStepAnimation(0);
        schedule(advancePlayback, DEMO_STEPS[0].duration);
      }, 1400);
      return;
    }

    stepIndexRef.current = next;
    setStepIndex(next);
    runStepAnimation(next);
    schedule(advancePlayback, DEMO_STEPS[next].duration);
  }, [runStepAnimation, schedule]);

  const startPlayback = useCallback(
    (fromIndex = stepIndexRef.current) => {
      clearTimers();
      isPlayingRef.current = true;
      setIsPlaying(true);
      stepIndexRef.current = fromIndex;
      setStepIndex(fromIndex);
      runStepAnimation(fromIndex);
      schedule(advancePlayback, DEMO_STEPS[fromIndex].duration);
    },
    [advancePlayback, clearTimers, runStepAnimation, schedule],
  );

  const stopPlayback = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    clearTimers();
  }, [clearTimers]);

  const goToStep = useCallback(
    (index: number, autoplay: boolean) => {
      clearTimers();
      const normalized =
        ((index % DEMO_STEPS.length) + DEMO_STEPS.length) % DEMO_STEPS.length;
      stepIndexRef.current = normalized;
      setStepIndex(normalized);
      runStepAnimation(normalized);

      if (autoplay) {
        startPlayback(normalized);
      } else {
        stopPlayback();
      }
    },
    [clearTimers, runStepAnimation, startPlayback, stopPlayback],
  );

  useEffect(() => {
    if (isInView) {
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        startPlayback(0);
      }
      return;
    }

    hasStartedRef.current = false;
    stopPlayback();
  }, [isInView, startPlayback, stopPlayback]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleReplay = () => startPlayback(0);

  const handlePrev = () => goToStep(stepIndexRef.current - 1, false);

  const handleNext = () => goToStep(stepIndexRef.current + 1, false);

  const togglePlay = () => {
    if (isPlayingRef.current) {
      stopPlayback();
    } else {
      startPlayback(stepIndexRef.current);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-6 lg:gap-8 items-start">
        <div className="relative rounded-2xl overflow-hidden border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#1a1a1a] shadow-xl">
          <div className="relative aspect-[16/10] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <Image
                  src={currentStep.image}
                  alt={currentStep.title}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 720px"
                  priority={stepIndex === 0}
                />
              </motion.div>
            </AnimatePresence>

            <DemoCursor
              x={cursorPos.x}
              y={cursorPos.y}
              visible={cursorVisible}
              clicking={clicking}
            />

            <div className="absolute bottom-3 left-3 z-20 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Paso {stepIndex + 1} de {DEMO_STEPS.length}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] px-4 py-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#616161] dark:text-[#b0b0b0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
                aria-label="Paso anterior"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                aria-label={isPlaying ? "Pausar demo" : "Reproducir demo"}
              >
                <HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} size={18} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#616161] dark:text-[#b0b0b0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
                aria-label="Paso siguiente"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#616161] dark:text-[#b0b0b0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <HugeiconsIcon icon={RefreshIcon} size={14} />
              Reiniciar
            </button>
          </div>
        </div>

        <ol className="space-y-2 lg:sticky lg:top-28">
          {DEMO_STEPS.map((step, i) => {
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => goToStep(i, false)}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                    isActive
                      ? "border-orange-500 bg-orange-500/10 dark:bg-orange-500/15 shadow-sm"
                      : isDone
                        ? "border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] opacity-80"
                        : "border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] hover:border-orange-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : isDone
                            ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                            : "bg-[#f0f0f0] dark:bg-[#2a2a2a] text-[#616161] dark:text-[#b0b0b0]"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          isActive
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-[#212121] dark:text-white"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
