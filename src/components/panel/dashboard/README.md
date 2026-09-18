# Dashboard de Inicio

`CompanyDashboard` es la tab `inicio` del panel.

El resumen diario de Kadesh AI (`DailyDigestCard`) **también** está en `/panel?tab=ai` (Dashboard). No lo quites de Inicio al cambiar la pantalla de IA.

El enlace **Operaciones** al pie solo lo ve el rol `admin` de plataforma (`src/components/admin/README.md`).

Producto, copy y acceso de IA: `src/components/profile/ai/README.md`.

## Motion

Corporate, alineado con CRM y extracción: 280 ms, `cubic-bezier(0.2, 0, 0, 1)`, subida de 12 px. Las tarjetas entran al entrar en viewport (una vez). Los chips de acceso rápido y las celdas KPI van en cascada corta. Las barras crecen con `dashboard-bar-grow`. Respeta `prefers-reduced-motion` (solo fade, sin desplazamiento ni grow).
