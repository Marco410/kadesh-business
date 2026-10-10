import {
  PIPELINE_STATUS,
  QUOTATION_STATUS_COLORS,
  QUOTATION_STATUS_OPTIONS,
} from "kadesh/constants/constans";

const PIPELINE_ORDER: string[] = Object.values(PIPELINE_STATUS);

/** "01 - Detectado" → "Detectado". */
export function pipelineLabel(status: string | null | undefined): string {
  if (!status) return "Sin etapa";
  return status.replace(/^\d+\s*-\s*/, "");
}

/** Ordena conteos por el orden del pipeline (las etapas desconocidas al final). */
export function sortByPipeline<T extends { key: string }>(rows: T[]): T[] {
  const index = (key: string) => {
    const i = PIPELINE_ORDER.indexOf(key);
    return i === -1 ? PIPELINE_ORDER.length : i;
  };
  return [...rows].sort((a, b) => index(a.key) - index(b.key));
}

export function quotationStatusLabel(status: string | null | undefined): string {
  return QUOTATION_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status ?? "—";
}

export function quotationStatusClass(status: string | null | undefined): string {
  return (
    (status && (QUOTATION_STATUS_COLORS as Record<string, string>)[status]) ??
    "bg-[#e0e0e0] text-[#616161] dark:bg-[#3a3a3a] dark:text-[#b0b0b0]"
  );
}

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month - 1] ?? month} ${year}`;
}

/** Junta una serie diaria en barras semanales (de la más vieja a la más nueva). */
export function weeklyBuckets(days: Array<{ date: string; value: number }>) {
  const buckets: Array<{ weekStart: string; label: string; count: number }> = [];
  for (let i = days.length; i > 0; i -= 7) {
    const chunk = days.slice(Math.max(0, i - 7), i);
    if (!chunk.length) continue;
    const start = chunk[0].date;
    const date = new Date(`${start}T12:00:00`);
    buckets.unshift({
      weekStart: start,
      label: date.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
      count: chunk.reduce((sum, day) => sum + day.value, 0),
    });
  }
  return buckets;
}

/** Días transcurridos desde una fecha (para alertas de inactividad). */
export function daysSince(value: string | null | undefined): number | null {
  if (!value) return null;
  const ms = Date.now() - new Date(value).getTime();
  return Number.isFinite(ms) ? Math.floor(ms / 86_400_000) : null;
}

/** Días que faltan para una fecha `YYYY-MM-DD` (negativo si ya pasó). */
export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null;
  const target = new Date(value.includes("T") ? value : `${value}T23:59:59`);
  const ms = target.getTime() - Date.now();
  return Number.isFinite(ms) ? Math.ceil(ms / 86_400_000) : null;
}

export function stripeCustomerUrl(customerId: string): string {
  return `https://dashboard.stripe.com/customers/${customerId}`;
}
