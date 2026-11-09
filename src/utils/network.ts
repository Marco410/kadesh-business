/**
 * Red y ciclo de vida de la página, para decidir si una petición fallida se reintenta o se reporta.
 *
 * Una petición que falla mientras la página se va, con la pestaña oculta o sin red no es una falla
 * del back: la cortó el navegador ("Failed to fetch" en Chrome, "Load failed" en Safari).
 */

let leaving = false;
let watching = false;

/**
 * Marca cuando la página se va (`pagehide`: cerrar la pestaña, recargar o navegar fuera; llega
 * antes de que el navegador corte las peticiones, también en iOS). `pageshow` la vuelve a marcar
 * como activa si regresa del bfcache. No se usa `beforeunload`: en Firefox saca a la página del
 * bfcache, y `pagehide` cubre los mismos casos. Se llama una vez al crear el cliente de Apollo.
 */
export function watchPageLifecycle() {
  if (watching || typeof window === "undefined") return;
  watching = true;
  window.addEventListener("pagehide", () => {
    leaving = true;
  });
  window.addEventListener("pageshow", () => {
    leaving = false;
  });
}

export function isPageLeaving(): boolean {
  return leaving;
}

export function isPageHidden(): boolean {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** El navegador no puede reportar con sentido una falla de red: se va, está oculta o sin red. */
export function isNetworkFailureExpected(): boolean {
  return isPageLeaving() || isPageHidden() || isOffline();
}

/** La petición se canceló a propósito (se desmontó la pantalla, cambió de ruta, otra la reemplazó). */
export function isAbortError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && (error as { name?: string }).name === "AbortError");
}

/** El proxy o el back no respondieron a tiempo: vale la pena reintentar. */
const RETRYABLE_STATUS = new Set([502, 503, 504]);

/**
 * Error de red que vale la pena reintentar: la petición no llegó (sin `statusCode`: "Failed to
 * fetch", "Load failed", "NetworkError…") o el proxy respondió 502/503/504. Nunca una cancelación,
 * ni un 4xx o 500 (repetirlo da lo mismo), ni un 429 (reintentar empeora el límite).
 */
export function isRetryableNetworkError(error: unknown): boolean {
  if (!error || typeof error !== "object" || isAbortError(error)) return false;
  const status = (error as { statusCode?: unknown }).statusCode;
  return typeof status === "number" ? RETRYABLE_STATUS.has(status) : true;
}
