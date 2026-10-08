# Dashboard de Inicio

`CompanyDashboard` es la tab `inicio` del panel.

## Acceso

- Entrar a Inicio exige `inicio.ver` cuando el usuario tiene lista de permisos (módulo `inicio` con `enforced: true`).
- Los **accesos rápidos**, el bloque **Requiere atención**, los “Ver todo” de cada sección y los enlaces a clientes/cotizaciones/proyectos solo aparecen si `canAccessNavTab` permite ese módulo. Sin permiso, el dato se muestra sin enlace.
- El enlace **Operaciones** al pie solo lo ve el rol `admin` de plataforma (`src/components/admin/README.md`).

Catálogo y fases: `src/components/profile/usuarios/README.md`.

## Digest de IA

El resumen diario de Kadesh AI (`DailyDigestCard`) **también** está en `/panel?tab=ai` (Dashboard). No lo quites de Inicio al cambiar la pantalla de IA.

Producto, copy y acceso de IA: `src/components/profile/ai/README.md`.

## Motion

Corporate, alineado con CRM y extracción: 280 ms, `cubic-bezier(0.2, 0, 0, 1)`, subida de 12 px. Las tarjetas entran al entrar en viewport (una vez). Los chips de acceso rápido y las celdas KPI van en cascada corta. Las barras crecen con `dashboard-bar-grow`. Respeta `prefers-reduced-motion` (solo fade, sin desplazamiento ni grow).
