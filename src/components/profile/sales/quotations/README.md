# Cotizaciones

Lista del panel (`?tab=cotizaciones`). No es una ruta nueva: crear abre un modal y el detalle vive en `/panel/cotizacion/[id]`.

La vista pública (`/cotizacion/[slug]`) es el documento que recibe el cliente. No es un formulario del panel: es papel de la empresa (logo y colores), con total a la vista, conceptos en tarjetas en móvil y tabla desde `md`. Las firmas solo salen al imprimir; en pantalla el CTA es **Imprimir** y, si hay teléfono, WhatsApp al asesor. Términos se leen a 14px. Si la vigencia ya pasó, se avisa arriba. El documento queda blanco aunque el visitante tenga tema oscuro.

El detalle del panel (`/panel/cotizacion/[id]`) es el editor. Folio, estado y total encabezan; no se muestra el ID interno. Acciones: copiar enlace, ver como el cliente, PDF (secundario, no rojo de peligro). Conceptos en tarjetas en móvil; descuento en tabla solo si “Mostrar descuento al cliente” está activo. Guardar queda arriba en desktop y fijo abajo en el teléfono. Atrás vuelve a `?tab=cotizaciones`.

## Cómo se presenta

1. **Identidad.** Título `Cotizaciones` y una línea de para qué sirve. Sin tabs internos: el catálogo de productos/servicios está apagado.
2. **Lista.** En móvil, cada cotización es una tarjeta (folio, cliente, estado, total). Desde `md`, tabla con la misma información; la fila entera abre el detalle.
3. **Vacío.** No se muestra una tabla hueca. Hay un estado que invita a crear la primera cotización. El CTA primario vive ahí; con filas, el mismo CTA pasa a la barra superior.
4. **Carga.** Esqueleto de tarjetas/filas. Al paginar se mantiene la lista con un velo, no un vacío intermitente.

## Motion

Misma curva Corporate que clientes y dashboard: 280 ms, `cubic-bezier(0.2, 0, 0, 1)`, respeta `prefers-reduced-motion`.

El momento autorado es el vacío: icono → título → copy → CTA en cascada. Las filas/tarjetas entran con `clientes-row-in` al cargar o cambiar de página. Hover/press: escala del CTA y un lavado naranja en la fila, sin desplazar el layout.

## Copy

- En UI decimos **cotizaciones**, no quotes ni invoices.
- Vacío: **Aún no hay cotizaciones**, no “no hay resultados con estos criterios” (no hay filtros).
- El modal pide primero el **cliente**; fecha y notas son opcionales.

## Acceso

Admin empresa ve todas las de la compañía. El vendedor solo las asignadas a él. La feature de plan se valida en el shell del panel (`FeatureLockedSection`), no aquí.
