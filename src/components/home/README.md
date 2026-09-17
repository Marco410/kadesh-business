# Landing (home)

La home en `src/app/page.tsx` es la promesa pública: extraer leads B2B de Google Maps e INEGI y gestionarlos en el CRM. Las secciones van en ese orden; no insertes una feature nueva al inicio si el visitante aún no entiende extracción + CRM.

En copy: **INEGI**, nunca DENUE, SCIAN ni tokens. Rating y reseñas son de Google Maps; INEGI trae nombre, teléfono, dirección y categoría en México. Google Maps sigue siendo la fuente mundial.

## Kadesh AI (`#kadesh-ai`)

Va **después** de la vitrina de plataforma. Ahí ya vieron pipeline, cotizaciones y seguimientos; entonces tiene sentido el resumen del día.

Promesa: Kadesh AI ya conoce el negocio y propone 3 siguientes pasos (no un chat genérico). El recuadro de la derecha es un **ejemplo** sintético, etiquetado como tal.

Copy alineado con `src/components/profile/ai/README.md`: marca `Kadesh AI`; no proveedores, modelos, ni “inyectar contexto”. CTA a registro. El admin configura; el equipo lo ve en Inicio. **Está en todos los planes.** La administrada usa créditos del plan; API key propia no descuenta. El chip del hero, el ítem del menú y el badge de diferenciadores usan el degradado violeta–azul (`--ai-urim-purple` / `--ai-urim-blue`, clase `ai-urim-fill`).

El hero nombra Kadesh AI **dentro del lead** (pastilla violeta–azul), un chip “Kadesh AI · En todos los planes”, y debajo las badges de confianza (datos públicos, sin tarjeta, listo en 60 s). No sustituye la promesa de extracción.

Costo por lead y cuota Pro: `PRO_PLAN_PUBLIC` en `src/components/pricing/constants.ts` (500 créditos, ~1.60 MXN). No uses “400 leads” ni “menos de 1 MXN”.

## Aliados (`#aliados`)

Va después de prueba social y antes de testimonios. No es un logo wall de clientes: mezcla **familia Kadesh** (Pet y FOOD) con el aliado Bosco Agency. Detalle de copy y qué no va ahí: `src/components/allies/README.md`.
