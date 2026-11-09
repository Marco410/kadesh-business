/**
 * Token de sesión de Keystone en el navegador. Es la única sesión que ve el back desde la web: la
 * API vive en otro sitio (`*.up.railway.app`), así que su cookie `keystonejs-session` (SameSite=Lax)
 * no viaja con las peticiones. Sin este token, `authenticatedItem` siempre responde `null`.
 */
export const SESSION_TOKEN_KEY = "keystonejs-session-token";

export function readSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function hasSessionToken(): boolean {
  return Boolean(readSessionToken());
}
