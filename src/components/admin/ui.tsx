"use client";

import { useEffect, useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  AlertCircleIcon,
  ArrowDownRight01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Cancel01Icon,
  InboxIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { InfoTip, ModalPortal } from "kadesh/components/shared";
import { AnimatedNumber, DASH_EASE, Reveal, Sparkline, indicatorTransition } from "kadesh/components/app-shell";

// El ícono ⓘ vive en shared (también lo usa la Analítica del cliente); se reexporta para Operaciones.
export { InfoTip };
import { getVisiblePageItems } from "kadesh/components/profile/sales/leadsPagination";
import { cn } from "kadesh/utils/cn";

/*
 * Kit de Operaciones sobre los tokens `dash-*` (globals.css). Mismo lenguaje que el admin de
 * ICARM con los colores de Kadesh: tarjetas de 24 px con sombra suave, píldoras, chips activos en
 * tinta y naranja solo en la acción principal. Ver README → Diseño.
 */

export const surfaceClass = "rounded-3xl border border-dash-line bg-dash-surface shadow-dash";

/** Píldora con tono. `className` (colores propios de un estatus) gana sobre `tone`. */
export function AdminStatusBadge({
  label,
  className,
  tone = "neutral",
}: {
  label: string;
  className?: string;
  tone?: "neutral" | "ok" | "warning" | "danger" | "accent";
}) {
  const toneClass = {
    neutral: "bg-dash-surface-2 text-dash-soft",
    ok: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    accent: "bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5",
        className ?? toneClass,
      )}
    >
      {label}
    </span>
  );
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">{placeholder}</span>
      <HugeiconsIcon
        icon={Search01Icon}
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dash-faint"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-dash-line bg-dash-surface pl-11 pr-4 text-[15px] text-dash-ink shadow-[0_1px_2px_rgba(20,20,20,0.03)] transition-[border-color,box-shadow] placeholder:text-dash-faint focus:border-orange-400 focus:outline-none focus:ring-[3px] focus:ring-orange-500/15"
      />
    </label>
  );
}

/**
 * Pestañas con subrayado naranja que se desliza. Hoy solo las usa el detalle 360 de un cliente
 * (`size="compact"`); las secciones de Operaciones viven en el menú lateral.
 */
export function AdminTabBar<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  size = "default",
}: {
  items: Array<{ id: T; label: string; count?: number | null }>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "default" | "compact";
}) {
  const layoutId = useId();
  return (
    <nav
      aria-label={ariaLabel}
      className="-mx-4 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-dash-line px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={selected ? "page" : undefined}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative shrink-0 cursor-pointer whitespace-nowrap font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400",
              size === "compact" ? "h-11 px-3 text-sm" : "h-12 px-4 text-[15px]",
              selected ? "text-dash-ink" : "text-dash-muted hover:text-dash-ink",
            )}
          >
            {item.label}
            {item.count != null ? (
              <span className="ml-1.5 text-xs font-medium tabular-nums text-dash-faint">{item.count}</span>
            ) : null}
            {selected ? (
              <motion.span
                layoutId={`tabbar-${layoutId}`}
                transition={indicatorTransition}
                className="absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-orange-500"
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

/** Cambio de vista dentro de una sección: pista cálida con la opción activa en píldora que se desliza. */
export function AdminSegmented<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
}: {
  items: Array<{ id: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  const layoutId = useId();
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex max-w-full gap-0.5 self-start overflow-x-auto rounded-full bg-dash-surface-2 p-[3px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative h-10 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
              selected ? "font-semibold text-dash-ink" : "font-medium text-dash-soft hover:text-dash-ink",
            )}
          >
            {selected ? (
              <motion.span
                layoutId={`segmented-${layoutId}`}
                transition={indicatorTransition}
                className="absolute inset-0 rounded-full bg-dash-surface shadow-[0_1px_3px_rgba(20,20,20,0.12)] dark:bg-dash-surface-3"
                aria-hidden
              />
            ) : null}
            <span className="relative">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Filtro de una lista: píldoras con borde; la activa en tinta. Opcionales: `count` (cuántos hay)
 * y `dot` (clase de color del punto, p. ej. el color de un estatus).
 */
export function AdminFilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string; count?: number | null; dot?: string }>;
  value: T;
  onChange: (value: T) => void;
  label?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {label ? <span className="shrink-0 text-[13px] font-semibold text-dash-muted">{label}</span> : null}
      <div className="-mx-1 -my-1 flex min-w-0 snap-x gap-1.5 overflow-x-auto px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] xl:flex-wrap xl:overflow-visible [&::-webkit-scrollbar]:hidden">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex h-11 shrink-0 cursor-pointer snap-start items-center gap-2 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 xl:h-[38px]",
                selected
                  ? "border-dash-ink bg-dash-ink text-dash-on-ink"
                  : "border-dash-line bg-dash-surface text-dash-soft hover:border-dash-line-strong hover:text-dash-ink",
              )}
            >
              {option.dot ? <span className={cn("size-2 shrink-0 rounded-full", option.dot)} aria-hidden /> : null}
              {option.label}
              {option.count != null ? (
                <span
                  className={cn(
                    "text-xs font-semibold tabular-nums",
                    selected ? "text-dash-on-ink/70" : "text-dash-faint",
                  )}
                >
                  {option.count.toLocaleString("es-MX")}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AdminLoadingRows({ rows = 8 }: { rows?: number }) {
  return (
    <div className={cn(surfaceClass, "overflow-hidden")} aria-busy="true" aria-label="Cargando">
      <div className="h-11 bg-dash-surface-2/70" />
      <div className="divide-y divide-dash-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex h-16 items-center gap-3 px-4">
            <div className="dash-shimmer size-8 shrink-0 rounded-full" />
            <div className="dash-shimmer h-3 w-full max-w-md rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  icon = InboxIcon,
  action,
}: {
  title: string;
  description: string;
  icon?: IconSvgElement;
  action?: ReactNode;
}) {
  return (
    <div className={cn(surfaceClass, "px-6 py-12 text-center")}>
      <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-dash-surface-2 text-dash-muted">
        <HugeiconsIcon icon={icon} size={22} />
      </span>
      <p className="text-base font-semibold tracking-[-0.01em] text-dash-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-dash-muted">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function AdminErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
    >
      <HugeiconsIcon icon={AlertCircleIcon} size={20} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

const pageButton =
  "inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-40";

export function AdminPagination({
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
}: {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const effectivePage = totalCount > 0 ? Math.min(currentPage, totalPages) : currentPage;
  const from = totalCount === 0 ? 0 : (effectivePage - 1) * pageSize + 1;
  const to = Math.min(effectivePage * pageSize, totalCount);
  const pageItems = getVisiblePageItems(effectivePage, totalPages);

  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] tabular-nums text-dash-muted">
        {from.toLocaleString("es-MX")}–{to.toLocaleString("es-MX")} de {totalCount.toLocaleString("es-MX")}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={effectivePage <= 1}
            onClick={() => onPageChange(effectivePage - 1)}
            className={cn(pageButton, "border border-dash-line bg-dash-surface text-dash-soft hover:text-dash-ink")}
            aria-label="Página anterior"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </button>
          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`e-${index}`} className="px-2 text-sm text-dash-faint">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === effectivePage ? "page" : undefined}
                className={cn(
                  pageButton,
                  item === effectivePage
                    ? "bg-dash-ink text-dash-on-ink"
                    : "border border-dash-line bg-dash-surface text-dash-ink hover:border-dash-line-strong",
                )}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={effectivePage >= totalPages}
            onClick={() => onPageChange(effectivePage + 1)}
            className={cn(pageButton, "border border-dash-line bg-dash-surface text-dash-soft hover:text-dash-ink")}
            aria-label="Página siguiente"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function formatPersonName(
  name?: string | null,
  lastName?: string | null,
  secondLastName?: string | null,
) {
  return [name, lastName, secondLastName].filter(Boolean).join(" ") || "—";
}

export function formatMoney(amount: number | null, currency: string | null) {
  if (amount == null) return "—";
  const c = currency ?? "MXN";
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: c,
    }).format(amount);
  } catch {
    return `${amount} ${c}`;
  }
}

export function formatCredits(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-MX").format(value);
}

export function formatPlanFrequency(frequency: string | null | undefined) {
  const f = frequency?.toLowerCase();
  if (f === "monthly") return "al mes";
  if (f === "annual" || f === "yearly") return "al año";
  return frequency || "";
}

/** Tarjeta con título (y ⓘ, descripción y acción opcionales). Entra con fade-up al montar. */
export function AdminSectionCard({
  title,
  description,
  help,
  action,
  children,
  className,
  index = 0,
}: {
  title: string;
  description?: string;
  /** Explicación detrás del ícono ⓘ junto al título. */
  help?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Posición para escalonar la entrada (50 ms cada una). */
  index?: number;
}) {
  return (
    <Reveal as="section" index={index} className={cn(surfaceClass, "min-w-0 p-5 md:p-6", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1 text-[17px] font-semibold tracking-[-0.02em] text-dash-ink">
            {title}
            {help ? <InfoTip label={title}>{help}</InfoTip> : null}
          </h3>
          {description ? <p className="mt-0.5 text-[13px] text-dash-muted">{description}</p> : null}
        </div>
        {action ? <div className="min-w-0 max-w-full">{action}</div> : null}
      </div>
      {children}
    </Reveal>
  );
}

export type AdminStatDelta = {
  /** % de cambio; `null` = sin con qué comparar (solo se muestra el texto). */
  value: number | null;
  label?: string;
};

/**
 * Indicador (KPI). Variantes:
 * - `default`: tarjeta blanca.
 * - `dark`: tarjeta oscura con brillo naranja, para el número más importante de la vista.
 * - `tint`: tarjeta durazno, para el segundo.
 * `tone` (warning, danger, success) pinta un punto junto a la etiqueta y la cifra; ya no el borde.
 * Si `value` es número, cuenta hacia arriba al aparecer (`formatValue` le da formato).
 */
export function AdminStatTile({
  label,
  value,
  hint,
  help,
  tone = "default",
  onClick,
  variant = "default",
  icon,
  delta,
  sparkline,
  formatValue,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** Explicación detrás del ícono ⓘ (va fuera del botón: no se anidan botones). */
  help?: ReactNode;
  tone?: "default" | "warning" | "danger" | "success";
  onClick?: () => void;
  variant?: "default" | "dark" | "tint";
  icon?: IconSvgElement;
  delta?: AdminStatDelta | null;
  sparkline?: number[] | null;
  formatValue?: (value: number) => string;
}) {
  const dark = variant === "dark";
  const toneDot = {
    default: null,
    warning: "bg-amber-500",
    danger: "bg-red-500",
    success: "bg-green-500",
  }[tone];
  const toneValue = dark
    ? "text-white"
    : {
        default: "text-dash-ink",
        warning: "text-amber-700 dark:text-amber-400",
        danger: "text-red-700 dark:text-red-400",
        success: "text-green-700 dark:text-green-400",
      }[tone];

  const content = (
    <>
      <span className="flex items-center gap-2.5">
        {icon ? (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              dark && "bg-white/12 text-white",
              variant === "tint" && "bg-white/70 text-orange-700 dark:bg-white/10 dark:text-orange-300",
              variant === "default" && "bg-dash-surface-2 text-dash-soft",
            )}
          >
            <HugeiconsIcon icon={icon} size={18} />
          </span>
        ) : null}
        <span
          className={cn(
            "flex min-w-0 items-center gap-1.5 text-[13px] font-medium leading-tight",
            dark ? "text-white/70" : "text-dash-muted",
          )}
        >
          {toneDot ? <span className={cn("size-2 shrink-0 rounded-full", toneDot)} aria-hidden /> : null}
          <span className="min-w-0">{label}</span>
        </span>
      </span>
      <span
        className={cn(
          "block text-[1.75rem] font-bold leading-none tracking-[-0.045em] tabular-nums sm:text-[2rem]",
          toneValue,
        )}
      >
        {typeof value === "number" ? <AnimatedNumber value={value} format={formatValue} /> : value}
      </span>
      {hint || delta ? (
        <span className="flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1">
          {delta ? <DeltaPill delta={delta} onDark={dark} /> : null}
          {hint ? (
            <span className={cn("text-[13px] leading-snug", dark ? "text-white/70" : "text-dash-muted")}>{hint}</span>
          ) : null}
        </span>
      ) : null}
      {sparkline && sparkline.length > 1 ? (
        <Sparkline series={sparkline} tone={dark ? "onDark" : "accent"} className="-mb-1 mt-auto" />
      ) : null}
    </>
  );

  const className = cn(
    "relative flex h-full w-full flex-col gap-2.5 overflow-hidden rounded-3xl border p-4 text-left sm:p-5",
    help ? "pr-10" : null,
    variant === "default" && "border-dash-line bg-dash-surface shadow-dash",
    dark && "dash-grad-dark border-transparent text-white shadow-dash dark:border-white/10",
    variant === "tint" && "dash-grad-tint border-[color:var(--dash-tint-line)] shadow-dash",
  );

  const tile = onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        className,
        "cursor-pointer transition-[transform,box-shadow] duration-[250ms] ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-0.5 hover:shadow-dash-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
      )}
    >
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
  if (!help) return tile;
  return (
    <div className={cn("relative h-full", dark && "[&>span_button]:text-white/60")}>
      {tile}
      <span className="absolute right-3 top-3">
        <InfoTip label={label}>{help}</InfoTip>
      </span>
    </div>
  );
}

function DeltaPill({ delta, onDark }: { delta: AdminStatDelta; onDark: boolean }) {
  const up = delta.value != null && delta.value > 0;
  const down = delta.value != null && delta.value < 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        onDark
          ? "bg-white/14 text-white"
          : up
            ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300"
            : down
              ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"
              : "bg-dash-surface-2 text-dash-muted",
      )}
      title={delta.label}
    >
      {up ? <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} aria-hidden /> : null}
      {down ? <HugeiconsIcon icon={ArrowDownRight01Icon} size={13} aria-hidden /> : null}
      {delta.value != null ? `${delta.value > 0 ? "+" : ""}${delta.value}%` : delta.label}
    </span>
  );
}

/** Barra de consumo (créditos usados / disponibles). */
export function AdminProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  const tone = ratio >= 1 ? "bg-red-500" : ratio >= 0.8 ? "bg-amber-500" : "dash-grad-accent";
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className="h-2 w-full overflow-hidden rounded-full bg-dash-surface-2"
    >
      <div
        className={cn("dashboard-bar-grow h-full rounded-full", tone)}
        style={{ width: `${Math.max(ratio * 100, value > 0 ? 3 : 0)}%` }}
      />
    </div>
  );
}

/** Iniciales de una persona sobre el degradado naranja. */
export function AdminAvatar({
  name,
  lastName,
  size = 32,
}: {
  name?: string | null;
  lastName?: string | null;
  size?: number;
}) {
  const initials = `${name?.trim()?.[0] ?? ""}${lastName?.trim()?.[0] ?? ""}`.toUpperCase() || "?";
  return (
    <span
      aria-hidden
      className="dash-grad-accent flex shrink-0 items-center justify-center rounded-full font-bold tracking-[-0.02em] text-white"
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.36)) }}
    >
      {initials}
    </span>
  );
}

/** Lista etiqueta → valor (datos de la ficha, detalle de un lead). */
export function AdminDefinitionList({
  items,
  columns = 1,
}: {
  items: Array<{ label: string; value: ReactNode }>;
  columns?: 1 | 2;
}) {
  return (
    <dl className={cn("grid gap-x-5 gap-y-3 text-sm", columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[12px] font-medium text-dash-muted">{item.label}</dt>
          <dd className="mt-0.5 break-words text-[15px] text-dash-ink">{item.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Botón "Cargar más" para listas con cursor (feed de actividad). */
export function AdminLoadMore({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="flex justify-center pt-2">
      <AdminButton variant="outline" onClick={onClick} disabled={loading}>
        {loading ? "Cargando..." : "Cargar más"}
      </AdminButton>
    </div>
  );
}

// ─── Botones ────────────────────────────────────────────────────────────────────────────────

export type AdminButtonVariant = "primary" | "dark" | "outline" | "ghost" | "danger" | "danger-ghost";
export type AdminButtonSize = "md" | "sm" | "icon" | "icon-sm";

/** Clases de botón para `<a>`/`<Link>` que deben verse como botón. */
export function adminButtonClass({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.01em]",
    "transition-[background-color,border-color,box-shadow,transform,color,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dash-surface",
    "disabled:pointer-events-none disabled:opacity-50",
    {
      md: "h-11 px-5 text-[15px]",
      sm: "h-10 px-4 text-sm",
      icon: "size-11",
      "icon-sm": "size-10",
    }[size],
    {
      primary: "dash-grad-accent text-white shadow-dash-accent hover:-translate-y-px hover:shadow-dash-accent-lift",
      dark: "bg-dash-ink text-dash-on-ink hover:opacity-90",
      outline: "border border-dash-line-strong bg-dash-surface text-dash-ink hover:border-orange-400",
      ghost: "text-dash-soft hover:bg-dash-hover hover:text-dash-ink",
      danger: "bg-red-600 text-white hover:bg-red-700",
      "danger-ghost": "text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10",
    }[variant],
    className,
  );
}

export function AdminButton({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  icon?: IconSvgElement;
}) {
  return (
    <button type={type} className={adminButtonClass({ variant, size, className })} {...props}>
      {icon ? <HugeiconsIcon icon={icon} size={size === "sm" || size === "icon-sm" ? 16 : 18} /> : null}
      {children}
    </button>
  );
}

// ─── Campos y tablas ────────────────────────────────────────────────────────────────────────

export const adminInputClass =
  "h-11 w-full rounded-[14px] border border-dash-line bg-dash-surface px-3.5 text-[15px] text-dash-ink placeholder:text-dash-faint transition-[border-color,box-shadow] focus:border-orange-400 focus:outline-none focus:ring-[3px] focus:ring-orange-500/15 disabled:cursor-not-allowed disabled:opacity-60";

export const adminSelectClass = cn(adminInputClass, "cursor-pointer");

export const adminTextareaClass = cn(adminInputClass, "h-auto min-h-24 py-2.5 leading-relaxed");

export const adminLabelClass = "mb-1.5 block text-[13px] font-semibold text-dash-soft";

/** Contenedor de tabla (tarjeta con scroll horizontal). */
export const adminTableWrapClass = cn(surfaceClass, "overflow-x-auto");
export const adminTableClass = "w-full text-left text-sm";
export const adminTheadClass =
  "bg-dash-surface-2/60 text-[12px] font-semibold uppercase tracking-[0.04em] text-dash-muted";
export const adminThClass = "px-4 py-3 font-semibold";
export const adminTdClass = "px-4 py-3 align-middle";
export const adminRowClass = "border-t border-dash-line transition-colors duration-150 hover:bg-orange-500/[0.04]";

// ─── Paneles que se abren ───────────────────────────────────────────────────────────────────

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
}

function isDesktopViewport() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches;
}

const closeButtonClass =
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";

/**
 * Panel lateral (abajo en móvil). Para editar o ver a fondo sin perder el contexto
 * de la página (p. ej. una persona dentro del 360 de su empresa).
 */
export function AdminDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  ariaLabel: string;
}) {
  useEscape(open, onClose);
  const desktop = isDesktopViewport();
  const offscreen = desktop ? { opacity: 0, x: 48 } : { opacity: 0, y: 32 };

  return (
    <ModalPortal>
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              data-body-scroll-lock
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
              onClick={onClose}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              initial={offscreen}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={offscreen}
              transition={{ duration: 0.35, ease: DASH_EASE }}
              className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[92vh] flex-col overflow-hidden rounded-t-3xl border border-dash-line bg-dash-surface font-dash text-dash-ink shadow-dash-lift sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-full sm:max-w-2xl sm:rounded-none sm:rounded-l-3xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-dash-line px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <div className="text-lg font-semibold tracking-[-0.02em] text-dash-ink">{title}</div>
                  {subtitle ? (
                    <div className="mt-0.5 text-sm text-dash-muted [overflow-wrap:anywhere]">{subtitle}</div>
                  ) : null}
                </div>
                <button type="button" onClick={onClose} aria-label="Cerrar" className={closeButtonClass}>
                  <HugeiconsIcon icon={Cancel01Icon} size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </ModalPortal>
  );
}

/**
 * Modal centrado (hoja inferior en móvil) con encabezado fijo y pie opcional. Reemplaza los
 * modales que cada editor armaba a mano.
 */
export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  ariaLabel,
  size = "md",
  layer = "base",
  headerAside,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  ariaLabel: string;
  size?: "md" | "lg" | "xl";
  /** `top`: por encima de otro modal (p. ej. revisar Stripe desde el editor de plan). */
  layer?: "base" | "top";
  /** Algo junto al título (insignia de estado). */
  headerAside?: ReactNode;
}) {
  useEscape(open, onClose);
  const widths = { md: "sm:max-w-xl", lg: "sm:max-w-3xl", xl: "sm:max-w-5xl" }[size];
  const z = layer === "top" ? { backdrop: "z-[70]", panel: "z-[80]" } : { backdrop: "z-50", panel: "z-[60]" };

  return (
    <ModalPortal>
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              data-body-scroll-lock
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn("fixed inset-0 bg-black/40 backdrop-blur-[2px]", z.backdrop)}
              onClick={onClose}
            />
            <div
              className={cn(
                "pointer-events-none fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6",
                z.panel,
              )}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.3, ease: DASH_EASE }}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "pointer-events-auto flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-dash-line bg-dash-surface font-dash text-dash-ink shadow-dash-lift sm:rounded-3xl",
                  widths,
                )}
              >
                <div className="flex items-start justify-between gap-3 border-b border-dash-line px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-xl font-semibold tracking-[-0.02em] text-dash-ink">{title}</div>
                      {headerAside}
                    </div>
                    {subtitle ? (
                      <div className="mt-1 text-sm text-dash-muted [overflow-wrap:anywhere]">{subtitle}</div>
                    ) : null}
                  </div>
                  <button type="button" onClick={onClose} aria-label="Cerrar" className={closeButtonClass}>
                    <HugeiconsIcon icon={Cancel01Icon} size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
                {footer ? (
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-dash-line bg-dash-surface px-5 py-3.5 sm:px-6">
                    {footer}
                  </div>
                ) : null}
              </motion.div>
            </div>
          </>
        ) : null}
      </AnimatePresence>
    </ModalPortal>
  );
}
