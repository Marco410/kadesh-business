"use client";

import { cn } from "kadesh/utils/cn";
import { PIPELINE_BAR_COLORS } from "./constants";
import type { NamedCount, PipelineBar, WeeklyBar } from "./aggregate";

export function PipelineBars({ bars }: { bars: PipelineBar[] }) {
  const max = Math.max(...bars.map((bar) => bar.count), 1);
  const total = bars.reduce((sum, bar) => sum + bar.count, 0);

  if (bars.length === 0) {
    return (
      <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
        Aún no hay clientes en el pipeline. Extrae o da de alta leads para ver
        la distribución.
      </p>
    );
  }

  return (
    <ul className="space-y-2" aria-label="Clientes por etapa del pipeline">
      {bars.map((bar) => {
        const width = Math.max((bar.count / max) * 100, 2);
        const color = PIPELINE_BAR_COLORS[bar.status] ?? "#737373";
        const share = total > 0 ? Math.round((bar.count / total) * 100) : 0;
        return (
          <li
            key={bar.status}
            className="grid grid-cols-[9rem_1fr_2.25rem] gap-2.5 items-center"
          >
            <span className="truncate text-sm font-medium text-[#212121] dark:text-white">
              {bar.label}
            </span>
            <div className="h-3 rounded-full bg-[#f0f0f0] dark:bg-[#2a2a2a] overflow-hidden">
              <div
                className="h-full rounded-full dashboard-bar-grow"
                style={{ width: `${width}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-right text-sm tabular-nums text-[#616161] dark:text-[#b0b0b0]">
              {bar.count}
              <span className="sr-only"> ({share}%)</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function WeeklyBars({ bars }: { bars: WeeklyBar[] }) {
  const max = Math.max(...bars.map((bar) => bar.count), 1);
  const hasData = bars.some((bar) => bar.count > 0);

  return (
    <div
      className="flex items-end gap-1.5 h-32"
      role="img"
      aria-label="Clientes nuevos por semana"
    >
      {bars.map((bar) => {
        const height = hasData
          ? Math.max((bar.count / max) * 100, bar.count > 0 ? 8 : 2)
          : 2;
        return (
          <div
            key={bar.weekStart}
            className="flex-1 flex flex-col items-center gap-1.5 min-w-0 h-full"
          >
            <div className="flex-1 w-full flex items-end">
              <div
                className={cn(
                  "w-full rounded-t-md dashboard-bar-grow-y",
                  bar.count > 0
                    ? "bg-orange-500/85 dark:bg-orange-400/80"
                    : "bg-[#e8e8e8] dark:bg-[#2a2a2a]",
                )}
                style={{ height: `${height}%` }}
                title={`${bar.label}: ${bar.count}`}
              />
            </div>
            <span className="text-xs leading-tight text-[#616161] dark:text-[#b0b0b0] truncate w-full text-center">
              {bar.label}
            </span>
            <span className="sr-only">
              {bar.count} clientes la semana del {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ShareBars({
  items,
  emptyLabel,
}: {
  items: NamedCount[];
  emptyLabel: string;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);
  if (items.length === 0) {
    return (
      <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">{emptyLabel}</p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.key}>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="text-sm text-[#212121] dark:text-white truncate">
              {item.label}
            </span>
            <span className="text-sm tabular-nums text-[#616161] dark:text-[#b0b0b0]">
              {item.count}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#f0f0f0] dark:bg-[#2a2a2a] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#212121] dark:bg-white/80"
              style={{ width: `${Math.max((item.count / max) * 100, 4)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
