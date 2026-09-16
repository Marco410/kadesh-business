# Clientes (CRM)

Lista principal del panel (`?tab=clientes`). Es la vista de trabajo: ver, filtrar, paginar, exportar y asignar leads. No es una ruta nueva.

## Cómo se presenta

Tres bandas distintas, de arriba a abajo:

1. **Identidad y acciones.** Título `Clientes`, empresa y recuento a la izquierda. A la derecha: **Exportar** (secundario) y **Agregar cliente** (primario verde). El recuento no va en el título.
2. **Filtrar lista.** Buscar y recortar *qué se ve*. El pipeline lleva color siempre (apagado al 70%); el estado activo sube a 100% + anillo. La tarjeta tiene un degradado suave naranja/verde para no quedar plana.
3. **Asignar a un vendedor.** Acción, no filtro. Checkboxes siempre visibles si el plan y el rol lo permiten. Se marca en la tabla, se elige vendedor (buscable) y se confirma. El filtro “por vendedor” sigue dentro de filtros y no asigna a nadie. Con selección, la barra se enciende en naranja.

Motion de producto (Corporate): 280–320 ms, `cubic-bezier(0.2, 0, 0, 1)`, respeta `prefers-reduced-motion`. Al entrar, las cuatro bandas (título, filtros, asignar, tabla) suben en cascada. Las filas entran al cambiar de página. Hover/press: scale y un poco de naranja, no desplazamiento de layout.

Vacío: invita a cambiar filtros o ir a Extracción B2B. Carga inicial: esqueleto de filas. Cambio de página: se mantiene la tabla anterior con velo, no un vacío intermitente.

## Paginación

Default **25** por página (10 / 25 / 50). `limit` y `page` viven en la URL; `limit` no se escribe si es 25. La nav es compacta (`1 … 4 5 6 … 12`), no un `<select>` con todas las páginas. Se precargan la página siguiente y la anterior. En la caché de Apollo, cada combinación de filtros + página es una entrada aparte (`skip`/`take` en `keyArgs`); si no, cambiar de página pisaba la lista anterior.

## Copy

- **Asignar a un vendedor** vs **Filtrar por vendedor**: no se mezclan.
- No mencionar GraphQL, Apollo, pipeline interno ni “leads” en el título de página: en UI decimos **clientes**. Los toasts de asignación pueden seguir diciendo leads si ya están así en el producto.
- **INEGI** y **Google Maps** como fuente, igual que en Obtener clientes.

## Acceso

Admin empresa / usuario empresa ven toda la bolsa de la compañía y pueden asignar si el plan tiene `assign_sales_person`. El vendedor ve los suyos y no ve la barra de asignación. Exportar y agregar cliente siguen las features de plan `export_excel` y `add_own_leads`.
