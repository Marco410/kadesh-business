# Obtener clientes

Pantalla de extracción por mapa: el usuario elige un punto, un radio y un giro, y se le asignan leads a su empresa. Vive en `/panel/clientes/obtener-clientes` y también embebe en el panel (`?tab=extraccion`). Solo admin de empresa; el vendedor ve `RoleAccessDeniedSection`.

## Cómo se presenta

El mapa ocupa solo el alto que queda debajo del menú y de las pestañas, para que el panel de categorías entre completo en la pantalla. Una sola isla de búsqueda arriba, **todo en una fila** en desktop: fuente (Google Maps / INEGI), tipo (categoría / libre), query, radio, filtros (solo Google) y el CTA **Buscar leads**. El naranja sólido es solo el CTA; la selección de fuente y tipo es un segmento suave (`orange-50`). El aviso de resultado (vacío o leads nuevos + **Ver en Clientes**) va **a la izquierda, centrado en vertical**, para no recortarse con el zoom, los FABs ni el chat.

Vacío: tarjeta de panel (blanco / carbón, acento naranja), nunca púrpura de Kadesh AI. Acciones de recuperación reales: ampliar radio, quitar filtros, y copy para cambiar de giro o de punto.

Éxito: recuento + **Ver en Clientes**. No mostrar “0 ya en base” ni “0 omitidos”: esos renglones solo aparecen si el número es mayor a cero. Escape cierra filtros o el panel de resultado.

El toggle de fuente lleva isotipos: pin de Google Maps y marca INEGI (azul institucional `#003057` / cian). El motion es de producto (Corporate): 280ms, `cubic-bezier(0.2, 0, 0, 1)`, respeta `prefers-reduced-motion`. El momento principal es el panel de resultado deslizándose desde la izquierda; el resto es feedback (pastilla del toggle, CTA, FABs). Mientras **Buscar leads** está en curso, el pin palpita y del centro salen anillos hasta el borde del radio: el círculo punteado avanza y su relleno respira. Con movimiento reducido el mapa se queda quieto.

Herramientas del mapa a la derecha: mi ubicación y **CDMX**. La primera vez abre en Ciudad de México. Si el usuario mueve el mapa, hace zoom o cambia el punto, esa vista queda en este navegador y la siguiente entrada abre ahí. En INEGI, el hint bajo la isla dice que el radio es 2 o 5 km y que no hay calificación ni reseñas.

Los clientes ya obtenidos de la empresa se dibujan como puntos chicos, detrás del pin y del radio de búsqueda. El clic en el mapa sigue moviendo el centro: los puntos no capturan el clic. El color es el de la categoría y no cambia si esa categoría crece: sale del nombre, no del volumen. Es el mismo puntito en el mapa, en el panel de la izquierda y en las tarjetas de abajo. “Sin categoría” es gris. A la izquierda, abajo, un panel lista cada categoría con su color, cuántos clientes tiene y un switch. Encendido, se ve en el mapa; apagado, se quita. La flecha de la cabecera pliega la lista; otra vez la abre. Plegado sigue el conteo de cuántas hay en el mapa. El riel del switch usa el color de esa categoría. Por defecto todas están encendidas. **Quitar todos** las apaga y **Ver todos** las enciende; el que no aplica queda atenuado. Apagar una categoría no cambia su número ni el conteo de las tarjetas.

Al abrir, el mapa no se muestra hasta que las calles ya están pintadas. Mientras tanto hay un velo con el pin y el radio de búsqueda, no el fondo gris con los puntos ya puestos. Cuando el mapa aparece, el pin cae a su lugar y los puntos entran desde el centro, primero los más cercanos. Si una búsqueda trae clientes nuevos, se pintan desde el centro de búsqueda hacia afuera, no todos a la vez; los que ya estaban no se vuelven a animar. Ocultar o volver a mostrar una categoría no repite esa entrada: solo cambia qué puntos se ven. Si las calles tardan demasiado, el velo se quita igual para no dejar la pantalla bloqueada. A los 5 segundos, si sigue ahí, aparece **Recargar**: vuelve a cargar la página.

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

En Clientes hay un filtro **Fuente** (`Google Maps` | `INEGI`) alineado con `TechBusinessLead.source`. Al agregar un lead a mano, INEGI también está en el select de fuente. En la ficha, INEGI no muestra **Info de Google**: muestra **Registro INEGI** (razón social, actividad, empleados, dirección, mapa). Rating y reseñas solo en fuente Google Maps.
