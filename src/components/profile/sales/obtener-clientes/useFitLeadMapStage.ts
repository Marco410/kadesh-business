"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * El mapa empieza debajo del menú y de las pestañas.
 * Su altura es lo que queda de la ventana, para que el panel de categorías no se salga.
 */
export function useFitLeadMapStage(onFit?: () => void) {
  const stageRef = useRef<HTMLElement | null>(null);
  const onFitRef = useRef(onFit);
  onFitRef.current = onFit;

  const fit = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const top = stage.getBoundingClientRect().top + window.scrollY;
    const height = Math.max(0, Math.round(window.innerHeight - top));
    const next = `${height}px`;
    if (stage.style.height === next) return;
    stage.style.height = next;
    onFitRef.current?.();
  }, []);

  useEffect(() => {
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(document.documentElement);
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [fit]);

  return useCallback(
    (node: HTMLDivElement | null) => {
      stageRef.current = node;
      if (node) fit();
    },
    [fit],
  );
}
