  export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = nowMidnight.getTime() - dateMidnight.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const formatTime = (d: Date) => {
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    if (diffDays === 0) {
      return `Hoy a las ${formatTime(date)}`;
    }
    if (diffDays === 1) {
      return 'Ayer';
    }
    if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    }
    if (diffDays < 30) {
      const weeks = Math.round(diffDays / 7);
      return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
    }

    // Diferencia real en meses de calendario (más preciso que diffDays/30)
    let months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    if (now.getDate() < date.getDate()) months -= 1;
    if (months < 0) months = 0;

    // ~30 días pero menos de 1 mes natural: redondear a "Hace 1 mes"
    if (months === 0 && diffDays >= 28) {
      months = 1;
    }

    if (months >= 12) {
      const years = Math.floor(months / 12);
      return years === 1 ? 'Hace 1 año' : `Hace ${years} años`;
    }
    return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
  };

  export const formatDateWithDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  export const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  export function formatDateShort(value: string | null | undefined, showHours: boolean = true): string {
    if (!value) return "—";
    const iso = value.includes("T") ? value : `${value.slice(0, 10)}T12:00:00`;
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: showHours ? "2-digit" : undefined,
      minute: showHours ? "2-digit" : undefined,
    });
  }

/*
 * Fechas que se pintan en el servidor y en el navegador (blog, páginas con SSR). El servidor corre
 * en UTC (Cloudflare Workers) y la gente en México: con `toLocaleDateString` sin zona, una fecha de
 * la noche (18:00–24:00 en México) sale con otro día en cada lado y React falla al hidratar (#418).
 * Aquí siempre es hora de la Ciudad de México, igual en los dos lados.
 *
 * Intl solo da los números del día en esa zona; los nombres de los meses son nuestros para que el
 * texto no cambie entre motores (V8 en Workers, Chrome, Safari) ni versiones de ICU.
 */
export const DISPLAY_TIME_ZONE = "America/Mexico_City";

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const mexicoDayParts = new Intl.DateTimeFormat("es-MX", {
  timeZone: DISPLAY_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

type DateInput = string | number | Date | null | undefined;

/** Día, mes (1–12) y año de esa fecha en la Ciudad de México; `null` si no es válida. */
function mexicoDay(value: DateInput): { year: number; month: number; day: number } | null {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  let year = 0;
  let month = 0;
  let day = 0;
  for (const part of mexicoDayParts.formatToParts(date)) {
    if (part.type === "year") year = Number(part.value);
    else if (part.type === "month") month = Number(part.value);
    else if (part.type === "day") day = Number(part.value);
  }
  return year && month && day ? { year, month, day } : null;
}

/** "9 de noviembre de 2026", en hora de México. Vacío si la fecha no es válida. */
export function formatLongDateMx(value: DateInput): string {
  const d = mexicoDay(value);
  return d ? `${d.day} de ${MONTHS[d.month - 1]} de ${d.year}` : "";
}

/** "9 nov 2026", en hora de México. Vacío si la fecha no es válida. */
export function formatShortDateMx(value: DateInput): string {
  const d = mexicoDay(value);
  return d ? `${d.day} ${MONTHS_SHORT[d.month - 1]} ${d.year}` : "";
}

/** "2026-11-09": el día en México, para comparar si dos fechas caen el mismo día. */
export function dayKeyMx(value: DateInput): string {
  const d = mexicoDay(value);
  return d ? `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}` : "";
}

/** Año en curso en México (pie de página). */
export function currentYearMx(): number {
  return mexicoDay(new Date())?.year ?? new Date().getUTCFullYear();
}