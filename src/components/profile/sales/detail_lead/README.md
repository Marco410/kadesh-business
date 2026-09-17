# Detalle del cliente

Ficha en `/panel/clientes/lead/[id]`. Se abre desde la fila de **Clientes**. No es un tab del panel.

## Cómo se presenta

Tres bandas, de arriba a abajo:

1. **Identidad.** Nombre, pastilla de fuente (isotipo INEGI o Google Maps) y un solo **Guardar cambios**.
2. **Datos del negocio.** Empresa a la izquierda. La tarjeta del medio depende de la fuente. A la derecha, **Presencia y fechas** (redes + línea de tiempo) en un solo bloque, no cuatro columnas vacías.
3. **Pipeline y trabajo.** Tira compacta. Arriba: estatus (se guarda al elegir) y notas con **Guardar**. Abajo: cuatro pastillas con recuento **y un verbo** (Añadir / Registrar / Programar). **Añadir** proyecto abre el mismo formulario que en Proyectos (nombre basta; fechas y archivos plegados). Los modales de actividad, propuesta, seguimiento y proyecto se pintan en `document.body` para no recortarse dentro de la tira. El **Guardar cambios** de arriba sigue para redes, web y fechas.
4. **Calendario de este cliente** (si el plan tiene `CALENDAR_CRM`): mes compacto + día seleccionado y próximos eventos. El calendario grande de vendedores no se reutiliza a pantalla completa aquí.

Vacío de redes: inputs compactos, no un muro. Vacío de Google: no se muestra la tarjeta. Carga: spinner. Error: volver a Clientes.

## Fuente

- **Google Maps** → tarjeta **Info de Google** (rating, reseñas, mapa).
- **INEGI** → no se muestra Info de Google. En su lugar, **Registro INEGI**: razón social, actividad, empleados, calle, colonia, C.P., localidad y mapa. El email y el país van en la empresa si existen. En copy: **INEGI**, nunca DENUE, SCIAN ni códigos internos.
- **Otras** (Referido, etc.) → solo empresa + presencia/fechas.

Un mismo negocio puede existir como Google y como INEGI; esta ficha muestra la fuente de *este* registro.

## Copy

- En UI: **cliente**, no “lead” en títulos.
- WhatsApp y teléfono son acciones, no texto plano.
- No mencionar GraphQL, CLEE ni el establecimiento interno.

## Acceso

La misma ficha para admin de empresa y vendedor: el status que se trae es el de la compañía (y del vendedor si no es admin). Acciones de CRM y calendario siguen las features de plan (`sales_activities`, `proposals`, `follow_up_tasks`, `CALENDAR_CRM`).
