# Operaciones (admin de plataforma)

Pantalla interna en `/panel/clientes/admin`. No es el panel de un cliente: es desde donde el equipo de Kadesh opera el SaaS.

## Promesa

Ver y ajustar **usuarios**, **planes** y **fichas de veterinarias** (reclamos y servicios pedidos) en un solo lugar. El default es Inicio, con recuentos, reclamos y servicios pendientes. Las otras vistas viven en `?tab=usuarios`, `?tab=suscripciones` y `?tab=veterinarias`.

## Acceso

Solo el rol `admin` de plataforma. Un admin de empresa no entra. Si no hay sesión, redirige a login. Si hay sesión sin ese rol, muestra “sin permiso”, no un paywall de plan.

El enlace **Operaciones** aparece en el menú del avatar y, de forma discreta, al final del dashboard de inicio.

## Navegación en tres niveles

Antes las tabs, la vista Fichas/Servicios y los filtros eran la misma píldora y no se distinguían. Ahora cada nivel tiene su propio componente en `ui.tsx`:

1. **Secciones** (Inicio, Usuarios, Planes, Veterinarias) — `AdminTabBar`: texto con subrayado naranja en la activa, no píldoras.
2. **Vista dentro de una sección** (Fichas / Servicios) — `AdminSegmented`: control segmentado, opción activa como pastilla blanca.
3. **Filtros de una tabla** (rol, estado) — `AdminFilterChips`: chips pequeños, activo con tinte naranja (no relleno sólido), con etiqueta (**Rol**, **Estado**) para que se lea qué filtran.

Una pantalla nueva usa el componente de su nivel. No vuelvas a poner píldoras sólidas en las tabs: compiten con el filtro y con los botones de acción, que son los únicos naranja sólido.

## Copy

Decimos **Operaciones**, **planes**, **fichas**, **servicios**, **verificar**. Nunca GraphQL, Keystone, Stripe IDs ni `planFeatures` en la UI.

## Usuarios

Al hacer clic en un usuario (fila en escritorio, tarjeta en móvil) se abre su detalle. Ahí se ve empresa, alta y último acceso, y se puede editar nombre, apellidos, teléfono, correo, cuenta verificada y **roles**. Se guarda con **Guardar usuario**.

Debajo va la **suscripción al blog**, con una tarjeta por blog (Pet y SaaS) que se guarda por separado, para no mezclar errores de un bloque con el otro:

- Sin suscripción: **Suscribir** la crea con el correo del usuario (editable).
- Con suscripción: se cambia el correo o se pausa/reactiva. Pausada = no recibe avisos de nuevos artículos. No se borra desde aquí.
- Si alguien se suscribió con ese correo antes de tener cuenta, aparece igual y al guardar se liga a la cuenta.
- Un mismo correo no puede repetirse en el mismo blog; el aviso de error viene del backend.

## Veterinarias

Dos vistas dentro de `?tab=veterinarias`: **Fichas** (default) y **Servicios** (`&vista=servicios`).

En fichas:

- **Verificar** aprueba el reclamo: el dueño ya puede editar la ficha pública.
- **Rechazar** suelta al solicitante y la ficha vuelve a poder reclamarse.
- **Quitar verificación** deja al dueño vinculado pero sin poder editar hasta una nueva aprobación.

En servicios: un dueño pidió algo que no estaba en el catálogo. Default **Pendientes**. Al **Aprobar y asignar**, el servicio entra al catálogo **y** se marca en la clínica elegida (prellenada con la que lo pidió; se puede cambiar). **Rechazar** no lo publica.

## Planes

La lista son suscripciones de empresa, no “usuarios admin empresa”. Se ajustan fechas del periodo y módulos del plan. El modal de features debe seguir los nombres de `PLAN_FEATURES_MAP`.

En la lista se ve el saldo **de este mes** (disponibles / extra). En **Ajustar plan** se pueden **agregar créditos extra**: se suman ahora y se mantienen cada mes, igual que una recarga. No decimos “bonus”, “ledger” ni “periodo Keystone”. Los montos rápidos (250 / 1 000 / 3 000) coinciden con los paquetes de recarga del panel del cliente.
