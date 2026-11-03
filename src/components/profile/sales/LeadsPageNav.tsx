"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  getVisiblePageItems,
  LEADS_PAGE_SIZES,
  type LeadsPageSize,
} from "./leadsPagination";

export default function LeadsPageNav({
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: LeadsPageSize) => void;
  loading?: boolean;
}) {
  if (totalCount <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const effectivePage =
    totalCount > 0 ? Math.min(currentPage, totalPages) : currentPage;
  const from = (effectivePage - 1) * pageSize + 1;
  const to = Math.min(effectivePage * pageSize, totalCount);
  const pageItems = getVisiblePageItems(effectivePage, totalPages);
  const showPageNav = totalCount > pageSize && onPageChange != null;

  return (
    <div className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-dash-muted">
          {from}–{to} de {totalCount.toLocaleString("es-MX")}
        </p>
        {onPageSizeChange != null && (
          <label className="inline-flex items-center gap-2 text-sm text-dash-muted">
            <span className="sr-only sm:not-sr-only">Por página</span>
            <select
              value={pageSize}
              onChange={(event) =>
                onPageSizeChange(Number(event.target.value) as LeadsPageSize)
              }
              className="rounded-lg border border-dash-line bg-white px-2 py-1.5 text-sm text-dash-ink focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-[#2a2a2a]"
              aria-label="Clientes por página"
            >
              {LEADS_PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {showPageNav && (
        <nav className="flex items-center gap-1" aria-label="Paginación de clientes">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, effectivePage - 1))}
            disabled={effectivePage <= 1 || loading}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-dash-line text-dash-ink transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:border-orange-300 hover:bg-orange-500/10 hover:text-orange-700 active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:border-orange-700 dark:hover:text-orange-300"
            aria-label="Página anterior"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </button>
          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`e-${index}`}
                className="px-1.5 text-sm text-dash-faint"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                disabled={loading}
                aria-current={item === effectivePage ? "page" : undefined}
                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition-[transform,background-color,color,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)] ${
                  item === effectivePage
                    ? "scale-105 bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                    : "border border-dash-line text-dash-ink hover:border-orange-300 hover:bg-orange-500/10 active:scale-[0.96] dark:hover:border-orange-700"
                }`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, effectivePage + 1))}
            disabled={effectivePage >= totalPages || loading}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-dash-line text-dash-ink transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:border-orange-300 hover:bg-orange-500/10 hover:text-orange-700 active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:border-orange-700 dark:hover:text-orange-300"
            aria-label="Página siguiente"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
