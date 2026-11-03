"use client";

import { motion } from "framer-motion";
import { cn } from "kadesh/utils/cn";
import { DASH_EASE, cssStaggerDelay } from "./motion";

/*
 * Gráficas de los paneles, hechas con divs y SVG (sin librería: el worker de Cloudflare tiene
 * tope de 10 MB). Cada una repite sus datos en una tabla oculta para lectores de pantalla.
 */

const fmt = (value: number) => value.toLocaleString("es-MX");

/** Línea con área para tarjetas KPI. `onDark` para la tarjeta oscura. */
export function Sparkline({
  series,
  tone = "accent",
  className,
}: {
  series: number[];
  tone?: "accent" | "onDark";
  className?: string;
}) {
  if (series.length < 2) return null;
  const width = 120;
  const height = 36;
  const max = Math.max(1, ...series);
  const points = series.map((value, index) => [
    (index / (series.length - 1)) * width,
    height - 3 - (value / max) * (height - 6),
  ]);
  const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-9 w-full overflow-visible", className)}
      aria-hidden
    >
      <path d={area} className={tone === "onDark" ? "fill-orange-300/15" : "fill-orange-500/12"} />
      <motion.path
        d={line}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: DASH_EASE, delay: 0.15 }}
        className={cn("fill-none", tone === "onDark" ? "stroke-orange-300" : "stroke-orange-500")}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export type ColumnSegment = { key: string; value: number; className: string; label?: string };

export type ColumnPoint = {
  key: string;
  /** Etiqueta corta bajo la barra ("3 nov"). */
  label: string;
  value: number;
  /** Texto completo del tooltip; si falta se arma con label + valor. */
  title?: string;
  /** Periodo en curso: barra rayada (todavía no termina). */
  current?: boolean;
  /** Desglose apilado (de abajo hacia arriba). */
  segments?: ColumnSegment[];
};

/** Con más barras que esto no cabe una etiqueta ni un valor en cada una. */
const MAX_LABELED = 14;

/**
 * Columnas tipo píldora. Las barras completas van en gris cálido, la del valor más alto en
 * naranja con su cifra en una burbuja y la del periodo en curso rayada. Con desglose, cada
 * barra se apila con los colores de `segments`.
 */
export function ColumnBars({
  points,
  ariaLabel,
  unitLabel,
  heightClass = "h-48",
  formatValue = fmt,
}: {
  points: ColumnPoint[];
  ariaLabel: string;
  unitLabel: string;
  heightClass?: string;
  formatValue?: (value: number) => string;
}) {
  if (points.length === 0) return null;
  const max = Math.max(1, ...points.map((point) => point.value));
  const peakIndex = points.reduce(
    (best, point, index) => (point.value > (points[best]?.value ?? -1) ? index : best),
    0,
  );
  const labeled = points.length <= MAX_LABELED;
  const hasData = points.some((point) => point.value > 0);

  return (
    <div>
      <div
        aria-hidden
        className={cn(
          "grid grid-flow-col items-end [grid-auto-columns:minmax(0,1fr)]",
          labeled ? "gap-1.5 sm:gap-2.5" : "gap-px sm:gap-[3px]",
          heightClass,
        )}
      >
        {points.map((point, index) => {
          const isPeak = hasData && index === peakIndex && point.value > 0;
          const pct = point.value > 0 ? Math.max((point.value / max) * 100, 5) : 2;
          const segments = point.segments?.filter((segment) => segment.value > 0) ?? [];
          const title =
            point.title ?? `${point.label}${point.current ? " (en curso)" : ""}: ${formatValue(point.value)} ${unitLabel}`;
          return (
            <div key={point.key} className="grid h-full min-w-0 grid-rows-[auto_1fr_auto] items-end gap-1.5">
              <span
                className={cn(
                  "truncate text-center text-[11px] font-semibold tabular-nums",
                  labeled && point.value > 0 ? "text-dash-muted" : "invisible",
                  isPeak && "visible",
                )}
              >
                {isPeak ? (
                  <span className="inline-block rounded-full bg-dash-ink px-1.5 py-0.5 text-[11px] text-dash-on-ink">
                    {formatValue(point.value)}
                  </span>
                ) : (
                  formatValue(point.value)
                )}
              </span>
              <div className="flex h-full min-h-0 items-end">
                <div
                  title={title}
                  className={cn(
                    "dashboard-bar-grow-y flex w-full flex-col-reverse overflow-hidden transition-[filter] hover:brightness-95 dark:hover:brightness-110",
                    labeled ? "rounded-[10px]" : "rounded-t-[3px]",
                    segments.length === 0 &&
                      (point.value === 0
                        ? "bg-dash-surface-2"
                        : point.current
                          ? "dash-hatch border border-orange-300 bg-orange-50 text-orange-300 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-500/40"
                          : isPeak
                            ? "dash-grad-accent"
                            : "bg-dash-surface-3"),
                    segments.length > 0 && point.current && "opacity-60",
                  )}
                  style={{ height: `${pct}%`, animationDelay: cssStaggerDelay(index) }}
                >
                  {segments.map((segment) => (
                    <div
                      key={segment.key}
                      className={cn("w-full shrink-0", segment.className)}
                      style={{ height: `${(segment.value / point.value) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
              <span
                className={cn(
                  "truncate text-center text-[11px] leading-tight text-dash-muted",
                  labeled ? null : "hidden",
                )}
              >
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
      {!labeled ? (
        <div aria-hidden className="mt-1.5 flex justify-between text-[11px] text-dash-muted">
          <span>{points[0].label}</span>
          <span>{points[points.length - 1].label}</span>
        </div>
      ) : null}
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <tbody>
          {points.map((point) => (
            <tr key={point.key}>
              <th scope="row">{point.label}</th>
              <td>
                {formatValue(point.value)} {unitLabel}
                {point.current ? " (en curso)" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type HBarItem = { key: string; label: string; count: number; barClass?: string };

/** Ranking horizontal (por tipo, por estado…). Barras naranja por defecto. */
export function HBarList({
  items,
  emptyLabel,
  formatValue = fmt,
}: {
  items: HBarItem[];
  emptyLabel: string;
  formatValue?: (value: number) => string;
}) {
  if (items.length === 0) return <p className="text-sm text-dash-muted">{emptyLabel}</p>;
  const max = Math.max(1, ...items.map((item) => item.count));
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={item.key}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-dash-ink">{item.label}</span>
            <span className="text-sm font-semibold tabular-nums text-dash-soft">{formatValue(item.count)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-dash-surface-2">
            <div
              className={cn("dashboard-bar-grow h-full rounded-full", item.barClass ?? "dash-grad-accent")}
              style={{
                width: `${Math.max((item.count / max) * 100, 3)}%`,
                animationDelay: cssStaggerDelay(index),
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
