# Proyectos

Lista en el panel (`?tab=proyectos`) y alta desde **Nuevo proyecto**. El detalle es otra ruta (`/panel/proyectos/[id]`).

## Cómo se presenta el alta

Modal, no una página. Pie fijo: **Cancelar** y **Crear proyecto**. El nombre es lo único obligatorio junto con el cliente (en la lista de proyectos hay que buscarlo; en la ficha del cliente ya viene elegido).

Estado en pastillas: Pendiente (default), En proceso, En revisión. No se ofrece Finalizado ni Cancelado al crear.

**Fechas, alcance y archivos** van plegados. No se muestran 4 campos vacíos de entrada. Ahí viven tipo de servicio, inicio, fin estimado, alcance y carpeta en la nube.

El foco cae en el nombre al abrir. Escape cierra.

## Copy

- Título: **Nuevo proyecto**.
- En UI: **cliente**, no “lead”.
- Toast de éxito: **Proyecto creado**.

## Acceso

Quien ve la lista de proyectos de su empresa (admin) o los que le asignaron (vendedor). El formulario conecta empresa, cliente y responsable (el usuario que crea).
