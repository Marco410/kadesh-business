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

## Origen del registro (`AttributionTracker`)

Desde 2026-10-11, `AttributionTracker` guarda de dónde llegó la persona (primer contacto): `utm_*` de la URL, el dominio del sitio que la mandó y la primera página que vio. Lo guarda en `localStorage` (`kadesh-attribution`, 90 días) con `kadesh/utils/attribution` y se manda una sola vez, al registrarse. Operaciones → Analítica → Adquisición lo usa para ver qué canales traen clientes que usan y pagan.

- Es analítica del sitio, así que **si la persona rechazó las cookies no se guarda nada** y se borra lo que hubiera. Mientras no decide, sí se guarda: es de Kadesh, no sale a terceros y solo se envía si se registra (consentimiento tácito; tiene que estar en el Aviso de privacidad).
- Primer contacto: si ya hay uno guardado no se pisa.
- Del referrer solo el dominio y de la página la ruta sin query: la URL completa puede traer datos de la persona.
- Dentro de `/panel` y `/admin` no se guarda: ya es cliente.
- Si el back todavía no acepta `attribution` (el front salió antes), el registro se reintenta sin ese dato y no se rompe (`isAttributionArgumentError`).
