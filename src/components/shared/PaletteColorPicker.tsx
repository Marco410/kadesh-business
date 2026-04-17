"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export const PALETTE_COLOR_PRESETS = [
  "#9333ea",
  "#2563eb",
  "#0ea5e9",
  "#14b8a6",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#d946ef",
  "#c4a574",
  "#9ca3af",
] as const;

function normalizeHex(raw: string): string {
  let s = raw.trim();
  if (!s.startsWith("#")) s = `#${s}`;
  if (/^#([0-9a-fA-F]{3})$/.test(s)) {
    const [, short] = s.match(/^#([0-9a-fA-F]{3})$/) ?? [];
    if (short && short.length === 3) {
      const [r, g, b] = short.split("");
      s = `#${r}${r}${g}${g}${b}${b}`;
    }
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(s)) return "#6b7280";
  return s.toLowerCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = normalizeHex(hex).slice(1);
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (x: number) =>
    Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d > 1e-6) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  const hueDeg = (((h % 1) + 1) % 1) * 360;
  return {
    h: hueDeg,
    s: max === 0 ? 0 : d / max,
    v: max,
  };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const hh = ((((h % 360) + 360) % 360) / 60) % 6;
  const c = v * s;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hh < 1) [r1, g1, b1] = [c, x, 0];
  else if (hh < 2) [r1, g1, b1] = [x, c, 0];
  else if (hh < 3) [r1, g1, b1] = [0, c, x];
  else if (hh < 4) [r1, g1, b1] = [0, x, c];
  else if (hh < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m = v - c;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsv(r, g, b);
}

function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

function isValidHex6Input(raw: string): boolean {
  const t = raw.trim();
  const withHash = t.startsWith("#") ? t : `#${t}`;
  return /^#[0-9a-fA-F]{6}$/.test(withHash);
}

export interface PaletteColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  label?: string;
  ariaLabel?: string;
  className?: string;
}

type PanelView = "palette" | "advanced";

export default function PaletteColorPicker({
  value,
  onChange,
  disabled = false,
  label,
  ariaLabel = "Elegir color",
  className = "",
}: PaletteColorPickerProps) {
  const effectiveLabel = label === "" ? null : label ?? "Color";
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PanelView>("palette");
  const [h, setH] = useState(0);
  const [s, setS] = useState(1);
  const [v, setV] = useState(1);
  const [hexDraft, setHexDraft] = useState("");
  const svDragging = useRef(false);
  const hRef = useRef(0);
  hRef.current = h;

  const safeHex = normalizeHex(value);

  const syncAdvancedFromHex = useCallback((hex: string) => {
    const { h: nh, s: ns, v: nv } = hexToHsv(hex);
    setH(nh);
    setS(ns);
    setV(nv);
    setHexDraft(normalizeHex(hex));
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPanelPos(null);
      return;
    }
    function updatePosition() {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const panelW = 260;
      let left = r.left;
      const top = r.bottom + 8;
      if (left + panelW > window.innerWidth - 8) left = window.innerWidth - panelW - 8;
      if (left < 8) left = 8;
      setPanelPos({ top, left });
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, view]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (portalRef.current?.contains(t)) return;
      setOpen(false);
      setView("palette");
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setView("palette");
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openPanel() {
    if (disabled) return;
    setView("palette");
    setOpen(true);
  }

  function pickPreset(hex: string) {
    onChange(normalizeHex(hex));
    setOpen(false);
    setView("palette");
  }

  function openAdvanced() {
    syncAdvancedFromHex(safeHex);
    setView("advanced");
  }

  function updateSvFromClient(clientX: number, clientY: number) {
    const el = svRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setS(x);
    setV(1 - y);
    setHexDraft(hsvToHex(hRef.current, x, 1 - y));
  }

  const advancedPreview = hsvToHex(h, s, v);

  function saveAdvanced() {
    const next = isValidHex6Input(hexDraft) ? normalizeHex(hexDraft) : advancedPreview;
    onChange(next);
    setOpen(false);
    setView("palette");
  }

  const panelClass =
    "w-[min(100vw-2rem,260px)] max-h-[min(70vh,520px)] overflow-y-auto rounded-2xl border border-[#e0e0e0] bg-[#f4f4f5] p-3 shadow-xl dark:border-[#3a3a3a] dark:bg-[#2a2a2a]";

  const panelContent = open && panelPos && (
    <div
      ref={portalRef}
      className={panelClass}
      style={{
        position: "fixed",
        top: panelPos.top,
        left: panelPos.left,
        zIndex: 200,
      }}
      role="dialog"
      aria-label={effectiveLabel ?? ariaLabel}
    >
      {view === "palette" ? (
        <>
          <p className="mb-2 text-xs font-medium text-[#616161] dark:text-[#9e9e9e]">
            {effectiveLabel ?? "Color"}
          </p>
          <div className="grid grid-cols-7 gap-2">
            {PALETTE_COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => pickPreset(c)}
                className="size-8 rounded-full border border-[#d4d4d4] shadow-sm transition hover:scale-105 hover:ring-2 hover:ring-orange-400 dark:border-[#525252]"
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
            <button
              type="button"
              onClick={openAdvanced}
              className="flex size-8 items-center justify-center rounded-full border border-dashed border-[#a3a3a3] bg-white text-[#525252] hover:border-orange-400 hover:text-orange-600 dark:border-[#737373] dark:bg-[#1e1e1e] dark:text-[#d4d4d4]"
              aria-label="Más colores"
            >
              <HugeiconsIcon icon={Add01Icon} size={18} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("palette")}
              className="inline-flex size-9 items-center justify-center rounded-lg text-[#616161] hover:bg-black/5 dark:text-[#d4d4d4] dark:hover:bg-white/10"
              aria-label="Volver a la paleta"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
            </button>
            <span className="text-sm font-semibold text-[#212121] dark:text-white">
              Color personalizado
            </span>
          </div>

          <div
            ref={svRef}
            className="relative mb-3 h-36 w-full cursor-crosshair touch-none overflow-hidden rounded-xl border border-[#e0e0e0] dark:border-[#404040]"
            style={{
              background: `
                    linear-gradient(to top, #000, transparent),
                    linear-gradient(to right, #fff, hsl(${Math.round(h)} 100% 50%))
                  `,
            }}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              svDragging.current = true;
              (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              updateSvFromClient(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (!svDragging.current) return;
              updateSvFromClient(e.clientX, e.clientY);
            }}
            onPointerUp={(e) => {
              svDragging.current = false;
              try {
                (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
              } catch {
                /* ignore */
              }
            }}
            onPointerCancel={() => {
              svDragging.current = false;
            }}
          >
            <span
              className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
              style={{
                left: `${s * 100}%`,
                top: `${(1 - v) * 100}%`,
                backgroundColor: advancedPreview,
              }}
              aria-hidden
            />
          </div>

          <div className="mb-3 flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={359}
              step={1}
              value={Math.round(((h % 360) + 360) % 360)}
              onChange={(e) => {
                const nh = Number(e.target.value);
                setH(nh);
                setHexDraft(hsvToHex(nh, s, v));
              }}
              className="h-3 min-w-0 flex-1 cursor-pointer accent-orange-500"
              style={{
                background:
                  "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)",
              }}
              aria-label="Matiz"
            />
            <span
              className="size-8 shrink-0 rounded-full border border-[#e0e0e0] dark:border-[#525252]"
              style={{ backgroundColor: advancedPreview }}
              aria-hidden
            />
          </div>

          <div className="mb-4 flex items-center gap-2">
            <span className="shrink-0 rounded-lg border border-[#e0e0e0] bg-white px-2 py-1 text-xs font-medium text-[#616161] dark:border-[#525252] dark:bg-[#1e1e1e] dark:text-[#b0b0b0]">
              HEX
            </span>
            <input
              value={hexDraft}
              onChange={(e) => setHexDraft(e.target.value)}
              spellCheck={false}
              className="min-w-0 flex-1 rounded-lg border border-[#e0e0e0] bg-white px-2 py-1.5 font-mono text-sm text-[#212121] focus:ring-2 focus:ring-orange-500 dark:border-[#525252] dark:bg-[#1e1e1e] dark:text-white"
              aria-label="Código hexadecimal"
            />
          </div>

          <button
            type="button"
            onClick={saveAdvanced}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Guardar
          </button>
        </>
      )}
    </div>
  );

  return (
    <div ref={rootRef} className={`relative inline-flex flex-col ${className}`}>
      {effectiveLabel ? (
        <span
          id={`${uid}-label`}
          className="mb-1.5 block text-sm font-medium text-[#616161] dark:text-[#b0b0b0]"
        >
          {effectiveLabel}
        </span>
      ) : null}
      <div ref={anchorRef} className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={openPanel}
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-labelledby={effectiveLabel ? `${uid}-label` : undefined}
          className="size-10 shrink-0 rounded-full border-2 border-[#e0e0e0] shadow-inner ring-2 ring-white/30 transition hover:ring-orange-400/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#404040] dark:ring-black/20"
          style={{ backgroundColor: safeHex }}
        />
        <span className="text-xs font-mono text-[#616161] dark:text-[#9e9e9e]">{safeHex}</span>
      </div>

      {typeof document !== "undefined" && panelContent
        ? createPortal(panelContent, document.body)
        : null}
    </div>
  );
}
