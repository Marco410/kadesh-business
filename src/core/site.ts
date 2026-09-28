/** Origen canónico de Kadesh Negocios (SaaS B2B). Kadesh Pet vive en pet.kadesh.com.mx.
 *
 * En Vercel el dominio **primario** debe ser `kadesh.com.mx` y `www.kadesh.com.mx`
 * debe redirigir 301 al apex. Si queda al revés (apex → www), el canonical del
 * HTML apunta a apex mientras el edge sirve www: Google deja de indexar el blog.
 * No añadas middleware www→apex mientras Vercel siga haciendo apex→www (bucle).
 */
export const SITE_URL = "https://kadesh.com.mx";
