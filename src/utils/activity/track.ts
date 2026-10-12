/**
 * Registro de uso del panel (`trackEvents` en kadesh-back → `ActivityEvent` / `UserActivityDay`).
 *
 * Junta los eventos y los manda en lote cada 10 s, al ocultar la pestaña o al salir.
 * Usa `fetch` con `keepalive` en vez de Apollo: es lo único que sigue enviando cuando la
 * página se cierra (y `sendBeacon` no deja mandar el header `Authorization`).
 * Nunca lanza ni bloquea la UI: si falla, el evento se pierde.
 */

import { notifySessionEnded, readSessionEndNotice } from "kadesh/utils/session-ended";

const SESSION_TOKEN_KEY = "keystonejs-session-token";
/** Marca de "entrar como" (src/components/impersonation): lo que hace el admin no es uso del cliente. */
const IMPERSONATION_INFO_KEY = "kadesh-impersonation";
const FLUSH_MS = 10_000;
const MAX_BATCH = 50;

const TRACK_EVENTS_MUTATION = `
  mutation TrackEvents($events: [TrackEventInput!]!) {
    trackEvents(events: $events) {
      accepted
    }
  }
`;

/** Tipos que acepta el back (ver `CLIENT_EVENT_TYPES` en kadesh-back). */
export const TRACK_EVENT = {
  SECTION_VIEWED: "ui.section_viewed",
  FEATURE_LOCKED_VIEWED: "ui.feature_locked_viewed",
  UPGRADE_CLICKED: "ui.upgrade_clicked",
  TOUR_COMPLETED: "ui.tour_completed",
  TOUR_SKIPPED: "ui.tour_skipped",
  LEADS_EXPORTED: "lead.exported",
  LOGOUT: "auth.logout",
  HEARTBEAT: "auth.heartbeat",
  /** Solo admin de plataforma: registro de qué datos de clientes abrió. */
  ADMIN_VIEWED_COMPANY: "admin.viewed_company",
  ADMIN_VIEWED_PERSON: "admin.viewed_person",
  ADMIN_VIEWED_AI_PROMPT: "admin.viewed_ai_prompt",
} as const;

export type TrackEventType = (typeof TRACK_EVENT)[keyof typeof TRACK_EVENT];

/** Datos chicos y planos. Nada personal: ni nombres de leads, ni teléfonos, ni textos libres. */
export type TrackMetadata = Record<string, string | number | boolean | null>;

type QueuedEvent = {
  type: TrackEventType;
  metadata?: TrackMetadata;
  entityType?: string;
  entityId?: string;
  companyId?: string;
  occurredAt: string;
};

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

/**
 * El mismo evento dos veces en este lapso cuenta una. Evita duplicados cuando un componente se
 * monta dos veces (StrictMode en desarrollo) o se vuelve a renderizar al cargar sus datos.
 */
const DEDUPE_MS = 3_000;
const recent = new Map<string, number>();

function isRepeated(key: string, now: number) {
  for (const [k, at] of recent) {
    if (now - at > DEDUPE_MS) recent.delete(k);
  }
  if (recent.has(key)) return true;
  recent.set(key, now);
  return false;
}

function isImpersonating(): boolean {
  try {
    return Boolean(window.localStorage.getItem(IMPERSONATION_INFO_KEY));
  } catch {
    return false;
  }
}

function readToken(): string | null {
  try {
    return window.localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

function send(events: QueuedEvent[], keepalive: boolean) {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const token = readToken();
  if (!url || !token || events.length === 0) return;
  fetch(url, {
    method: "POST",
    keepalive,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: TRACK_EVENTS_MUTATION, variables: { events } }),
  })
    // El latido llega aunque nadie toque el panel: también sirve para notar que la sesión terminó.
    .then((response) => (keepalive ? null : response.json()))
    .then((result) => {
      const notice = readSessionEndNotice(result?.extensions);
      if (notice) notifySessionEnded(notice);
    })
    .catch(() => {
      // Registro de uso: si no llega, no pasa nada.
    });
}

/** Manda lo pendiente ya. `keepalive` para cuando la página se está cerrando. */
export function flushActivity(options: { keepalive?: boolean } = {}) {
  if (typeof window === "undefined") return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  while (queue.length > 0) {
    send(queue.splice(0, MAX_BATCH), options.keepalive ?? false);
  }
}

function listenForPageExit() {
  if (listening) return;
  listening = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushActivity({ keepalive: true });
  });
  window.addEventListener("pagehide", () => flushActivity({ keepalive: true }));
}

export function trackActivity(
  type: TrackEventType,
  data: { metadata?: TrackMetadata; entityType?: string; entityId?: string; companyId?: string } = {},
) {
  if (typeof window === "undefined" || isImpersonating()) return;
  const key = JSON.stringify([type, data.metadata ?? null, data.entityId ?? null, data.companyId ?? null]);
  if (isRepeated(key, Date.now())) return;
  listenForPageExit();
  queue.push({ type, ...data, occurredAt: new Date().toISOString() });
  if (queue.length >= MAX_BATCH) {
    flushActivity();
    return;
  }
  if (!timer) timer = setTimeout(() => flushActivity(), FLUSH_MS);
}

/**
 * Para el logout: registra la salida y la manda en el momento, antes de borrar el token.
 * El token se lee al armar la petición, así que hay que llamarla primero.
 */
export function trackLogout() {
  if (typeof window === "undefined") return;
  queue.push({ type: TRACK_EVENT.LOGOUT, occurredAt: new Date().toISOString() });
  flushActivity({ keepalive: true });
}
