"use client";

import { useEffect, useState } from "react";
import { cn } from "kadesh/utils/cn";
import {
  FONT_SCALE_DEFAULT,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STEP,
  persistFontScale,
  readStoredFontScale,
} from "./font-scale";

type FontSizeSliderProps = {
  /** Nav over a dark/orange field vs. light bar. */
  tone: "onDark" | "onLight";
  className?: string;
};

/**
 * Controla `--kadesh-font-scale` en html (rem de toda la app). Persiste en localStorage.
 */
export default function FontSizeSlider({
  tone,
  className,
}: FontSizeSliderProps) {
  const [scale, setScale] = useState(FONT_SCALE_DEFAULT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredFontScale();
    setScale(stored);
    persistFontScale(stored);
    setMounted(true);
  }, []);

  const onDark = tone === "onDark";
  const percent = Math.round(scale * 100);

  return (
    <div
      className={cn(
        "flex h-8 shrink-0 items-center gap-1.5",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "text-[10px] font-semibold leading-none",
          onDark ? "text-white/80" : "text-gray-700",
        )}
      >
        A
      </span>
      <input
        type="range"
        min={FONT_SCALE_MIN}
        max={FONT_SCALE_MAX}
        step={FONT_SCALE_STEP}
        value={mounted ? scale : FONT_SCALE_DEFAULT}
        disabled={!mounted}
        onChange={(e) => {
          const next = Number(e.target.value);
          setScale(next);
          persistFontScale(next);
        }}
        aria-label="Tamaño de fuente"
        aria-valuemin={Math.round(FONT_SCALE_MIN * 100)}
        aria-valuemax={Math.round(FONT_SCALE_MAX * 100)}
        aria-valuenow={percent}
        aria-valuetext={`${percent} por ciento`}
        className={cn(
          "font-scale-slider h-1 w-20 cursor-pointer appearance-none rounded-full disabled:opacity-60",
          onDark
            ? "bg-white/25 accent-white"
            : "bg-gray-300 accent-orange-500",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "text-sm font-semibold leading-none",
          onDark ? "text-white" : "text-gray-800",
        )}
      >
        A
      </span>
    </div>
  );
}
