# Landing (home)

La home en `src/app/page.tsx` es la promesa pública: extraer leads B2B de Google Maps e INEGI y gestionarlos en el CRM. Las secciones van en ese orden; no insertes una feature nueva al inicio si el visitante aún no entiende extracción + CRM.

**Orden (2026-10-14):** hero → cifras → dolor → giros → demo interactiva → costo por prospecto → plataforma (CRM) → Kadesh AI → por qué / datos reales / leads únicos / para quién → demo agendada → crecimiento → prueba social → testimonios → precios → cierre → FAQ → franja de referidos → footer.

Cambios del 2026-10-14 (copy de credibilidad antes de mandar tráfico de anuncios):

- **Fuera de la home:** «¿Qué es Kadesh?» con sus 4 pasos (repetía el hero y la demo; el texto ya está en las FAQ y el `HowTo` en `HomeJsonLd`), la franja de 8 diferenciadores (repetía secciones), la sección de aliados (pasó al footer) y el programa de referidos completo (pasó a `/referidos`).
- **Sección de dolor** (`PainSection`) justo después de las cifras: problema → agitar → solución. Nombra lo que el vendedor ya vive antes de enseñar el producto.
- **Encabezados con beneficio:** la pregunta queda como texto pequeño encima (`SECTION_QUESTION_CLASS`, la leen buscadores y motores de IA) y el encabezado grande es el beneficio. No vuelvas a poner la pregunta como H2.

**Fondo del hero:** `HeroMapBackdrop` (mapa de calles muy tenue que deriva) detrás de todo el hero, y `HeroRadar` detrás de la demo: ondas y negocios con ícono (restaurante, tienda, café…) que aparecen alrededor de la tarjeta, solo en desktop. Nada pasa por detrás del texto: la primera versión ponía el radar y los íconos entre el copy y la demo y en móvil tapaba la lectura. CSS puro (transform/opacity), sin JS; con `prefers-reduced-motion` queda fijo.

En copy: **INEGI**, nunca DENUE, SCIAN ni tokens. Rating y reseñas son de Google Maps; INEGI trae nombre, teléfono, dirección y categoría en México. Google Maps sigue siendo la fuente mundial.

## Giros (marquee)

Dos filas de chips con los giros de Google Maps e INEGI. Se desplazan despacio para poder leer el nombre (unos 32 px/s arriba y 44 px/s abajo). La de abajo empieza a mitad del catálogo. Entran y salen con un fundido en los dos bordes, no con un corte. Con `prefers-reduced-motion` se quedan quietas.

## Rendimiento y accesibilidad

- El hero es **Server Component** sin GSAP: el copy debe ser visible en el primer paint (nada de fades que parten en opacity 0; retrasan LCP).
- El visual del hero es un **WebP animado** (`public/images/demo/hero-extraccion.webp`, 640×800, ~400 KB) servido con `next/image` `priority` + `unoptimized` (el optimizador de Next pierde la animación). Se cambió la `ProductDemoCard` estática por la demo en movimiento: muestra el flujo real (categoría → buscar → leads) sin meter framer-motion en el LCP. `HeroVisual` es Server Component. Si se reemplaza el archivo, mantenerlo por debajo de ~500 KB: es el elemento LCP en móvil.
- Secciones below-the-fold se cargan con `next/dynamic` desde `page.tsx`. Onboarding (driver.js) y HeroUI solo montan en `/panel`, `/admin` y `/auth`.
- Contraste: texto blanco sobre naranja usa `orange-800` (el `orange-500` de marca `#f7945e` no pasa WCAG AA con blanco). Chips/labels naranja sobre fondo claro → `text-orange-800` / `text-orange-900`.

## Kadesh AI (`#kadesh-ai`)

Va **después** de la vitrina de plataforma. Ahí ya vieron pipeline, cotizaciones y seguimientos; entonces tiene sentido el resumen del día.

Promesa: Kadesh AI ya conoce el negocio y propone 3 siguientes pasos (no un chat genérico). El recuadro de la derecha es un **ejemplo** sintético, etiquetado como tal.

Copy alineado con `src/components/profile/ai/README.md`: marca `Kadesh AI`; no proveedores, modelos, ni “inyectar contexto”. CTA a registro. El admin configura; el equipo lo ve en Inicio. **Está en todos los planes.** La administrada usa créditos del plan; API key propia no descuenta. El chip del hero, el ítem del menú y el badge de diferenciadores usan el degradado violeta–azul (`--ai-urim-purple` / `--ai-urim-blue`, clase `ai-urim-fill`).

El hero **ya no** menciona Kadesh AI (2026-10-14): una sola promesa arriba (extracción). Kadesh AI aparece en la sección de dolor y en su propia sección.

Costo por lead y cuota Pro: `PRO_PLAN_PUBLIC` en `src/components/pricing/constants.ts` (500 créditos, ~1.60 MXN). No uses “400 leads” ni “menos de 1 MXN”.

## Hero, botones y prueba

- **Hero:** etiqueta → titular → subtítulo → botones → quitamiedos → prueba social (frase de Alejandra García + empresas que prospectan, de `landingStats`; si son menos de `MIN_COMPANIES_TO_SHOW` no se muestra la cifra).
- **Solo dos botones en toda la landing** (`landing-cta.ts`): «Probar gratis 7 días» (principal, al registro) y «Agendar demo de 15 min» (secundario, a `#agendar-demo`). Antes había ~9 textos distintos. El principal es `orange-800` sobre fondo claro y blanco sobre fondo naranja u oscuro.
- **«70 créditos», nunca «70 leads»:** los créditos de la prueba sirven para extraer y para Kadesh AI; si usan la IA sacan menos de 70 prospectos.
- **Cifras:** tres (empresas, ciudades, «< 1 min para tu primera lista»). Se quitó el total de negocios en la base: para una herramienta que busca en todo Google Maps, unos miles se ven chicos.
- **Costo por prospecto:** se compara contra armar la lista a mano o comprar una base (la alternativa real del cliente), no contra Meta Ads. La comparación con Meta Ads sigue en las FAQ.
- **Giros:** una sola fila animada (con dos, en celular ocupaba media pantalla).

## Testimonios (`#testimonios`)

Solo testimonios reales y con permiso, en `testimonials.ts`. Hoy hay uno (Alejandra García), como tarjeta destacada con iniciales «AG» (no hay foto). Se quitaron los otros cuatro: no eran verificables, y Meta puede rechazar anuncios que llevan a reseñas que no se pueden comprobar. También se quitó la métrica de «35 horas ahorradas»: no la dio ella. `role` y `city` se muestran solo cuando estén confirmados. Con varios testimonios, van abiertos uno debajo de otro; sin carrusel en celular.

## Piezas compartidas con /prueba

`AiDigestCard` (tarjeta «Resumen de hoy»), `HeroVisual`, `TestimonialsSection`, `DemoPlayer`, `landing-cta.ts` y `testimonials.ts` también los usa la página de anuncios `/prueba` (`kadesh/components/trial-landing`). Un cambio aquí cambia las dos páginas.

## Referidos

El programa completo vive en `/referidos` (`ReferralSection`). En la home solo queda `ReferralTeaserBand`, cerca del footer. La calculadora usa los precios de lista de `PRICING_PLAN_OFFERS` mientras `saasPlans` no responde: antes salía en $0 al cargar.

## Aliados

Ya no están en la home: van en el footer como «Familia Kadesh y aliados» (en medio de la página distraían a quien vino a probar). Detalle: `src/components/allies/README.md`.
