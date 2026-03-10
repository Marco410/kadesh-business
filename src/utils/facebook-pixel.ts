/**
 * Helper para eventos del píxel de Meta (Facebook).
 * Usar después de que el píxel base esté cargado en el sitio (p. ej. en el layout o head).
 */

declare global {
  interface Window {
    fbq?: (action: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

/**
 * Dispara un evento de conversión del píxel de Meta si está disponible.
 * @param eventName - Nombre estándar del evento (ej. 'CompleteRegistration', 'Purchase')
 * @param params - Parámetros opcionales del evento
 */
export function trackFbq(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  const fbq = window.fbq;
  if (typeof fbq === 'function') {
    fbq('track', eventName, params);
  }
}

/** Dispara el evento "Completar registro" cuando el usuario termina el registro (formulario o Google). */
export function trackCompleteRegistration(): void {
  trackFbq('CompleteRegistration');
}
