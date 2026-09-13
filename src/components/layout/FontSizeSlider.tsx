"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "kadesh/utils/cn";
import {
  FONT_SCALE_DEFAULT,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STEP,
  persistFontScale,
  readStoredFontScale,
} from "./font-scale";

const PANEL_WIDTH_PX = 252;

type FontSizeSliderProps = {
  /** Nav over a dark/orange field vs. light bar. */
  tone: "onDark" | "onLight";
  className?: string;
};

/**
 * Control de tamaño de texto. El slider vive en un panel fijo en px (portal)
 * para que el nav no se mueva bajo el cursor al cambiar el rem de html.
 */
export default function FontSizeSlider({
  tone,
  className,
}: FontSizeSliderProps) {
  const [scale, setScale] = useState(FONT_SCALE_DEFAULT);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = readStoredFontScale();
    setScale(stored);
    persistFontScale(stored);
    setMounted(true);
  }, []);

  const placePanel = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.max(
      8,
      Math.min(rect.right - PANEL_WIDTH_PX, window.innerWidth - PANEL_WIDTH_PX - 8),
    );
    const top = Math.min(rect.bottom + 8, window.innerHeight - 140);
    setCoords({ top, left });
  };

  const toggleOpen = () => {
    if (open) {
      setOpen(false);
      return;
    }
    placePanel();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onViewportChange = () => setOpen(false);

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onViewportChange, true);
    window.addEventListener("resize", onViewportChange);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onViewportChange, true);
      window.removeEventListener("resize", onViewportChange);
    };
  }, [open]);

  const onDark = tone === "onDark";
  const percent = Math.round(scale * 100);

  const panel =
    mounted &&
    open &&
    createPortal(
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Tamaño de fuente"
        className="rounded-xl border border-[#e0e0e0] bg-white shadow-2xl dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          width: PANEL_WIDTH_PX,
          zIndex: 80,
          padding: 16,
          fontSize: 14,
        }}
      >
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="font-semibold text-[#212121] dark:text-white">
            Tamaño de texto
          </p>
          <p className="tabular-nums text-[#616161] dark:text-[#b0b0b0]">
            {percent}%
          </p>
        </div>
        <div className="flex items-center" style={{ gap: 10 }}>
          <span
            aria-hidden
            className="font-semibold text-[#616161] dark:text-[#b0b0b0]"
            style={{ fontSize: 11, lineHeight: 1 }}
          >
            A
          </span>
          <input
            type="range"
            min={FONT_SCALE_MIN}
            max={FONT_SCALE_MAX}
            step={FONT_SCALE_STEP}
            value={scale}
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
            className="font-scale-slider cursor-pointer appearance-none rounded-full bg-[#d4d4d4] accent-orange-500 dark:bg-[#525252] dark:accent-white"
            style={{
              width: 176,
              height: 6,
              touchAction: "none",
            }}
          />
          <span
            aria-hidden
            className="font-semibold text-[#212121] dark:text-white"
            style={{ fontSize: 18, lineHeight: 1 }}
          >
            A
          </span>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        disabled={!mounted}
        aria-label="Tamaño de fuente"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg font-semibold leading-none transition-colors disabled:opacity-60",
          onDark
            ? "text-white hover:bg-white/10"
            : "text-gray-800 hover:bg-gray-100",
          className,
        )}
        style={{ width: 36, height: 36, fontSize: 13 }}
      >
        <span aria-hidden className="flex items-end gap-px">
          <span style={{ fontSize: 11 }}>A</span>
          <span style={{ fontSize: 16 }}>A</span>
        </span>
      </button>
      {panel}
    </>
  );
}
