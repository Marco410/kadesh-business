"use client";

import { useEffect, useRef } from "react";

/**
 * Para `skipPollAttempt` de Apollo: con la pestaña oculta no se sondea. Una pestaña olvidada en
 * segundo plano pedía sin parar y mantenía despiertos al backend y a su base aunque nadie la viera.
 */
export function skipPollWhenHidden(): boolean {
  return typeof document !== "undefined" && document.hidden;
}

/**
 * Llama a `onVisible` cuando la pestaña vuelve a verse. Acompaña a `skipPollWhenHidden`: lo que
 * no se pidió mientras estaba oculta se pide al volver, sin esperar al siguiente ciclo.
 * `minHiddenMs`: solo si estuvo oculta al menos ese tiempo (cambiar de pestaña un momento no cuenta).
 */
export function useOnPageVisible(
  onVisible: () => void,
  { enabled = true, minHiddenMs = 0 }: { enabled?: boolean; minHiddenMs?: number } = {},
) {
  const callbackRef = useRef(onVisible);
  useEffect(() => {
    callbackRef.current = onVisible;
  }, [onVisible]);

  useEffect(() => {
    if (!enabled) return;
    let hiddenAt: number | null = document.hidden ? Date.now() : null;
    const onChange = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        return;
      }
      const hiddenFor = hiddenAt == null ? 0 : Date.now() - hiddenAt;
      hiddenAt = null;
      if (hiddenFor >= minHiddenMs) callbackRef.current();
    };
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, [enabled, minHiddenMs]);
}
