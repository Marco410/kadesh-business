"use client";

import type { ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { cn } from "kadesh/utils/cn";
import { AdminErrorState, AdminSectionCard } from "../../ui";
import type { PetGranularity, PetRangeOption } from "./constants";
import { ADMIN_PET_SERIES_QUERY, type AdminPetSeriesResponse } from "./queries";
import StackedSeriesBars, { bucketSinceLabel, type SeriesSegmentStyle } from "./StackedSeriesBars";

const PERIOD_WORD: Record<PetGranularity, string> = {
  day: "día",
  week: "semana",
  month: "mes",
};

/**
 * Tarjeta con una serie de `adminPetSeries`. Cada tarjeta pide su propia serie, así que cambiar el
 * desglose o la métrica de una no recarga las demás. Mientras carga deja la serie anterior a
 * media opacidad en vez de parpadear.
 */
export default function PetSeriesCard({
  title,
  help,
  metric,
  breakdown = "none",
  placeType = null,
  range,
  granularity,
  unitLabel,
  controls,
  segments,
}: {
  title: string;
  help: ReactNode;
  metric: string;
  breakdown?: string;
  placeType?: string | null;
  range: PetRangeOption;
  granularity: PetGranularity;
  unitLabel: string;
  /** Chips o selects propios de la tarjeta (desglose, métrica, tipo de lugar). */
  controls?: ReactNode;
  segments?: SeriesSegmentStyle | null;
}) {
  const { data, previousData, loading, error } = useQuery<AdminPetSeriesResponse>(ADMIN_PET_SERIES_QUERY, {
    variables: {
      input: { metric, granularity, range: range.api, breakdown, placeType },
    },
    fetchPolicy: "cache-and-network",
  });
  const series = data?.adminPetSeries ?? previousData?.adminPetSeries;
  const periods = series?.points.length ?? 0;
  const average = series && periods ? series.total / periods : 0;

  return (
    <AdminSectionCard title={title} help={help}>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {series ? (
          <p className="text-sm text-dash-muted">
            <span className="text-xl font-semibold tabular-nums text-dash-ink">
              {series.total.toLocaleString("es-MX")}
            </span>{" "}
            {unitLabel} {bucketSinceLabel(series.from, series.granularity)}
            <span className="hidden sm:inline"> · </span>
            <span className="block text-xs text-dash-faint sm:inline">
              {average.toLocaleString("es-MX", { maximumFractionDigits: 1 })} por {PERIOD_WORD[series.granularity]} en promedio
            </span>
          </p>
        ) : (
          <span className="h-7 w-40 dash-shimmer rounded" />
        )}
        {controls ? <div className="flex flex-col gap-2 sm:flex-row sm:items-center">{controls}</div> : null}
      </div>

      {error && !series ? (
        <AdminErrorState message={error.message} />
      ) : !series ? (
        <div className="h-40 dash-shimmer rounded-xl" />
      ) : (
        <div className={cn("transition-opacity", loading ? "opacity-50" : null)} aria-busy={loading}>
          <StackedSeriesBars
            points={series.points}
            granularity={series.granularity}
            currentBucket={series.to}
            unitLabel={unitLabel}
            ariaLabel={`${title}: ${series.total} ${unitLabel} en ${periods} periodos`}
            segments={series.breakdown !== "none" ? segments : null}
          />
        </div>
      )}
    </AdminSectionCard>
  );
}
