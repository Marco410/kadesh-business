"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { InfoTip, ModalPortal } from "kadesh/components/shared";

// El ícono ⓘ vive en shared (también lo usa la Analítica del cliente); se reexporta para Operaciones.
export { InfoTip };
import { getVisiblePageItems } from "kadesh/components/profile/sales/leadsPagination";
import { cn } from "kadesh/utils/cn";

export const surfaceClass =
  "rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e]";

export function AdminStatusBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        className,
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
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] pl-10 pr-3 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
      />
    </label>
  );
}

/**
 * Navegación con subrayado: las secciones de Operaciones y, en variante `compact`,
 * las secciones del detalle 360 de un cliente. No compite con los filtros.
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
  return (
    <nav
      aria-label={ariaLabel}
      className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-[#e0e0e0] dark:border-[#3a3a3a] -mx-4 px-4 sm:mx-0 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              "relative -mb-px shrink-0 whitespace-nowrap border-b-2 font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400",
              size === "compact" ? "h-11 px-3 text-sm" : "h-12 px-4 text-base",
              selected
                ? "border-orange-500 text-[#212121] dark:text-white"
                : "border-transparent text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-white hover:border-[#d0d0d0] dark:hover:border-[#555]",
            )}
          >
            {item.label}
            {item.count != null ? (
              <span className="ml-1.5 text-xs font-medium tabular-nums text-[#9e9e9e]">
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

/** Cambio de vista dentro de una sección (p. ej. Fichas / Servicios). */
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
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex max-w-full self-start overflow-x-auto rounded-xl bg-black/5 dark:bg-white/10 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              "h-10 shrink-0 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
              selected
                ? "bg-white dark:bg-[#3a3a3a] text-[#212121] dark:text-white shadow-sm"
                : "text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-white",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/** Filtro de una tabla: chips pequeños y tintados, con etiqueta de qué filtran. */
export function AdminFilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {label ? (
        <span className="shrink-0 text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
          {label}
        </span>
      ) : null}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 px-1 -mx-1">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "h-11 sm:h-9 shrink-0 rounded-lg border px-3 text-[13px] font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
                selected
                  ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                  : "border-transparent bg-black/5 dark:bg-white/5 text-[#616161] dark:text-[#b0b0b0] hover:bg-black/10 dark:hover:bg-white/10",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AdminLoadingRows({ rows = 8 }: { rows?: number }) {
  return (
    <div className={cn(surfaceClass, "overflow-hidden")}>
      <div className="h-11 bg-[#f5f5f5] dark:bg-[#2a2a2a]" />
      <div className="divide-y divide-[#e8e8e8] dark:divide-[#333]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 px-4 flex items-center">
            <div className="h-3 w-full max-w-md rounded bg-[#ececec] dark:bg-[#333] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={cn(surfaceClass, "px-6 py-12 text-center")}>
      <p className="text-base font-semibold text-[#212121] dark:text-white">
        {title}
      </p>
      <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
        {description}
      </p>
    </div>
  );
}

export function AdminErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 text-sm text-red-700 dark:text-red-300">
      {message}
    </div>
  );
}

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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3">
      <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
        {from}–{to} de {totalCount}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={effectivePage <= 1}
            onClick={() => onPageChange(effectivePage - 1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Página anterior"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </button>
          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`e-${index}`}
                className="px-2 text-sm text-[#9e9e9e]"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={cn(
                  "min-w-11 h-11 rounded-xl px-3 text-sm font-semibold cursor-pointer",
                  item === effectivePage
                    ? "bg-orange-500 text-white"
                    : "border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-white hover:bg-black/5 dark:hover:bg-white/5",
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
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

/** Tarjeta con título para agrupar un bloque dentro del detalle 360. */
export function AdminSectionCard({
  title,
  description,
  help,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  /** Explicación detrás del ícono ⓘ junto al título. */
  help?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(surfaceClass, "p-4 sm:p-5", className)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1 text-sm font-semibold text-[#212121] dark:text-white">
            {title}
            {help ? <InfoTip label={title}>{help}</InfoTip> : null}
          </h3>
          {description ? (
            <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** Número clave con etiqueta (uso del mes, KPIs). */
export function AdminStatTile({
  label,
  value,
  hint,
  help,
  tone = "default",
  onClick,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** Explicación detrás del ícono ⓘ (va fuera del botón: no se anidan botones). */
  help?: ReactNode;
  tone?: "default" | "warning" | "danger" | "success";
  onClick?: () => void;
}) {
  const toneClass = {
    default: "border-[#e8e8e8] dark:border-[#333]",
    warning: "border-amber-300 dark:border-amber-600",
    danger: "border-red-300 dark:border-red-700",
    success: "border-emerald-300 dark:border-emerald-700",
  }[tone];
  const content = (
    <>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#9e9e9e]">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums text-[#212121] dark:text-white">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">{hint}</p>
      ) : null}
    </>
  );
  const className = cn("rounded-xl border px-3 py-2 text-left", help ? "pr-8" : null, toneClass);
  const tile = onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        className,
        "h-full w-full cursor-pointer transition-colors hover:border-orange-300 dark:hover:border-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
      )}
    >
      {content}
    </button>
  ) : (
    <div className={cn(className, "h-full")}>{content}</div>
  );
  if (!help) return tile;
  return (
    <div className="relative">
      {tile}
      <span className="absolute right-2 top-1.5">
        <InfoTip label={label}>{help}</InfoTip>
      </span>
    </div>
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
  const tone =
    ratio >= 1 ? "bg-red-500" : ratio >= 0.8 ? "bg-amber-500" : "bg-orange-500";
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0] dark:bg-[#2a2a2a]"
    >
      <div
        className={cn("h-full rounded-full", tone)}
        style={{ width: `${Math.max(ratio * 100, value > 0 ? 3 : 0)}%` }}
      />
    </div>
  );
}

/** Iniciales de una persona. */
export function AdminAvatar({
  name,
  lastName,
  size = 32,
}: {
  name?: string | null;
  lastName?: string | null;
  size?: number;
}) {
  const initials =
    `${name?.trim()?.[0] ?? ""}${lastName?.trim()?.[0] ?? ""}`.toUpperCase() || "?";
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-semibold text-orange-700 dark:text-orange-300"
      style={{ width: size, height: size }}
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
    <dl
      className={cn(
        "grid gap-x-4 gap-y-2 text-sm",
        columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-[#9e9e9e]">{item.label}</dt>
          <dd className="break-words text-[#212121] dark:text-white">
            {item.value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Botón "Cargar más" para listas con cursor (feed de actividad). */
export function AdminLoadMore({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex justify-center pt-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="h-11 rounded-xl border border-[#e0e0e0] px-4 text-sm font-semibold text-[#212121] hover:border-orange-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#3a3a3a] dark:text-white cursor-pointer"
      >
        {loading ? "Cargando..." : "Cargar más"}
      </button>
    </div>
  );
}

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
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

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
              className="fixed inset-0 z-50 bg-black/50"
              onClick={onClose}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[92vh] flex-col overflow-hidden rounded-t-2xl border border-[#e0e0e0] bg-white shadow-2xl dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-full sm:max-w-2xl sm:rounded-none sm:rounded-l-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#e0e0e0] px-4 py-4 dark:border-[#3a3a3a] sm:px-6">
                <div className="min-w-0">
                  <div className="text-lg font-bold text-[#212121] dark:text-white">
                    {title}
                  </div>
                  {subtitle ? (
                    <div className="mt-0.5 break-all text-sm text-[#616161] dark:text-[#b0b0b0]">
                      {subtitle}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#616161] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] cursor-pointer"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">{children}</div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </ModalPortal>
  );
}
