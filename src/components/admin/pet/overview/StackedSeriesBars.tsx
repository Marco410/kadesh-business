"use client";

import { ColumnBars, type ColumnPoint } from "kadesh/components/app-shell";
import { cn } from "kadesh/utils/cn";
import type { AdminPetSeriesPoint } from "./queries";
import type { PetGranularity } from "./constants";


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
 * Barras por periodo, apiladas por segmento cuando hay desglose. Usa `ColumnBars` del shell:
 * barras tipo píldora, la del pico en naranja con su cifra y la del periodo en curso rayada.
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
  const rank = (key: string) => {
    const index = segments?.order.indexOf(key) ?? -1;
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };

  const columns: ColumnPoint[] = points.map((point) => {
    const isCurrent = point.bucket === currentBucket;
    const stack = segments
      ? [...point.segments].filter((s) => s.count > 0).sort((a, b) => rank(a.key) - rank(b.key))
      : [];
    const detail = stack.length
      ? ` (${stack.map((s) => `${segments?.label(s.key) ?? s.key}: ${s.count.toLocaleString("es-MX")}`).join(", ")})`
      : "";
    return {
      key: point.bucket,
      label: bucketShortLabel(point.bucket, granularity),
      value: point.total,
      current: isCurrent,
      title: `${bucketLongLabel(point.bucket, granularity)}${isCurrent ? " (en curso)" : ""}: ${point.total.toLocaleString("es-MX")} ${unitLabel}${detail}`,
      segments: stack.length
        ? stack.map((s) => ({ key: s.key, value: s.count, className: segments?.barClass(s.key) ?? "" }))
        : undefined,
    };
  });

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
      <ColumnBars points={columns} ariaLabel={ariaLabel} unitLabel={unitLabel} />
      {legend.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Leyenda">
          {legend.map((item) => (
            <li key={item.key} className="flex items-center gap-1.5 text-[13px] text-dash-muted">
              <span className={cn("size-2.5 shrink-0 rounded-full", segments?.barClass(item.key))} aria-hidden />
              {segments?.label(item.key) ?? item.key}
              <span className="font-semibold tabular-nums text-dash-ink">{item.count.toLocaleString("es-MX")}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
