"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { getCategoryLabel } from "kadesh/components/profile/sales/helpers/category";
import { UNCATEGORIZED_LEAD_CATEGORY } from "./leadCategoryColors";

export interface LeadMapPanelCategory {
  category: string;
  hex: string;
  count: number;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e]";

function categoryLabel(category: string): string {
  if (category === UNCATEGORIZED_LEAD_CATEGORY) return "Sin categoría";
  return getCategoryLabel(category);
}

function CategorySwitch({ on, hex }: { on: boolean; hex: string }) {
  return (
    <span
      aria-hidden
      className={`relative h-6 w-11 shrink-0 rounded-full motion-safe:transition-colors motion-safe:duration-200 ${
        on ? "" : "bg-[#d4d4d4] dark:bg-[#3f3f3f]"
      }`}
      style={on ? { backgroundColor: hex } : undefined}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm motion-reduce:transition-none motion-safe:transition-transform motion-safe:duration-200 ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </span>
  );
}

export default function LeadMapCategoryPanel({
  categories,
  hiddenCategories,
  onToggle,
  onShowAll,
  onHideAll,
}: {
  categories: LeadMapPanelCategory[];
  hiddenCategories: ReadonlySet<string>;
  onToggle: (category: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  if (categories.length === 0) return null;

  const visibleCount = categories.filter(
    (item) => !hiddenCategories.has(item.category),
  ).length;
  const allVisible = visibleCount === categories.length;
  const allHidden = visibleCount === 0;

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 w-[min(17.5rem,calc(100%-5.5rem))] sm:bottom-6 sm:left-6">
      <div className="pointer-events-auto flex max-h-[min(22rem,46vh)] flex-col overflow-hidden rounded-2xl border border-black/8 bg-white/92 shadow-[0_10px_30px_rgba(0,0,0,0.14)] backdrop-blur-md dark:border-white/10 dark:bg-[#171717]/92 dark:shadow-[0_14px_36px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-2 pr-1 pl-3">
          <p className="text-[11px] font-semibold tracking-wide text-[#757575] dark:text-[#a3a3a3]">
            Categorías
          </p>
          <p className="ml-auto text-[11px] font-medium tabular-nums text-[#9e9e9e] dark:text-[#8a8a8a]">
            {visibleCount} en el mapa
          </p>
          <button
            type="button"
            aria-expanded={!isCollapsed}
            aria-controls="lead-map-categories"
            onClick={() => setIsCollapsed((collapsed) => !collapsed)}
            className={`flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[#616161] motion-safe:transition-colors motion-safe:duration-150 hover:bg-black/5 dark:text-[#c7c7c7] dark:hover:bg-white/6 ${FOCUS_RING}`}
          >
            <HugeiconsIcon
              icon={isCollapsed ? ArrowUp01Icon : ArrowDown01Icon}
              size={18}
              aria-hidden
            />
            <span className="sr-only">
              {isCollapsed ? "Mostrar categorías" : "Ocultar categorías"}
            </span>
          </button>
        </div>
        <div
          id="lead-map-categories"
          className={`grid min-h-0 motion-reduce:transition-none motion-safe:transition-[grid-template-rows] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.2,0,0,1)] ${
            isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
          }`}
        >
          <div className="overflow-hidden" inert={isCollapsed}>
            <ul className="max-h-[min(16rem,34vh)] space-y-0.5 overflow-y-auto px-1.5 pb-1.5">
          {categories.map((item) => {
            const label = categoryLabel(item.category);
            const isVisible = !hiddenCategories.has(item.category);
            return (
              <li key={item.category}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isVisible}
                  onClick={() => onToggle(item.category)}
                  className={`flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 text-left motion-safe:transition-colors motion-safe:duration-150 hover:bg-black/5 dark:hover:bg-white/6 ${FOCUS_RING}`}
                >
                  <span
                    className={`size-2.5 shrink-0 rounded-full motion-safe:transition-opacity motion-safe:duration-200 ${
                      isVisible ? "opacity-100" : "opacity-35"
                    }`}
                    style={{ backgroundColor: item.hex }}
                    aria-hidden
                  />
                  <span
                    className={`min-w-0 flex-1 break-words text-sm font-medium ${
                      isVisible
                        ? "text-[#212121] dark:text-white"
                        : "text-[#9e9e9e] dark:text-[#8a8a8a]"
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className={`shrink-0 text-xs font-semibold tabular-nums ${
                      isVisible
                        ? "text-[#616161] dark:text-[#c7c7c7]"
                        : "text-[#bdbdbd] dark:text-[#6b6b6b]"
                    }`}
                  >
                    {item.count}
                  </span>
                  <CategorySwitch on={isVisible} hex={item.hex} />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="grid grid-cols-2 border-t border-black/6 dark:border-white/8">
          <button
            type="button"
            onClick={onHideAll}
            disabled={allHidden}
            className={`min-h-11 cursor-pointer text-xs font-semibold text-[#424242] motion-safe:transition-colors motion-safe:duration-150 hover:bg-black/5 disabled:cursor-default disabled:opacity-35 dark:text-[#e0e0e0] dark:hover:bg-white/6 ${FOCUS_RING}`}
          >
            Quitar todos
          </button>
          <button
            type="button"
            onClick={onShowAll}
            disabled={allVisible}
            className={`min-h-11 cursor-pointer border-l border-black/6 text-xs font-semibold text-[#424242] motion-safe:transition-colors motion-safe:duration-150 hover:bg-black/5 disabled:cursor-default disabled:opacity-35 dark:border-white/8 dark:text-[#e0e0e0] dark:hover:bg-white/6 ${FOCUS_RING}`}
          >
            Ver todos
          </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
