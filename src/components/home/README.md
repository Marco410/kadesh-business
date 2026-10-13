# Landing (home)

La home en `src/app/page.tsx` es la promesa pública: extraer leads B2B de Google Maps e INEGI y gestionarlos en el CRM. Las secciones van en ese orden; no insertes una feature nueva al inicio si el visitante aún no entiende extracción + CRM.

**Orden (2026-10-12):** hero → giros → demo interactiva → costo por lead vs Meta Ads → plataforma (CRM) → Kadesh AI → por qué / datos reales / leads únicos / para quién → demo agendada → crecimiento, prueba social, aliados, testimonios → precios → referidos → CTA final → ¿Qué es Kadesh? + diferenciadores → FAQ. Por qué: justo después del hero iban una franja de 9 badges y un bloque de texto ("¿Qué es Kadesh?"), y lo que convence (ver el producto y el costo por lead) quedaba muy abajo. "¿Qué es Kadesh?" sigue en la página porque alimenta SEO y respuestas de IA (que leen toda la página, no solo el primer pantallazo).

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

El hero nombra Kadesh AI **dentro del lead** (pastilla violeta–azul), un chip “Kadesh AI · En todos los planes”, y debajo las badges de confianza (datos públicos, sin tarjeta, listo en 60 s). No sustituye la promesa de extracción.

Costo por lead y cuota Pro: `PRO_PLAN_PUBLIC` en `src/components/pricing/constants.ts` (500 créditos, ~1.60 MXN). No uses “400 leads” ni “menos de 1 MXN”.

## Aliados (`#aliados`)

Va después de prueba social y antes de testimonios. No es un logo wall de clientes: mezcla **familia Kadesh** (Pet y FOOD) con el aliado Bosco Agency. Detalle de copy y qué no va ahí: `src/components/allies/README.md`.
