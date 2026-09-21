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

export function AdminFilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
              selected
                ? "bg-orange-500 text-white"
                : "border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] text-[#424242] dark:text-[#e0e0e0] hover:border-orange-300 dark:hover:border-orange-500",
            )}
          >
            {option.label}
          </button>
        );
      })}
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
