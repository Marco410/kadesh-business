import { onError } from "@apollo/client/link/error";
import { getMainDefinition } from "@apollo/client/utilities";
import { reportClientError } from "./reportClientError";

/**
 * Interceptor de errores de Apollo. Reporta a Actividad solo lo que el back no vio:
 * - la petición no llegó (sin red, CORS, back caído) o la respuesta no era JSON;
 * - el back o el proxy respondieron 5xx, 413 (archivo muy grande) o 429.
 *
 * Los errores de GraphQL (400 con `errors`, o 200 con `errors`) ya los guarda el back como
 * `app.error`, con la misma app, pantalla, IP y navegador (van en los headers de la petición).
 *
 * Límites contra abuso (`RATE_LIMITED`) e IP bloqueada (`IP_BLOCKED`): se muestra el mensaje del
 * back en un aviso, una vez cada 30 s, porque muchas pantallas solo muestran un texto genérico.
 */

const TRACK_OPERATION = "TrackEvents";
const BLOCKING_CODES = new Set(["RATE_LIMITED", "IP_BLOCKED"]);
const NOTICE_EVERY_MS = 30_000;
let lastNoticeAt = 0;

/** Aviso con el mensaje del back. `sileo` se carga aquí para no meterlo al render del servidor. */
function showBlockingNotice(message: string) {
  const now = Date.now();
  if (now - lastNoticeAt < NOTICE_EVERY_MS) return;
  lastNoticeAt = now;
  void import("sileo")
    .then(({ sileo }) => sileo.error({ title: message }))
    .catch(() => undefined);
}

function operationType(query: Parameters<typeof getMainDefinition>[0]): string | null {
  try {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" ? definition.operation : null;
  } catch {
    return null;
  }
}

function shouldReport(error: Error & { statusCode?: number }): boolean {
  if (error.name === "AbortError") return false;
  if (error.name === "ServerParseError") return true;
  const status = error.statusCode;
  if (typeof status !== "number") return true;
  return status >= 500 || status === 413 || status === 429;
}

export const requestErrorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (typeof window === "undefined") return;
  const blocking = graphQLErrors?.find((error) =>
    BLOCKING_CODES.has(String(error.extensions?.code ?? "")),
  );
  if (blocking) {
    showBlockingNotice(blocking.message);
    return;
  }
  if (!networkError) return;
  if (operation.operationName === TRACK_OPERATION) return;
  const error = networkError as Error & { statusCode?: number };
  if (!shouldReport(error)) return;
  reportClientError({
    kind: "network",
    message: error.message,
    operation: operation.operationName || null,
    opType: operationType(operation.query),
    status: typeof error.statusCode === "number" ? error.statusCode : null,
  });
});
