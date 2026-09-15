# Obtener clientes

Pantalla de extracción por mapa: el usuario elige un punto, un radio y un giro, y se le asignan leads a su empresa. Vive en `/panel/clientes/obtener-clientes` y también embebe en el panel (`?tab=extraccion`). Solo admin de empresa; el vendedor ve `RoleAccessDeniedSection`.

## Cómo se presenta

Mapa a pantalla completa. Una sola isla de búsqueda arriba, **todo en una fila** en desktop: fuente (Google Maps / INEGI), tipo (categoría / libre), query, radio, filtros (solo Google) y el CTA **Buscar leads**. El naranja sólido es solo el CTA; la selección de fuente y tipo es un segmento suave (`orange-50`). El aviso de resultado (vacío o leads nuevos + **Ver en Clientes**) va **a la izquierda, centrado en vertical**, para no recortarse con el zoom, los FABs ni el chat.

Vacío: tarjeta de panel (blanco / carbón, acento naranja), nunca púrpura de Kadesh AI. Acciones de recuperación reales: ampliar radio, quitar filtros, y copy para cambiar de giro o de punto.

Éxito: recuento + **Ver en Clientes**. No mostrar “0 ya en base” ni “0 omitidos”: esos renglones solo aparecen si el número es mayor a cero. Escape cierra filtros o el panel de resultado.

El toggle de fuente lleva isotipos: pin de Google Maps y marca INEGI (azul institucional `#003057` / cian). El motion es de producto (Corporate): 280ms, `cubic-bezier(0.2, 0, 0, 1)`, respeta `prefers-reduced-motion`. El momento principal es el panel de resultado deslizándose desde la izquierda; el resto es feedback (pastilla del toggle, CTA, FABs).

Herramientas del mapa a la derecha: mi ubicación y **CDMX**. En INEGI, el hint bajo la isla dice que el radio es 2 o 5 km y que no hay calificación ni reseñas.

## Fuente (toggle)

Default: **Google Maps**. El otro modo es **INEGI**. Misma barra (categoría o búsqueda libre, radio, Buscar leads) y la misma bolsa de créditos.

- **Google Maps** → `syncLeadsFront`. Radio 2–50 km. Filtros de calificación y reseñas. Dropdown: `GOOGLE_PLACE_CATEGORIES`.
- **INEGI** → `syncLeadsFromInegi`. Radio solo 2 y 5 km. Sin rating ni reseñas. Dropdown: `INEGI_DENUE_CATEGORIES`. Cada opción tiene `id` único (el Autocomplete no admite ids repetidos) y `value` ASCII sin acentos: varios labels pueden compartir keyword porque apuntan a la misma clase SCIAN (p. ej. Pediatras / Ginecólogos → `especializada`; Negocios locales / Otra → `todos`). Al API se manda el `value`, nunca el `id` ni el código SCIAN. Al cambiar de fuente se limpia la categoría. Búsqueda libre en INEGI también se manda sin acentos (`toInegiDenueKeyword`) para no romper la API. En copy: **INEGI**, nunca DENUE, SCIAN ni el nombre de la API.

Catálogos: Google vive en `src/constants/constans.ts`. INEGI en `src/constants/inegiDenueCategories.ts`, alineado con kadesh-back `utils/constants/inegiDenueCategories.ts`. Si cambia uno, actualiza el otro.

Si `success === false`, el toast muestra el `message` del backend tal cual (sesión, empresa, suscripción, trial, cupo, token). No traducir.

Tras un sync con leads nuevos: se refresca la cuota (`syncedCount` / `leadLimit`, vía `onLeadsSyncSuccess`) y las tarjetas de estadísticas. Los leads INEGI llegan con `source: "INEGI"` (exacto) en pipeline Detectado. Un mismo negocio puede existir como Google y como INEGI; no se deduplican entre fuentes.

## Qué no hace esta pantalla

No hay loop de `promoteInegiEstablishmentToLead`. No llama `syncEstablishmentsFromInegi` (eso es catálogo, no cobra). No manda CSV ni tokens INEGI. En copy: **INEGI**, nunca “INEGI DENUE”, tokens, SCIAN ni el nombre de la API.

## Lista de clientes

En Clientes hay un filtro **Fuente** (`Google Maps` | `INEGI`) alineado con `TechBusinessLead.source`. Al agregar un lead a mano, INEGI también está en el select de fuente. Rating, reseñas, `googlePlaceId` y `googleMapsUrl` pueden faltar en leads INEGI; la ficha y la tabla ya muestran “—” si no hay dato.
