import { currentPage } from "./clientContext";
import { TRACK_EVENT, trackActivity, type TrackMetadata } from "./track";

/**
 * Errores que solo ve el navegador (el back no se entera): la petición no llegó o volvió con
 * 5xx/413/429 (`network`), la pantalla se cayó (`crash`, error boundary), un error de código
 * suelto que no la tiró (`script`) o no cargó su código tras un despliegue (`chunk`).
 * Llegan a Operaciones → Actividad → Errores como `app.client_error`, con la pantalla del momento.
 *
 * Los errores de GraphQL no se reportan desde aquí: el back ya los registra (`app.error`).
 */

export type ClientErrorKind = "network" | "crash" | "script" | "chunk";

export type ClientErrorReport = {
  kind: ClientErrorKind;
  message: string;
  /** Nombre de la operación GraphQL, si fue una petición. */
  operation?: string | null;
  /** query | mutation */
  opType?: string | null;
  status?: number | null;
  /** Next.js: id del error en el servidor (`error.digest`). */
  digest?: string | null;
  /** Primeras líneas de la pila (sin datos de la persona). */
  stack?: string | null;
};

const MAX_MESSAGE = 200;
const MAX_STACK = 200; // el back recorta cada texto a 200
const STACK_LINES = 5;

function shortStack(stack: string | null | undefined): string | null {
  if (!stack) return null;
  return stack.split("\n").slice(0, STACK_LINES).join("\n").slice(0, MAX_STACK);
}

/**
 * Crawlers y vistas previas de enlaces (Meta, WhatsApp, X, buscadores…) y navegadores headless:
 * abren la página y la cierran a media carga, y lo que les falla no le pasó a una persona. Ojo: el
 * navegador interno de Facebook/Instagram (`FBAN`, `FB_IAB`, `Instagram`) sí es gente y no entra
 * aquí. Los que llegan con un user agent normal desde IPs de Meta los descarta el back
 * (`knownCrawlers` en kadesh-back). Misma lista que kadesh-landing.
 */
const BOT_USER_AGENT =
  /facebookexternalhit|facebookcatalog|facebot|meta-externalagent|meta-externalfetcher|meta-webindexer|whatsapp|twitterbot|slackbot|telegrambot|linkedinbot|discordbot|pinterestbot|googlebot|google-inspectiontool|adsbot-google|mediapartners-google|storebot-google|bingbot|yandexbot|baiduspider|duckduckbot|applebot|petalbot|ahrefsbot|semrushbot|headlesschrome|chrome-lighthouse/i;

/** Bot conocido o navegador controlado por automatización (`navigator.webdriver`). */
export function isAutomatedClient(): boolean {
  if (typeof navigator === "undefined") return false;
  if (navigator.webdriver) return true;
  return BOT_USER_AGENT.test(navigator.userAgent ?? "");
}

export function reportClientError(report: ClientErrorReport) {
  if (typeof window === "undefined") return;
  if (isAutomatedClient()) return;
  const metadata: TrackMetadata = {
    kind: report.kind,
    message: (report.message || "Error desconocido").slice(0, MAX_MESSAGE),
    page: currentPage(),
    online: typeof navigator !== "undefined" ? navigator.onLine : null,
  };
  if (report.operation) metadata.operation = report.operation;
  if (report.opType) metadata.opType = report.opType;
  if (typeof report.status === "number") metadata.status = report.status;
  if (report.digest) metadata.digest = report.digest;
  const stack = shortStack(report.stack);
  if (stack) metadata.stack = stack;
  trackActivity(TRACK_EVENT.CLIENT_ERROR, { metadata });
}

/** El navegador no pudo bajar el código de la pantalla (suele pasar justo después de desplegar). */
export function isChunkLoadError(message: string | null | undefined): boolean {
  return /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
    message ?? "",
  );
}
