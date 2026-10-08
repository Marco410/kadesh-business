# Usuarios y permisos

## Promesa
El administrador de la empresa (y Gerencia) agregan personas, les dan rol y marcan a qué módulos y acciones pueden entrar. Esas personas quedan en la empresa y se pueden sumar a espacios de trabajo.

## Quién entra
- **Admin de empresa**: acceso total; no pasa por la lista de permisos. Ve y edita a todos los usuarios de la empresa.
- **Gerencia**: abre Usuarios, crea usuarios y asigna roles y permisos. No ve ni edita al admin de empresa ni al admin de plataforma. No puede asignar esos roles.
- **Resto**: no ven el ítem Usuarios del menú.

## Roles asignables
- **Gerencia**: administra usuarios y permisos.
- **Vendedor**: aparece en asignaciones de clientes.
- **Usuario de empresa**: acceso de empresa (p. ej. espacios).

En el formulario, cada tarjeta de rol tiene un **?** táctil. La explicación completa se abre **debajo de las tres tarjetas** (mismo alto siempre; no se estira una sola card). El ? no marca/desmarca el rol.

Siempre se conecta también el rol base `user`. Nunca se asignan desde aquí admin de plataforma ni admin de empresa.

## Permisos
Lista de llaves por usuario (`inicio.ver`, `clientes.editar`, …). El plan de la suscripción sigue siendo el techo: un permiso no abre un módulo que el plan no incluye.

- Usuario **sin** lista de permisos (equipo actual): sigue el comportamiento de rol de siempre.
- Usuario **con** lista (aunque esté vacía): solo lo que marque el catálogo, en módulos con `enforced: true`.
- **Activación**: todos los módulos del catálogo tienen `enforced: true`. Usuario sin lista → fallback de rol; con lista → solo las llaves marcadas.

## Copy
Español, tuteo. Nunca nombres internos de implementación, proveedores ni el nombre del campo `permissions` en la UI.

## Cómo se presenta
- **Lista**: grid de cards (1 → 2 → 3 columnas), avatar con iniciales, chips de rol, estado de permisos al pie. Buscador y CTA “Nuevo usuario” en el encabezado. Misma densidad visual que Vendedores.
- **Alta/edición**: formulario acotado (`max-w-3xl`), tres bloques numerados (datos → roles → permisos), volver con flecha. Roles como tarjetas seleccionables. Permisos en chips compactos por módulo, con contador y “Marcar todos”; checkbox del módulo con estado indeterminado. Acciones sticky al pie.

## Dónde vive
- Sidebar: `?tab=usuarios` (distinto del admin de plataforma en `/panel/clientes/admin`).
- Alta/edición y catálogo: `src/components/profile/usuarios/`.
- Comprobación en pantallas: `can()` y `canAccessNavTab()`.

## Backend (`kadesh-back`)
- Rol `gerencia` en `models/Role/constants.ts` (seed lo crea).
- Campo `User.permissions` (JSON array) + sesión con `permissions`.
- Catálogo y `hasPermission`: `auth/permissionsCatalog.ts` / `auth/permissions.ts`.
- Gerencia no ve/edita admins; no puede asignar `admin` / `admin_company`.
- Access de leads, archivos, espacios, IA y WhatsApp config respetan las llaves.

Tras pull en back: migrate (`permissions`) + `pnpm db:seed` (o crear el Role a mano).
