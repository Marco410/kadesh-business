const SESSION_TOKEN_KEY = 'keystonejs-session-token';
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Guarda el token sellado que devuelve Keystone (contraseña o Google).
 * localStorage es la vía que de verdad autentica: el apollo-client lo manda
 * como `Authorization: Bearer` y la cookie httpOnly del backend no viaja
 * cross-site hacia el API.
 */
export function persistSessionToken(sessionToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
  const expires = new Date();
  expires.setTime(expires.getTime() + SESSION_MAX_AGE_MS);
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `keystonejs-session=${sessionToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

/** Param del login que dice por qué terminó la sesión (`?sesion=expired`). Lo pone `SessionEndedListener`. */
export const SESSION_ENDED_PARAM = 'sesion';

/** Aviso del login cuando Kadesh sacó a la persona del panel (motivo que manda el back). */
export function sessionEndedMessage(status: string | null | undefined): string | null {
  if (!status) return null;
  if (status === 'suspended') {
    return 'Tu acceso a Kadesh está suspendido. Escríbenos a contacto@kadesh.com.mx para revisarlo.';
  }
  if (status === 'anonymized') return 'Esta cuenta ya no está disponible.';
  return 'Tu sesión expiró. Vuelve a iniciar sesión.';
}
