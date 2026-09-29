# Cookie consent

Banner de aceptar/rechazar cookies, mostrado antes de trackear con el Meta Pixel.

## Por qué es binario (sin categorías)

Hoy el único tracker que setea cookies de marketing es el Meta Pixel. Vercel Analytics/SpeedInsights no dependen de este gate porque no usan cookies. Mientras solo haya un tracker, un banner Aceptar/Rechazar es suficiente — no hay necesidad de categorías granulares (necesarias/analíticas/marketing) todavía.

Si se agrega otra herramienta de tracking que dependa de cookies, revisar si conviene pasar a consentimiento por categoría antes de conectarla a este mismo gate.

## Cómo funciona

- `CookieConsentProvider` guarda la decisión (`"accepted" | "rejected"`) en `localStorage` (`kadesh-cookie-consent`).
- `CookieConsentBanner` se muestra solo si `status === "pending"`.
- El **base code** del Meta Pixel vive en `src/app/layout.tsx` (HTML inicial) con [Consent Mode](https://developers.facebook.com/docs/meta-pixel/implementation/gdpr): arranca en `fbq('consent', 'revoke')`.
- `MetaPixelLoader` solo llama `grant` si el usuario aceptó, o `revoke` si está pending/rejected.

Así Events Manager puede detectar el píxel al pegar la URL (el script está en el HTML), sin enviar eventos hasta “Aceptar”.

Ambos providers se montan desde `ClientProviders` (marketing + `/panel`).

## Test Events en Meta

1. Deja abierta la pestaña Test Events.
2. URL: `https://kadesh.com.mx` (mismo Pixel ID `1085575667194114`).
3. Si ya tenías `accepted` en localStorage, recarga; si no, acepta el banner.
4. Deberías ver `PageView`. Conversiones custom: ver `NEXT_PUBLIC_META_PIXEL_TEST_EVENT_CODE` en `facebook-pixel.ts`.

El mensaje “A pixel wasn't detected” con el setup anterior era porque el script **solo** se inyectaba tras aceptar, y el checker de Meta no acepta el banner.
