/**
 * Controles del Resumen de Kadesh Pet. El valor de cada opción es el de la URL (en español,
 * como el resto de Operaciones) y `api` lo que espera `adminPetSeries` en kadesh-back.
 */

export type PetGranularity = "day" | "week" | "month";

export type PetRangeOption = {
  value: string;
  label: string;
  api: string;
  /** Días hacia atrás para "nuevos en el periodo"; `null` = todo el historial. */
  days: number | null;
};

export const PET_RANGE_OPTIONS: PetRangeOption[] = [
  { value: "30d", label: "30 días", api: "30d", days: 30 },
  { value: "90d", label: "90 días", api: "90d", days: 90 },
  { value: "6m", label: "6 meses", api: "180d", days: 180 },
  { value: "12m", label: "12 meses", api: "365d", days: 365 },
  { value: "todo", label: "Todo", api: "all", days: null },
];

export const PET_DEFAULT_RANGE = "90d";

export const PET_GRANULARITY_OPTIONS: Array<{ value: string; label: string; api: PetGranularity }> = [
  { value: "dia", label: "Día", api: "day" },
  { value: "semana", label: "Semana", api: "week" },
  { value: "mes", label: "Mes", api: "month" },
];

export const PET_DEFAULT_GRANULARITY = "semana";

/** Con barras por día solo caben 90: en rangos más largos "Día" no se ofrece. */
export const PET_MAX_DAY_RANGE = 90;

export const PET_BREAKDOWN_OPTIONS: Array<{ value: string; label: string; api: string }> = [
  { value: "total", label: "Total", api: "none" },
  { value: "estatus", label: "Estatus actual", api: "status" },
  { value: "origen", label: "Origen", api: "origin" },
];

export const PET_PLACE_METRIC_OPTIONS: Array<{ value: string; label: string; api: string; unit: string }> = [
  { value: "altas", label: "Altas", api: "places_created", unit: "fichas nuevas" },
  { value: "reclamadas", label: "Reclamadas", api: "places_claimed", unit: "fichas reclamadas" },
  { value: "verificadas", label: "Verificadas", api: "places_verified", unit: "fichas verificadas" },
];

export const PET_LOCATION_OPTIONS = [
  { value: "estados", label: "Estados" },
  { value: "ciudades", label: "Ciudades" },
] as const;

export const ANIMAL_ORIGIN_LABELS: Record<string, string> = {
  user: "De usuarios",
  admin: "Del admin",
};

export const ANIMAL_ORIGIN_BAR_CLASS: Record<string, string> = {
  user: "bg-orange-500/85 dark:bg-orange-400/80",
  admin: "bg-[#616161] dark:bg-[#9e9e9e]",
};

export const ANIMAL_ORIGIN_ORDER = ["user", "admin"];

/** Estatus que cuentan como "de vuelta en casa" (igual que `HOME_STATUSES` de `petLandingStats`). */
export const ANIMAL_HOME_STATUSES = ["in_family", "adopted"];

export function findOption<T extends { value: string }>(
  options: readonly T[],
  value: string | null,
  fallback: string,
): T {
  return (
    options.find((option) => option.value === value) ??
    options.find((option) => option.value === fallback) ??
    options[0]
  );
}

/** Opciones de agrupación que caben en el rango (sin "Día" si pasa de 90 días o es "Todo"). */
export function granularityOptionsFor(range: PetRangeOption) {
  const dayAllowed = range.days != null && range.days <= PET_MAX_DAY_RANGE;
  return PET_GRANULARITY_OPTIONS.filter((option) => dayAllowed || option.api !== "day");
}

/** % de cambio contra el periodo anterior; `null` si no hay con qué comparar. */
export function changePct(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
