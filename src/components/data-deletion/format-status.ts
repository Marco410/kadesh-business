import type { DataDeletionStatus } from "./fetch-status";

const STATUS_LABEL: Record<DataDeletionStatus, string> = {
  pending: "En proceso",
  completed: "Completada",
  failed: "Fallida",
};

const mexicoCityDate = new Intl.DateTimeFormat("es-MX", {
  timeZone: "America/Mexico_City",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function statusLabel(status: DataDeletionStatus): string {
  return STATUS_LABEL[status];
}

/** Fecha ISO en es-MX, zona America/Mexico_City. `null` si no es parseable. */
export function formatMexicoCityDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return mexicoCityDate.format(date);
}
