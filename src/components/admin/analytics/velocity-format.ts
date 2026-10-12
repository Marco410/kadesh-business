/** Formatos de velocidad comercial (Analítica → Ventas y tarjeta del 360). */

export const formatRate = (rate: number | null | undefined) =>
  rate == null ? "—" : `${Math.round(rate * 100)}%`;

export const formatShare = (part: number, total: number) =>
  total ? `${Math.round((part / total) * 100)}%` : "—";

export function formatHours(hours: number | null | undefined): string {
  if (hours == null) return "—";
  if (hours < 1) return "menos de 1 h";
  if (hours < 48) return `${Math.round(hours)} h`;
  return formatDays(hours / 24);
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes == null) return "—";
  if (minutes < 1) return "menos de 1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  return formatHours(minutes / 60);
}

export function formatDays(days: number | null | undefined): string {
  if (days == null) return "—";
  if (days < 1) return "menos de 1 día";
  const rounded = days < 10 ? Math.round(days * 10) / 10 : Math.round(days);
  return `${rounded} día${rounded === 1 ? "" : "s"}`;
}
