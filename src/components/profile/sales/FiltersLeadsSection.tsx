"use client";

import {
  PIPELINE_STATUS,
  PIPELINE_STATUS_COLORS,
  PIPELINE_STATUS_RING,
  PIPELINE_RING_BASE,
  GOOGLE_PLACE_CATEGORIES,
  PLAN_FEATURE_KEYS,
} from "kadesh/components/profile/sales/constants";
import { hasPlanFeature } from "./helpers/plan-features";
import { useSubscription } from "./SubscriptionContext";

const PIPELINE_VALUES = Object.values(PIPELINE_STATUS);

export interface VendedorOption {
  id: string;
  name: string;
  lastName: string | null;
}

interface FiltersLeadsSectionProps {
  selectedPipeline: string | null;
  onPipelineChange: (value: string | null) => void;
  selectedCategory: string | null;
  onCategoryChange: (value: string | null) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  cityQuery: string;
  onCityChange: (value: string) => void;
  stateQuery: string;
  onStateChange: (value: string) => void;
  countryQuery: string;
  onCountryChange: (value: string) => void;
  vendedores?: VendedorOption[];
  assignToVendedorId: string | null;
  onAssignToVendedorChange: (vendedorId: string | null) => void;
  selectedLeadCount: number;
  onAssign: () => void;
  isAssigning: boolean;
  onCancelAssign: () => void;
}

export default function FiltersLeadsSection({
  selectedPipeline,
  onPipelineChange,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  cityQuery,
  onCityChange,
  stateQuery,
  onStateChange,
  countryQuery,
  onCountryChange,
  vendedores = [],
  assignToVendedorId,
  onAssignToVendedorChange,
  selectedLeadCount,
  onAssign,
  isAssigning,
  onCancelAssign,
}: FiltersLeadsSectionProps) {
  const categoryOptions = GOOGLE_PLACE_CATEGORIES;
  const selectedVendedor = vendedores.find((v) => v.id === assignToVendedorId);
  const assignMode = assignToVendedorId != null;
  const { subscription } = useSubscription();

  return (
    <div className="flex flex-col gap-3 ">
      <div className="space-y-4 mb-4">
        <div>
          {(vendedores.length > 0 && hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.ASSIGN_SALES_PERSON)) && (
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="filter-assign-vendedor"
                  className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
                >
                  Asignar leads a
                </label>
                <select
                  id="filter-assign-vendedor"
                  value={assignToVendedorId ?? ""}
                  onChange={(e) => onAssignToVendedorChange(e.target.value || null)}
                  className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-1.5 text-sm text-[#212121] dark:text-[#ffffff] focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[180px]"
                  aria-label="Seleccionar vendedor para asignar leads"
                >
                  <option value="">Seleccionar vendedor...</option>
                  {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>
                      {[v.name, v.lastName].filter(Boolean).join(" ")}
                    </option>
                  ))}
                </select>
                {assignMode && (
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onAssign}
                      disabled={selectedLeadCount === 0 || isAssigning}
                      className="inline-flex px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAssigning
                        ? "Asignando…"
                        : `Asignar ${selectedLeadCount} a ${selectedVendedor?.name ?? ""}`}
                    </button>
                    <button
                      type="button"
                      onClick={onCancelAssign}
                      disabled={isAssigning}
                      className="inline-flex px-3 py-1.5 rounded-lg text-sm font-medium border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0] hover:bg-[#f0f0f0] dark:hover:bg-[#333] disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </span>
                )}
              </div>
            )}
        </div>

        <div className="flex flex-col rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-8 shadow-sm gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="filter-business-name"
                className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
              >
                Empresa
              </label>
              <input
                id="filter-business-name"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nombre..."
                className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-1.5 text-sm text-[#212121] dark:text-[#ffffff] placeholder-[#9ca3af] focus:outline-none min-w-[200px]"
                aria-label="Buscar por nombre de empresa"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="filter-city"
                className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
              >
                Ciudad
              </label>
              <input
                id="filter-city"
                type="search"
                value={cityQuery}
                onChange={(e) => onCityChange(e.target.value)}
                placeholder="Ciudad..."
                className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-1.5 text-sm text-[#212121] dark:text-[#ffffff] placeholder-[#9ca3af] focus:outline-none min-w-[140px]"
                aria-label="Filtrar por ciudad"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="filter-state"
                className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
              >
                Estado
              </label>
              <input
                id="filter-state"
                type="search"
                value={stateQuery}
                onChange={(e) => onStateChange(e.target.value)}
                placeholder="Estado..."
                className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-1.5 text-sm text-[#212121] dark:text-[#ffffff] placeholder-[#9ca3af] focus:outline-none min-w-[140px]"
                aria-label="Filtrar por estado"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="filter-country"
                className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
              >
                País
              </label>
              <input
                id="filter-country"
                type="search"
                value={countryQuery}
                onChange={(e) => onCountryChange(e.target.value)}
                placeholder="País..."
                className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-1.5 text-sm text-[#212121] dark:text-[#ffffff] placeholder-[#9ca3af] focus:outline-none min-w-[140px]"
                aria-label="Filtrar por país"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <label
                htmlFor="filter-category"
                className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
                >
                Categoría
                </label>
                <select
                id="filter-category"
                value={selectedCategory ?? ""}
                onChange={(e) => onCategoryChange(e.target.value || null)}
                className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-1.5 text-sm text-[#212121] dark:text-[#ffffff] focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[180px]"
                aria-label="Filtrar por categoría"
                >
                <option value="">Todas las categorías</option>
                {categoryOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                    {label}
                    </option>
                ))}
                </select>
            </div>
            
          </div>

          {/* Filtro por pipeline */}
          <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onPipelineChange(null)}
            className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedPipeline === null
                ? "bg-orange-500 text-white dark:bg-orange-500 dark:text-white ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-[#1e1e1e]"
                : "bg-[#f0f0f0] text-[#616161] dark:bg-[#2a2a2a] dark:text-[#b0b0b0] hover:bg-[#e5e5e5] dark:hover:bg-[#353535]"
            }`}
          >
            Todos
          </button>
          {PIPELINE_VALUES.map((status) => {
            const isSelected = selectedPipeline === status;
            const colorClass =
              PIPELINE_STATUS_COLORS[status] ??
              "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";
            const ringColor = PIPELINE_STATUS_RING[status] ?? "neutral-500";
            return (
              <button
                key={status}
                type="button"
                onClick={() => onPipelineChange(isSelected ? null : status)}
                className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${colorClass} ${
                  isSelected
                    ? `${PIPELINE_RING_BASE} ring-${ringColor}`
                    : "opacity-90 hover:opacity-100"
                }`}
              >
                {status.replace(/^\d+\s*-\s*/, "")}
              </button>
            );
          })}
          </div>
        </div>

      </div>
    </div>
  );
}
