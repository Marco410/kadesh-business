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
 * Query param para conversiones personalizadas de Meta.
 * En Events Manager: regla "URL contiene registro-exitoso".
 */
export const META_REGISTER_SUCCESS_QUERY_KEY = 'registro-exitoso';

/** Marca la URL actual como registro exitoso (sin recargar la página). */
export function setRegisterSuccessUrl(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set(META_REGISTER_SUCCESS_QUERY_KEY, '1');
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

/** Ruta con el identificador de registro exitoso (p. ej. `/panel?registro-exitoso=1`). */
export function withRegisterSuccessUrl(path: string): string {
  const base =
    typeof window !== 'undefined' ? window.location.origin : 'https://www.kadesh.com.mx';
  const url = new URL(path, base);
  url.searchParams.set(META_REGISTER_SUCCESS_QUERY_KEY, '1');
  return `${url.pathname}${url.search}`;
}

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
