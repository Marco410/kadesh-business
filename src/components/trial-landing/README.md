# Página /prueba (solo anuncios)

Landing para el tráfico de Meta Ads. A diferencia de la home: **sin menú, sin enlaces a otros productos y una sola acción** (crear la cuenta gratis). La demo por WhatsApp queda como enlace secundario en el cierre. No se indexa (`robots: noindex`) ni va en el sitemap: repite el contenido de la home.

## Estructura (9 secciones)

Encabezado (solo logo + «¿Ya tienes cuenta? Inicia sesión») → hero → dolor → cómo funciona (3 pasos + demo interactiva de la home) → qué recibes en cada prospecto → más que una lista (CRM + tarjeta «Resumen de hoy» de Kadesh AI) → testimonios → precio → preguntas frecuentes → cierre → footer mínimo. En celular hay un botón fijo abajo con «Probar gratis 7 días».

Reutiliza de `kadesh/components/home`: `HeroVisual`, `AiDigestCard`, `TestimonialsSection`, `DemoPlayer`, los botones de `landing-cta.ts` y la frase de `testimonials.ts`. Si cambias esas piezas, cambian en las dos páginas.

## Titular por anuncio (`?angulo=`)

Lo que promete el anuncio debe repetirse en el titular. Cada anuncio apunta a su variante:

| Ángulo del anuncio | URL |
| --- | --- |
| Genérico | `/prueba` |
| Grabación del Radar | `/prueba?angulo=radar` |
| Bases de Excel que no contestan | `/prueba?angulo=bases` |
| CRM por vendedor | `/prueba?angulo=crm` |
| Kadesh AI | `/prueba?angulo=ia` |
| Prospectar otras ciudades | `/prueba?angulo=ciudades` |

Un valor desconocido cae en el genérico. Los `utm_*` del anuncio siguen funcionando: `AttributionTracker` guarda la primera visita (incluida la ruta `/prueba`) y llega al registro.

## Copy

- «70 créditos», no «70 leads»: los créditos sirven para extraer y para Kadesh AI.
- Las preguntas frecuentes son solo objeciones y van en acordeón (`<details>`, sin JS): son respaldo, no el argumento.
- **Pendiente:** la pregunta «¿Qué pasa al terminar los 7 días?» no está publicada hasta confirmar qué pasa con la cuenta y los prospectos. Cuando se confirme, agrégala en `TRIAL_FAQ` (`constants.ts`).
- Testimonios: solo reales y con permiso (ver `src/components/home/README.md`).

## Medición

El evento `CompleteRegistration` del píxel se dispara al terminar el registro (`kadesh/utils/facebook-pixel`), no en esta página: el botón lleva directo a `/auth/register`.
