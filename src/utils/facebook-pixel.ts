/**
 * Helper para eventos del píxel de Meta (Facebook).
 * Usar después de que el píxel base esté cargado en el sitio (p. ej. en el layout o head).
 *
 * Para probar eventos en el Administrador de eventos de Meta:
 * 1. Define NEXT_PUBLIC_META_PIXEL_TEST_EVENT_CODE=TEST75748 en .env.local
 * 2. Deja abierta la página "Probar eventos" en el administrador
 * 3. Navega/registra en el sitio; los eventos aparecerán como prueba
 */

declare global {
  interface Window {
    fbq?: (action: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

const TEST_EVENT_CODE = process.env.NEXT_PUBLIC_META_PIXEL_TEST_EVENT_CODE;

/**
 * Dispara un evento de conversión del píxel de Meta si está disponible.
 * Si NEXT_PUBLIC_META_PIXEL_TEST_EVENT_CODE está definido, se envía test_event_code
 * para que el evento aparezca en "Probar eventos" del administrador.
 * @param eventName - Nombre estándar del evento (ej. 'CompleteRegistration', 'Purchase')
 * @param params - Parámetros opcionales del evento
 */
export function trackFbq(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  const fbq = window.fbq;
  if (typeof fbq !== 'function') return;
  const finalParams =
    TEST_EVENT_CODE != null && TEST_EVENT_CODE !== ''
      ? { ...params, test_event_code: TEST_EVENT_CODE }
      : params;
  fbq('track', eventName, finalParams);
}

/** Dispara el evento "Completar registro" cuando el usuario termina el registro (formulario o Google). */
export function trackCompleteRegistration(): void {
  trackFbq('CompleteRegistration');
}
