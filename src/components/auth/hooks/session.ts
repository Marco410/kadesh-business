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
