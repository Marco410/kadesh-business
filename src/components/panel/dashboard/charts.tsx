"use client";

import { ColumnBars, HBarList } from "kadesh/components/app-shell";
import { PIPELINE_BAR_COLORS } from "./constants";
import type { NamedCount, PipelineBar, WeeklyBar } from "./aggregate";
import { barGrowDelay } from "./motion";

export function PipelineBars({ bars }: { bars: PipelineBar[] }) {
  const max = Math.max(...bars.map((bar) => bar.count), 1);
  const total = bars.reduce((sum, bar) => sum + bar.count, 0);

  if (bars.length === 0) {
    return (
      <p className="text-sm text-dash-muted">
        Aún no hay clientes en el pipeline. Extrae o da de alta leads para ver
        la distribución.
      </p>
    );
  }

  return (
    <ul className="space-y-2" aria-label="Clientes por etapa del pipeline">
      {bars.map((bar, index) => {
        const width = Math.max((bar.count / max) * 100, 2);
        const color = PIPELINE_BAR_COLORS[bar.status] ?? "#737373";
        const share = total > 0 ? Math.round((bar.count / total) * 100) : 0;
        return (
          <li
            key={bar.status}
            className="grid grid-cols-[9rem_1fr_2.25rem] gap-2.5 items-center"
          >
            <span className="truncate text-sm font-medium text-dash-ink">
              {bar.label}
            </span>
            <div className="h-3 rounded-full bg-dash-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full dashboard-bar-grow"
                style={{
                  width: `${width}%`,
                  backgroundColor: color,
                  animationDelay: barGrowDelay(index, false),
                }}
              />
            </div>
            <span className="text-right text-sm tabular-nums text-dash-muted">
              {bar.count}
              <span className="sr-only"> ({share}%)</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Barras por semana (la última es la semana en curso, rayada). Usa `ColumnBars` del shell. */
export function WeeklyBars({
  bars,
  ariaLabel = "Clientes nuevos por semana",
  unitLabel = "clientes",
}: {
  bars: WeeklyBar[];
  ariaLabel?: string;
  unitLabel?: string;
}) {
  return (
    <ColumnBars
      points={bars.map((bar, index) => ({
        key: bar.weekStart,
        label: bar.label,
        value: bar.count,
        current: index === bars.length - 1,
        title: `Semana del ${bar.label}: ${bar.count} ${unitLabel}`,
      }))}
      ariaLabel={ariaLabel}
      unitLabel={unitLabel}
      heightClass="h-40"
    />
  );
}

/** Ranking horizontal en naranja. Usa `HBarList` del shell. */
export function ShareBars({
  items,
  emptyLabel,
}: {
  items: NamedCount[];
  emptyLabel: string;
}) {
  return <HBarList items={items} emptyLabel={emptyLabel} />;
}
