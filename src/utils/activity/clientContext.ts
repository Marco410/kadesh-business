/**
 * De dónde sale cada petición al back: qué app es y en qué pantalla estaba la persona. Va en los
 * headers `x-kadesh-app` y `x-kadesh-page` (Apollo y `trackEvents`) y el back lo guarda en cada
 * evento de Actividad, incluidos los errores.
 *
 * De la URL solo viajan la ruta y los parámetros que identifican la vista: nunca tokens, correos
 * ni búsquedas.
 */

export const CLIENT_APP = "business-web";

const PAGE_QUERY_KEYS = ["tab", "vista", "clinic", "pet"] as const;
const MAX_PAGE = 200;

/** `/panel?tab=leads&q=juan` → `/panel?tab=leads`. Fuera del navegador, `null`. */
export function currentPage(): string | null {
  if (typeof window === "undefined") return null;
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);
  const kept = new URLSearchParams();
  for (const key of PAGE_QUERY_KEYS) {
    const value = params.get(key);
    if (value) kept.set(key, value.slice(0, 60));
  }
  const query = kept.toString();
  return `${pathname}${query ? `?${query}` : ""}`.slice(0, MAX_PAGE);
}

/** Headers de contexto para cualquier petición al back (la pantalla va codificada: puede traer acentos). */
export function clientContextHeaders(): Record<string, string> {
  const page = currentPage();
  return {
    "x-kadesh-app": CLIENT_APP,
    ...(page ? { "x-kadesh-page": encodeURIComponent(page) } : {}),
  };
}
