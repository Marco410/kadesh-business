import { PET_PLACE_PUBLIC_ORIGIN } from "kadesh/components/admin/constants";

/** Mismos valores que `PET_EVENT_STATUS` en kadesh-back (`models/Pet/PetEvent/constants.ts`). */
export const PET_EVENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export type PetEventStatus = (typeof PET_EVENT_STATUS)[keyof typeof PET_EVENT_STATUS];

export const PET_EVENT_STATUS_LABELS: Record<string, string> = {
  [PET_EVENT_STATUS.PENDING]: "En revisión",
  [PET_EVENT_STATUS.APPROVED]: "Publicado",
  [PET_EVENT_STATUS.REJECTED]: "Rechazado",
  [PET_EVENT_STATUS.CANCELLED]: "Cancelado",
};

export const PET_EVENT_STATUS_TONE: Record<string, "neutral" | "ok" | "warning" | "danger"> = {
  [PET_EVENT_STATUS.PENDING]: "warning",
  [PET_EVENT_STATUS.APPROVED]: "ok",
  [PET_EVENT_STATUS.REJECTED]: "danger",
  [PET_EVENT_STATUS.CANCELLED]: "neutral",
};

/** Chips de la lista, en este orden. Default: Pendientes. */
export const PET_EVENT_STATUS_FILTERS: Array<{ value: PetEventStatus; label: string }> = [
  { value: PET_EVENT_STATUS.PENDING, label: "Pendientes" },
  { value: PET_EVENT_STATUS.APPROVED, label: "Publicados" },
  { value: PET_EVENT_STATUS.REJECTED, label: "Rechazados" },
  { value: PET_EVENT_STATUS.CANCELLED, label: "Cancelados" },
];

/** Mismas etiquetas que `PET_EVENT_CATEGORY_OPTIONS` en kadesh-back. */
export const PET_EVENT_CATEGORY_LABELS: Record<string, string> = {
  esterilizacion: "Esterilización",
  vacunacion: "Vacunación",
  adopcion: "Adopción",
  desparasitacion: "Desparasitación",
  consulta: "Consulta / jornada médica",
  colecta: "Colecta / acopio",
  voluntariado: "Voluntariado",
  taller: "Taller / plática",
  otro: "Otro",
};

export const PET_EVENT_SPECIES_LABELS: Record<string, string> = {
  dog: "Perros",
  cat: "Gatos",
  other: "Otros",
};

export const PET_EVENT_SCOPE = {
  ZONE: "zone",
  CITY: "city",
  STATE: "state",
  NATIONAL: "national",
} as const;

/** "Zona de 10 km", "Municipio", "Estado" o "Nacional". */
export function petEventScopeLabel(scope: string | null, reachKm: number | null): string {
  if (scope === PET_EVENT_SCOPE.CITY) return "Municipio";
  if (scope === PET_EVENT_SCOPE.STATE) return "Estado";
  if (scope === PET_EVENT_SCOPE.NATIONAL) return "Nacional";
  return reachKm ? `Zona de ${reachKm} km` : "Zona";
}

/** El rechazo pide motivo (le llega a quien lo publicó); mismo mínimo que `reviewPetEvent`. */
export const REVIEW_NOTE_MIN = 5;
export const REVIEW_NOTE_MAX = 500;
export const CANCEL_REASON_MAX = 500;

export const ADMIN_EVENTS_PAGE_SIZE = 20;

export const DEFAULT_EVENT_TIME_ZONE = "America/Mexico_City";

/** Ficha pública en Kadesh Pet (kadesh-landing). Solo existe si el evento llegó a publicarse. */
export function petEventPublicUrl(slug: string): string {
  return `${PET_PLACE_PUBLIC_ORIGIN}/eventos/${encodeURIComponent(slug)}`;
}

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/** WhatsApp de registro (10 dígitos en México) → enlace de wa.me con lada 52. */
export function whatsappUrl(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits.length === 10 ? `52${digits}` : digits}`;
}

/** `true` si la fecha ya pasó (una fecha que terminó, o todas las del evento con `lastEndsAt`). */
export function hasEnded(value: string | null | undefined): boolean {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time < Date.now();
}

function formatter(timeZone: string | null, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat("es-MX", { ...options, timeZone: timeZone || DEFAULT_EVENT_TIME_ZONE });
  } catch {
    return new Intl.DateTimeFormat("es-MX", { ...options, timeZone: DEFAULT_EVENT_TIME_ZONE });
  }
}

const DAY_OPTIONS: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
const DAY_YEAR_OPTIONS: Intl.DateTimeFormatOptions = { ...DAY_OPTIONS, year: "numeric" };
const TIME_OPTIONS: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

/** "sáb, 15 nov, 10:00" en la zona horaria del evento (la de su estado). */
export function formatEventDate(value: string | null | undefined, timeZone: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${formatter(timeZone, DAY_OPTIONS).format(date)}, ${formatter(timeZone, TIME_OPTIONS).format(date)}`;
}

/**
 * Una fecha del evento: "sáb, 15 nov 2026 · 10:00–14:00" o, si dura varios días,
 * "sáb, 15 nov 2026 10:00 → dom, 16 nov 2026 14:00". Siempre en la zona del evento.
 */
export function formatEventSession(
  startsAt: string | null,
  endsAt: string | null,
  timeZone: string | null,
): string {
  if (!startsAt) return "—";
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return "—";
  const day = formatter(timeZone, DAY_YEAR_OPTIONS);
  const time = formatter(timeZone, TIME_OPTIONS);
  const end = endsAt ? new Date(endsAt) : null;
  if (!end || Number.isNaN(end.getTime())) return `${day.format(start)} · ${time.format(start)}`;
  if (day.format(start) === day.format(end)) {
    return `${day.format(start)} · ${time.format(start)}–${time.format(end)}`;
  }
  return `${day.format(start)} ${time.format(start)} → ${day.format(end)} ${time.format(end)}`;
}
