# Vendedores

Sección del panel (`?tab=vendedores`) para revisar al equipo comercial: lista, calendario y detalle por persona.

## Detalle del vendedor (modal)

Al tocar **Ver detalles** en una tarjeta se abre un panel (hoja en móvil, modal centrado en `sm+`).

- **Cabecera:** nombre, empresa, verificado y % de comisión. Email y teléfono viven en el resumen como acciones táctiles (`mailto` / `tel`).
- **Pestañas:** Resumen · Clientes · Actividad · Propuestas · Seguimientos. Cada pestaña con conteo; no se apilan todas las listas a la vez.
- **Resumen:** números que saltan a su pestaña, contacto y un vistazo de actividad reciente / próximos seguimientos.
- **Clientes:** nombre enlaza a la ficha del lead; **Desasignar** es un botón con etiqueta (no solo icono), si el plan y permisos lo permiten.
- No mostramos IDs internos de empresa ni filas de datos personales poco útiles (edad suelta, etc.); el alta y el usuario van como chips secundarios.

## Acceso

La puerta es **permiso + rol de gerencia/admin**, no “¿es solo vendedor?”. Un usuario con Gerencia + Vendedor y `vendedores.crear` / `vendedores.editar` puede gestionar altas; el rol vendedor no bloquea.

- Ver lista: `vendedores.ver` (legado: admin empresa).
- Altas / edición en pantalla dedicada: `agregar-vendedor/README.md` (`vendedores.crear` / `vendedores.editar`; legado: admin empresa o Gerencia).
- Desasignar en el modal de detalle: `vendedores.editar` + `clientes.asignar` + plan `assign_sales_person`.
