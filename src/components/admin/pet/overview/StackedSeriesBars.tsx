"use client";

import { barGrowDelay } from "kadesh/components/panel/dashboard/motion";
import { cn } from "kadesh/utils/cn";
import type { AdminPetSeriesPoint } from "./queries";
import type { PetGranularity } from "./constants";

/** Con más barras que esto no cabe una etiqueta en cada una: solo se ponen las fechas de los extremos. */
const MAX_LABELED_BARS = 14;

const SINGLE_BAR_CLASS = "bg-orange-500/85 dark:bg-orange-400/80";
const EMPTY_BAR_CLASS = "bg-[#e8e8e8] dark:bg-[#2a2a2a]";

function ymdToDate(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

const SHORT_DAY = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "UTC" });
const SHORT_MONTH = new Intl.DateTimeFormat("es-MX", { month: "short", year: "2-digit", timeZone: "UTC" });
const LONG_DAY = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const LONG_MONTH = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" });

/** Etiqueta corta bajo la barra: "3 nov" (día y semana) o "nov 26" (mes). */
export function bucketShortLabel(bucket: string, granularity: PetGranularity): string {
  const date = ymdToDate(bucket);
  return granularity === "month" ? SHORT_MONTH.format(date) : SHORT_DAY.format(date);
}

/** Etiqueta completa para el tooltip: "3 nov 2026", "semana del 3 nov 2026" o "noviembre de 2026". */
export function bucketLongLabel(bucket: string, granularity: PetGranularity): string {
  const date = ymdToDate(bucket);
  if (granularity === "month") return LONG_MONTH.format(date);
  if (granularity === "week") return `semana del ${LONG_DAY.format(date)}`;
  return LONG_DAY.format(date);
}

/** Inicio del rango en texto: "desde el 3 nov 2026" o "desde noviembre de 2026". */
export function bucketSinceLabel(bucket: string, granularity: PetGranularity): string {
  const date = ymdToDate(bucket);
  return granularity === "month" ? `desde ${LONG_MONTH.format(date)}` : `desde el ${LONG_DAY.format(date)}`;
}

export type SeriesSegmentStyle = {
  /** Orden de abajo hacia arriba; los segmentos que no estén van al final. */
  order: string[];
  label: (key: string) => string;
  barClass: (key: string) => string;
};

/**
 * Barras verticales por periodo, apiladas por segmento cuando hay desglose. Hechas con divs, como el
 * resto de Operaciones (no hay librería de gráficas: el worker de Cloudflare tiene tope de tamaño).
 * La barra del periodo en curso va más clara porque todavía no termina.
 */
export default function StackedSeriesBars({
  points,
  granularity,
  currentBucket,
  unitLabel,
  ariaLabel,
  segments,
}: {
  points: AdminPetSeriesPoint[];
  granularity: PetGranularity;
  /** Inicio del periodo de hoy (`to` de la serie). */
  currentBucket: string;
  unitLabel: string;
  ariaLabel: string;
  segments?: SeriesSegmentStyle | null;
}) {
  if (points.length === 0) return null;
  const max = Math.max(1, ...points.map((point) => point.total));
  const labeled = points.length <= MAX_LABELED_BARS;
  const rank = (key: string) => {
    const index = segments?.order.indexOf(key) ?? -1;
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };

  // Leyenda: solo los segmentos que aparecen en el rango, con su total.
  const legendTotals = new Map<string, number>();
  if (segments) {
    for (const point of points) {
      for (const segment of point.segments) {
        legendTotals.set(segment.key, (legendTotals.get(segment.key) ?? 0) + segment.count);
      }
    }
  }
  const legend = Array.from(legendTotals, ([key, count]) => ({ key, count }))
    .filter((item) => item.count > 0)
    .sort((a, b) => rank(a.key) - rank(b.key));

  return (
    <div>
      <div
        role="img"
        aria-label={ariaLabel}
        className={cn("flex h-40 items-end", labeled ? "gap-1.5" : "gap-px sm:gap-0.5")}
      >
        {points.map((point, index) => {
          const isCurrent = point.bucket === currentBucket;
          const height = point.total > 0 ? Math.max((point.total / max) * 100, 4) : 2;
          const stack = segments
            ? [...point.segments].filter((s) => s.count > 0).sort((a, b) => rank(a.key) - rank(b.key))
            : [];
          const detail = stack.length
            ? ` (${stack.map((s) => `${segments?.label(s.key) ?? s.key}: ${s.count.toLocaleString("es-MX")}`).join(", ")})`
            : "";
          const title = `${bucketLongLabel(point.bucket, granularity)}${isCurrent ? " (en curso)" : ""}: ${point.total.toLocaleString("es-MX")} ${unitLabel}${detail}`;
          return (
            <div key={point.bucket} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex min-h-0 w-full flex-1 items-end overflow-hidden">
                <div
                  title={title}
                  className={cn(
                    "flex w-full flex-col-reverse overflow-hidden dashboard-bar-grow-y",
                    labeled ? "rounded-t-md" : "rounded-t-sm",
                    point.total === 0 ? EMPTY_BAR_CLASS : stack.length === 0 ? SINGLE_BAR_CLASS : null,
                    isCurrent && point.total > 0 ? "opacity-55" : null,
                  )}
                  style={{ height: `${height}%`, animationDelay: barGrowDelay(index, false) }}
                >
                  {stack.map((segment) => (
                    <div
                      key={segment.key}
                      className={cn("w-full shrink-0", segments?.barClass(segment.key))}
                      style={{ height: `${(segment.count / point.total) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
              {labeled ? (
                <span className="w-full truncate text-center text-xs leading-tight text-[#616161] dark:text-[#b0b0b0]">
                  {bucketShortLabel(point.bucket, granularity)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {!labeled ? (
        <div className="mt-1.5 flex justify-between text-xs text-[#9e9e9e]">
          <span>{bucketShortLabel(points[0].bucket, granularity)}</span>
          <span>{bucketShortLabel(points[points.length - 1].bucket, granularity)}</span>
        </div>
      ) : null}

      {legend.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Leyenda">
          {legend.map((item) => (
            <li key={item.key} className="flex items-center gap-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
              <span className={cn("size-2.5 shrink-0 rounded-full", segments?.barClass(item.key))} aria-hidden />
              {segments?.label(item.key) ?? item.key}
              <span className="tabular-nums text-[#9e9e9e]">{item.count.toLocaleString("es-MX")}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
