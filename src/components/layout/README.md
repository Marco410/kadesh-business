# Layout (nav y footer)

## Identidad legal en el pie

El footer muestra el NAP (nombre legal, dirección y teléfono) desde `kadesh/constants/legal`. Es a propósito: Meta revisa que kadesh.com.mx coincida con la verificación de marca. Ese bloque debe quedar alineado con `/privacidad`, `/contacto`, `/terminos` y el JSON-LD de `Organization` en `layout.tsx`. El WhatsApp de soporte del panel sigue en `support.ts` (otro número).

## Tamaño de fuente

A la izquierda del toggle de tema hay un botón **Aa**. Abre un panel fijo (portal, medidas en **px**) con el slider. No va inline en el nav: si el slider estuviera en `rem`, al arrastrarlo el menú se reacomoda y el control se mueve bajo el cursor.

Escala el texto de la app vía `html { font-size }` y `--kadesh-font-scale` (85%–130%, default 100%). Se guarda en `localStorage` (`kadesh-font-scale`). Un script en el `<head>` lo aplica antes del primer paint para no parpadear.

No promete “accesibilidad certificada”: es un control de comodidad.
