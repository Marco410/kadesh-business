import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDownRight01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import {
  HEALTH_LEVEL_CLASSES,
  HEALTH_LEVEL_LABELS,
  HEALTH_SIGNAL_LABELS,
  HEALTH_TREND_LABELS,
} from "../constants";
import type { AdminHealthFlag } from "./analytics-queries";

const NEUTRAL = "bg-black/5 text-[#616161] dark:bg-white/10 dark:text-[#b0b0b0]";

/** Salud de 0 a 100 con el color de su nivel (sana, por observar, en riesgo). */
export function HealthBadge({
  score,
  label,
  showLabel = false,
  className,
}: {
  score: number;
  label: string;
  showLabel?: boolean;
  className?: string;
}) {
  const levelLabel = HEALTH_LEVEL_LABELS[label] ?? label;
  return (
    <span
      title={`Salud ${score} de 100 · ${levelLabel}`}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        HEALTH_LEVEL_CLASSES[label] ?? NEUTRAL,
        className,
      )}
    >
      <span className="sr-only">Salud</span>
      {score}
      {showLabel ? <span className="font-medium">· {levelLabel}</span> : null}
    </span>
  );
}

/** Subiendo / bajando contra las 2 semanas anteriores. */
export function HealthTrend({ trend, changePct }: { trend: string; changePct: number | null }) {
  const icon = trend === "up" ? ArrowUpRight01Icon : trend === "down" ? ArrowDownRight01Icon : null;
  const tone =
    trend === "up"
      ? "text-emerald-700 dark:text-emerald-400"
      : trend === "down"
        ? "text-red-700 dark:text-red-400"
        : "text-[#616161] dark:text-[#b0b0b0]";
  return (
    <span className={cn("inline-flex items-center gap-0.5 whitespace-nowrap text-xs font-medium", tone)}>
      {icon ? <HugeiconsIcon icon={icon} size={14} aria-hidden /> : null}
      {HEALTH_TREND_LABELS[trend] ?? trend}
      {changePct != null && trend !== "stable" ? ` ${changePct > 0 ? "+" : ""}${changePct}%` : ""}
    </span>
  );
}

/** Riesgo de baja (rojo) y oportunidad de venta (verde), con el motivo. */
export function HealthSignals({
  flags,
  compact = false,
}: {
  flags: AdminHealthFlag[];
  compact?: boolean;
}) {
  if (flags.length === 0) return null;
  // Spans (no lista): también se pinta dentro de tarjetas que son botones.
  return (
    <span className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <span
          key={`${flag.key}-${flag.reason}`}
          title={flag.label}
          className={cn(
            "rounded-lg px-2 py-0.5 text-xs font-medium",
            flag.key === "churn_risk"
              ? "bg-red-500/10 text-red-800 dark:text-red-300"
              : "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
          )}
        >
          {compact ? (HEALTH_SIGNAL_LABELS[flag.key] ?? flag.key) : flag.label}
        </span>
      ))}
    </span>
  );
}
