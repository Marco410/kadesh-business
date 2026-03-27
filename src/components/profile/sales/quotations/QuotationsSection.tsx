"use client";

import { useState } from "react";
import QuotationsListPanel from "./QuotationsListPanel";
import QuotationProductsTablePanel from "./QuotationProductsTablePanel";

export interface QuotationsSectionProps {
  userId: string;
}

type QuotationsInnerTab = "cotizaciones" | "productos";

const tabButtonBase =
  "flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e]";

export default function QuotationsSection({ userId }: QuotationsSectionProps) {
  const [activeTab, setActiveTab] = useState<QuotationsInnerTab>("cotizaciones");

  return (
    <div className="space-y-6" data-user-id={userId}>
      <div>
        <h3 className="text-xl font-bold text-[#212121] dark:text-white">
          Cotizaciones
        </h3>
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
          Administra cotizaciones y el catálogo de productos o servicios ofertables.
        </p>
      </div>

      <div
        className="flex flex-col sm:flex-row gap-2 p-1 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525]"
        role="tablist"
        aria-label="Secciones de cotizaciones"
      >
        <button
          type="button"
          role="tab"
          id="tab-cotizaciones"
          aria-selected={activeTab === "cotizaciones"}
          aria-controls="panel-cotizaciones"
          onClick={() => setActiveTab("cotizaciones")}
          className={`${tabButtonBase} ${
            activeTab === "cotizaciones"
              ? "bg-orange-500 text-white shadow-sm"
              : "text-[#616161] dark:text-[#b0b0b0] hover:bg-white/80 dark:hover:bg-[#333]"
          }`}
        >
          Cotizaciones
        </button>
        <button
          type="button"
          role="tab"
          id="tab-productos"
          aria-selected={activeTab === "productos"}
          aria-controls="panel-productos"
          onClick={() => setActiveTab("productos")}
          className={`${tabButtonBase} ${
            activeTab === "productos"
              ? "bg-orange-500 text-white shadow-sm"
              : "text-[#616161] dark:text-[#b0b0b0] hover:bg-white/80 dark:hover:bg-[#333]"
          }`}
        >
          Productos / Servicios
        </button>
      </div>

      {activeTab === "cotizaciones" && (
        <QuotationsListPanel userId={userId} />
      )}

      {activeTab === "productos" && (
        <QuotationProductsTablePanel userId={userId} />
      )}
    </div>
  );
}
