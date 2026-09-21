"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
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

/** Navegación principal de la pantalla: barra con subrayado, no compite con los filtros. */
export function AdminTabBar<T extends string>({
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
    <nav
      aria-label={ariaLabel}
      className="flex gap-1 overflow-x-auto border-b border-[#e0e0e0] dark:border-[#3a3a3a] -mx-4 px-4 sm:mx-0 sm:px-0"
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
              "relative -mb-px h-12 shrink-0 border-b-2 px-4 text-base font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400",
              selected
                ? "border-orange-500 text-[#212121] dark:text-white"
                : "border-transparent text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-white hover:border-[#d0d0d0] dark:hover:border-[#555]",
            )}
          >
            {item.label}
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
      className="inline-flex self-start rounded-xl bg-black/5 dark:bg-white/10 p-1"
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
              "h-10 rounded-lg px-4 text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
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
