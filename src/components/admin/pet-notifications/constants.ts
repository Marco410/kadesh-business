import type { ZoneWhatsappState } from "./queries";

export const NOTIFICATIONS_PAGE_SIZE = 25;
export const ZONE_ALERTS_PAGE_SIZE = 25;

/** Mismos valores que `NOTIFICATION_TYPE` en kadesh-back (`models/Notification/constants.ts`). */
export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  "animal.created": "Animal nuevo (a admins)",
  "animal.nearby": "Alerta de zona",
  "animal.commented": "Comentario en su reporte",
  "animal.duplicate_reported": "Reporte repetido",
  "animal.possible_match": "Posible coincidencia",
  "animal.claim_requested": "Solicitud de reporte",
  "animal.claim_approved": "Solicitud aceptada",
  "animal.claim_rejected": "Solicitud rechazada",
  "animal.merged": "Reporte unido",
  "petplace.service_requested": "Servicio solicitado",
  "event.nearby": "Evento en su zona",
  "event.reminder": "Recordatorio de evento",
  "event.submitted": "Evento por revisar (a admins)",
  "event.approved": "Evento aprobado",
  "event.rejected": "Evento rechazado",
  "event.cancelled": "Evento cancelado",
  "event.updated": "Evento con cambios",
  "user.bank_details_updated": "Datos bancarios",
  "pet.reminder_due": "Recordatorio de cartilla",
  "rescue.submitted": "Espacio de rescate por verificar (a admins)",
  "rescue.verified": "Espacio de rescate verificado",
  "rescue.rejected": "Espacio de rescate rechazado",
  "rescue.member_added": "Agregado a un espacio de rescate",
  "pet.adoption_completed": "Adopción completada",
  "adoption.application_received": "Solicitud de adopción recibida",
  "adoption.application_updated": "Solicitud de adopción actualizada",
  "pet.transfer_redeemed": "Mascota recibida con código",
  "security.alert": "Alerta de seguridad",
};

export function notificationTypeLabel(type: string) {
  return NOTIFICATION_TYPE_LABELS[type] ?? type;
}

export type NotificationChannelFilter = "todos" | "push" | "whatsapp";
export type NotificationResultFilter = "todos" | "entregados" | "fallidos" | "omitidos";
export type NotificationDaysFilter = "1" | "7" | "30" | "90";

export const CHANNEL_FILTER_OPTIONS: Array<{ value: NotificationChannelFilter; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "push", label: "Push" },
  { value: "whatsapp", label: "WhatsApp" },
];

export const CHANNEL_FILTER_API: Record<NotificationChannelFilter, string | null> = {
  todos: null,
  push: "push",
  whatsapp: "whatsapp",
};

export const RESULT_FILTER_OPTIONS: Array<{ value: NotificationResultFilter; label: string; dot?: string }> = [
  { value: "todos", label: "Todos" },
  { value: "entregados", label: "Entregados", dot: "bg-green-500" },
  { value: "fallidos", label: "Fallidos", dot: "bg-red-500" },
  { value: "omitidos", label: "No se mandaron", dot: "bg-dash-faint" },
];

export const RESULT_FILTER_API: Record<NotificationResultFilter, string | null> = {
  todos: null,
  entregados: "delivered",
  fallidos: "failed",
  omitidos: "skipped",
};

export const DAYS_FILTER_OPTIONS: Array<{ value: NotificationDaysFilter; label: string }> = [
  { value: "1", label: "24 h" },
  { value: "7", label: "7 días" },
  { value: "30", label: "30 días" },
  { value: "90", label: "90 días" },
];

type Tone = "neutral" | "ok" | "warning" | "danger" | "accent";

export const PUSH_STATUS: Record<string, { label: string; tone: Tone }> = {
  sent: { label: "Push enviado", tone: "ok" },
  partial: { label: "Push a algunos", tone: "warning" },
  failed: { label: "Push falló", tone: "danger" },
  no_devices: { label: "Sin app", tone: "neutral" },
};

export const WHATSAPP_STATUS: Record<string, { label: string; tone: Tone }> = {
  skipped: { label: "WhatsApp: no se mandó", tone: "neutral" },
  accepted: { label: "WhatsApp: aceptado", tone: "accent" },
  sent: { label: "WhatsApp: enviado", tone: "accent" },
  delivered: { label: "WhatsApp: entregado", tone: "ok" },
  read: { label: "WhatsApp: leído", tone: "ok" },
  failed: { label: "WhatsApp: falló", tone: "danger" },
};

/** Motivo de `skipped` (kadesh-back: `WHATSAPP_SKIP_REASON`). */
export const WHATSAPP_SKIP_LABELS: Record<string, string> = {
  sin_optin: "no activó los avisos por WhatsApp",
  sin_telefono: "no tiene teléfono",
  telefono_invalido: "su teléfono no sirve para WhatsApp",
  silenciado: "silenció este tipo de aviso",
  sin_configuracion: "falta configurar el número de Kadesh",
};

export function whatsappDetailLabel(status: string | null, detail: string | null) {
  if (!detail) return null;
  return status === "skipped" ? WHATSAPP_SKIP_LABELS[detail] ?? detail : detail;
}

export type ZoneStatusFilter = "todas" | "activas" | "apagadas";

export const ZONE_STATUS_OPTIONS: Array<{ value: ZoneStatusFilter; label: string; dot?: string }> = [
  { value: "activas", label: "Activas", dot: "bg-green-500" },
  { value: "apagadas", label: "Apagadas", dot: "bg-dash-faint" },
  { value: "todas", label: "Todas" },
];

export const ZONE_STATUS_API: Record<ZoneStatusFilter, string> = {
  todas: "all",
  activas: "active",
  apagadas: "inactive",
};

export const ZONE_WHATSAPP: Record<ZoneWhatsappState, { label: string; tone: Tone }> = {
  on: { label: "WhatsApp", tone: "ok" },
  off: { label: "Sin WhatsApp", tone: "neutral" },
  no_phone: { label: "WhatsApp sin teléfono", tone: "warning" },
  muted: { label: "WhatsApp silenciado", tone: "neutral" },
};

/** Enlace a Google Maps del centro de la zona. */
export function mapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/**
 * Lee un punto escrito o pegado: «19.7027, -101.1923», o un enlace de Google Maps
 * (`…/@19.7027,-101.1923,15z` o `…?q=19.7027,-101.1923`). null si no es válido.
 */
export function parseLatLng(text: string): { lat: number; lng: number } | null {
  const match = /(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/.exec(text.trim());
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

export function formatPoint(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return "";
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
