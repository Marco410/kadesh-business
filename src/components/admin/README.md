# Operaciones (admin de plataforma)

Pantalla interna en `/panel/clientes/admin`. No es el panel de un cliente: es desde donde el equipo de Kadesh opera el SaaS.

## Promesa

Ver y ajustar **usuarios**, **planes** y **fichas de veterinarias** en un solo lugar. El default es Inicio, con recuentos y reclamos pendientes. Las otras vistas viven en `?tab=usuarios`, `?tab=suscripciones` y `?tab=veterinarias`.

## Acceso

Solo el rol `admin` de plataforma. Un admin de empresa no entra. Si no hay sesión, redirige a login. Si hay sesión sin ese rol, muestra “sin permiso”, no un paywall de plan.

El enlace **Operaciones** aparece en el menú del avatar y, de forma discreta, al final del dashboard de inicio.

## Copy

Decimos **Operaciones**, **planes**, **fichas**, **verificar**. Nunca GraphQL, Keystone, Stripe IDs ni `planFeatures` en la UI.

En veterinarias:

- **Verificar** aprueba el reclamo: el dueño ya puede editar la ficha pública.
- **Rechazar** suelta al solicitante y la ficha vuelve a poder reclamarse.
- **Quitar verificación** deja al dueño vinculado pero sin poder editar hasta una nueva aprobación.

## Planes

La lista son suscripciones de empresa, no “usuarios admin empresa”. Se ajustan fechas del periodo y módulos del plan. El modal de features debe seguir los nombres de `PLAN_FEATURES_MAP`.
