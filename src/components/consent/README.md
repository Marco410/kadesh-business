# Cookie consent

Banner de aceptar/rechazar cookies, mostrado antes de cargar cualquier tracker que dependa de cookies.

## Por qué es binario (sin categorías)

Hoy el único tracker que setea cookies es el Meta Pixel (`MetaPixelLoader`). Vercel Analytics/SpeedInsights no dependen de este gate porque no usan cookies. Mientras solo haya un tracker, un banner Aceptar/Rechazar es suficiente — no hay necesidad de categorías granulares (necesarias/analíticas/marketing) todavía.

Si se agrega otra herramienta de tracking que dependa de cookies, revisar si conviene pasar a consentimiento por categoría antes de conectarla a este mismo gate.

## Cómo funciona

- `CookieConsentProvider` guarda la decisión del usuario (`"accepted" | "rejected"`) en `localStorage` (`kadesh-cookie-consent`), siguiendo el mismo patrón que `src/components/layout/font-scale.ts`.
- `CookieConsentBanner` se muestra solo si no hay decisión guardada (`status === "pending"`).
- `MetaPixelLoader` inyecta el script del Meta Pixel únicamente cuando `status === "accepted"`. Antes de eso, no ocurre ninguna llamada a `connect.facebook.net` ni a `facebook.com/tr`.

Ambos se montan globalmente desde `ClientProviders`, por lo que aplican tanto al sitio de marketing como a `/panel`.
