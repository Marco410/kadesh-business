"use client";

import { getCategoryLabel } from "kadesh/components/profile/sales/helpers/category";
import { UNCATEGORIZED_LEAD_CATEGORY } from "./leadCategoryColors";

export interface LeadMapLegendCategory {
  category: string;
  hex: string;
}

export default function LeadMapCategoryLegend({
  categories,
}: {
  categories: LeadMapLegendCategory[];
}) {
  if (categories.length === 0) return null;

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-20 max-w-[min(100%-5.5rem,36rem)] sm:bottom-6 sm:left-6">
      <div className="pointer-events-auto rounded-2xl border border-[#e0e0e0] bg-white/95 p-3 shadow-sm backdrop-blur-md dark:border-[#3a3a3a] dark:bg-[#1e1e1e]/95">
        <p className="text-xs font-semibold text-[#212121] dark:text-white">
          Clientes en el mapa
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {categories.map((item) => {
            const label =
              item.category === UNCATEGORIZED_LEAD_CATEGORY
                ? "Sin categoría"
                : getCategoryLabel(item.category);
            return (
              <li
                key={item.category}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-2 py-1 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.hex }}
                  aria-hidden
                />
                <span className="break-words text-xs font-medium text-[#424242] dark:text-[#e0e0e0]">
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
