function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** `YYYY-MM-DD` en hora local del navegador (las celdas del calendario son locales). */
export function localDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatEventTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/** Valor para `<input type="datetime-local">` a partir de un ISO. */
export function toDateTimeLocalValue(iso: string): string {
  const d = new Date(iso);
  return `${localDateKey(iso)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Rango a consultar en Google para el mes visible: el mes completo más una semana de
 * margen a cada lado (la cuadrícula muestra días de meses vecinos).
 */
export function visibleRange(month: Date): { timeMin: string; timeMax: string } {
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - 7);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 1 + 7);
  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}
