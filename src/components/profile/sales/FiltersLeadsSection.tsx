"use client";

import {
  PIPELINE_STATUS,
  PIPELINE_STATUS_COLORS,
  PIPELINE_STATUS_RING,
  PIPELINE_RING_BASE,
  GOOGLE_PLACE_CATEGORIES,
  PLAN_FEATURE_KEYS,
} from "kadesh/constants/constans";
import { hasPlanFeature } from "./helpers/plan-features";
import { useSubscription } from "./SubscriptionContext";
import { Autocomplete, type AutocompleteOption } from "kadesh/components/shared";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

const PIPELINE_VALUES = Object.values(PIPELINE_STATUS);

/** Valores exactos de `TechBusinessLead.source`. Un negocio puede existir como Google y como INEGI. */
const LEAD_SOURCE_FILTER_OPTIONS = [
  { value: "Google Maps", label: "Google Maps" },
  { value: "INEGI", label: "INEGI" },
] as const;

const fieldClass =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-sm text-[#212121] dark:text-white placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

const labelClass =
  "block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5";

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
  selectedSource: string | null;
  onSourceChange: (value: string | null) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  cityQuery: string;
  onCityChange: (value: string) => void;
  stateQuery: string;
  onStateChange: (value: string) => void;
  countryQuery: string;
  onCountryChange: (value: string) => void;
  filterByVendedorId: string | null;
  onFilterByVendedorChange: (vendedorId: string | null) => void;
  vendedores?: VendedorOption[];
  isAdminCompany: boolean;
}

export default function FiltersLeadsSection({
  selectedPipeline,
  onPipelineChange,
  selectedCategory,
  onCategoryChange,
  selectedSource,
  onSourceChange,
  searchQuery,
  onSearchChange,
  cityQuery,
  onCityChange,
  stateQuery,
  onStateChange,
  countryQuery,
  onCountryChange,
  filterByVendedorId,
  onFilterByVendedorChange,
  vendedores = [],
  isAdminCompany,
}: FiltersLeadsSectionProps) {
  const categoryAutocompleteOptions: AutocompleteOption[] =
    GOOGLE_PLACE_CATEGORIES.map((opt) => ({
      id: opt.value,
      label: opt.label,
    }));
  const vendedorFilterOptions: AutocompleteOption[] = [
    { id: "", label: "Todos los vendedores" },
    ...vendedores.map((v) => ({
      id: v.id,
      label: [v.name, v.lastName].filter(Boolean).join(" "),
    })),
    { id: "sin_asignar", label: "Sin asignar" },
  ];
  const { subscription } = useSubscription();
  const showVendedorFilter =
    vendedores.length > 0 &&
    hasPlanFeature(
      subscription?.planFeatures,
      PLAN_FEATURE_KEYS.ASSIGN_SALES_PERSON,
    ) &&
    isAdminCompany;

  const hasActiveFilters =
    selectedPipeline != null ||
    (selectedCategory != null && selectedCategory !== "") ||
    (selectedSource != null && selectedSource !== "") ||
    searchQuery.trim().length > 0 ||
    cityQuery.trim().length > 0 ||
    stateQuery.trim().length > 0 ||
    countryQuery.trim().length > 0 ||
    filterByVendedorId != null;

  const handleClearFilters = () => {
    onPipelineChange(null);
    onCategoryChange(null);
    onSourceChange(null);
    onSearchChange("");
    onCityChange("");
    onStateChange("");
    onCountryChange("");
    onFilterByVendedorChange(null);
  };

  return (
    <div className="rounded-xl border border-orange-200/70 dark:border-orange-900/40 bg-gradient-to-br from-orange-500/[0.07] via-white to-emerald-500/[0.04] dark:from-orange-500/10 dark:via-[#1e1e1e] dark:to-emerald-500/[0.06] p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700/80 dark:text-orange-300/80">
          Filtrar lista
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-orange-700 dark:text-orange-300 hover:bg-orange-500/10 active:scale-[0.97] transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor="filter-business-name" className={labelClass}>
            Empresa
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]">
              <HugeiconsIcon icon={Search01Icon} size={16} />
            </span>
            <input
              id="filter-business-name"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre…"
              className={`${fieldClass} pl-9`}
              aria-label="Buscar por nombre de empresa"
            />
          </div>
        </div>
        <div>
          <label htmlFor="filter-category" className={labelClass}>
            Categoría
          </label>
          <Autocomplete
            id="filter-category"
            label=""
            hideLabel
            value={selectedCategory ?? ""}
            options={categoryAutocompleteOptions}
            onChange={() => {
              // El componente gestiona internamente el texto de búsqueda
            }}
            onSelect={(option) => {
              onCategoryChange(option.id || null);
            }}
            placeholder="Todas las categorías"
          />
        </div>
        <div>
          <label htmlFor="filter-source" className={labelClass}>
            Fuente
          </label>
          <select
            id="filter-source"
            value={selectedSource ?? ""}
            onChange={(e) => onSourceChange(e.target.value || null)}
            className={fieldClass}
            aria-label="Filtrar por fuente"
          >
            <option value="">Todas las fuentes</option>
            {LEAD_SOURCE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-city" className={labelClass}>
            Ciudad
          </label>
          <input
            id="filter-city"
            type="search"
            value={cityQuery}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="Ciudad…"
            className={fieldClass}
            aria-label="Filtrar por ciudad"
          />
        </div>
        <div>
          <label htmlFor="filter-state" className={labelClass}>
            Estado
          </label>
          <input
            id="filter-state"
            type="search"
            value={stateQuery}
            onChange={(e) => onStateChange(e.target.value)}
            placeholder="Estado…"
            className={fieldClass}
            aria-label="Filtrar por estado"
          />
        </div>
        <div>
          <label htmlFor="filter-country" className={labelClass}>
            País
          </label>
          <input
            id="filter-country"
            type="search"
            value={countryQuery}
            onChange={(e) => onCountryChange(e.target.value)}
            placeholder="País…"
            className={fieldClass}
            aria-label="Filtrar por país"
          />
        </div>
        {showVendedorFilter && (
          <div>
            <label htmlFor="filter-sales-person" className={labelClass}>
              Filtrar por vendedor
            </label>
            <Autocomplete
              id="filter-sales-person"
              label=""
              hideLabel
              value={filterByVendedorId ?? ""}
              options={vendedorFilterOptions}
              onChange={() => {
                // Solo reaccionamos a la selección
              }}
              onSelect={(option) => {
                if (!option.id) {
                  onFilterByVendedorChange(null);
                } else {
                  onFilterByVendedorChange(option.id);
                }
              }}
              placeholder="Todos los vendedores"
            />
          </div>
        )}
      </div>

      <div>
        <p className={`${labelClass} mb-2`} id="filter-pipeline-label">
          Estado del pipeline
        </p>
        <div
          role="group"
          aria-labelledby="filter-pipeline-label"
          className="flex flex-wrap gap-1.5"
        >
          <button
            type="button"
            onClick={() => onPipelineChange(null)}
            aria-pressed={selectedPipeline === null}
            className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium transition-[transform,background-color,color,box-shadow,opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:scale-[1.04] active:scale-[0.96] ${
              selectedPipeline === null
                ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30 ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-[#1e1e1e]"
                : "bg-orange-500/10 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200 hover:bg-orange-500/20"
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
                aria-pressed={isSelected}
                className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium transition-[transform,opacity,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:scale-[1.04] hover:opacity-100 active:scale-[0.96] ${colorClass} ${
                  isSelected
                    ? `${PIPELINE_RING_BASE} ring-${ringColor} shadow-sm opacity-100`
                    : "opacity-70"
                }`}
              >
                {status.replace(/^\d+\s*-\s*/, "")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
