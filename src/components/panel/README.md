# Panel

El botón de WhatsApp de soporte no vive en cada tab: está en `src/app/panel/layout.tsx`, así cubre extracción, CRM y rutas hijas (`/panel/creditos`, leads, etc.). Los globos periódicos se documentan en `src/components/shared/README.md`.

## Shell (2026-11-03)

`/panel` y sus subrutas (detalle de cliente, nuevo cliente, cotización, proyecto, créditos, planes, agregar vendedor o usuario) viven en **`PanelShell`**, sobre el shell de los paneles (`kadesh/components/app-shell`). Es el mismo lenguaje que Operaciones, con solo colores de Kadesh. Ya no llevan la barra ni el footer del sitio.

**Menú lateral.** Lo configura `DashboardSidebar.tsx`, que ya no pinta nada: define secciones, grupos, permisos y anclas.

| Grupo | Secciones |
|---|---|
| Prospección | Extracción B2B (solo admin de empresa; antes era un segmentado arriba del contenido) |
| General | Inicio, Kadesh AI, Analítica |
| Ventas | Clientes, Cotizaciones, Proyectos, Mi Calendario, Espacios de trabajo |
| Equipo y cuenta | Vendedores, Usuarios, Archivos, WhatsApp Business, Datos del perfil |
| Kadesh | Referidos, Novedades |

- Las secciones que la persona no puede ver no aparecen (`canAccessNavTab`).
- Kadesh AI conserva su degradado y lleva un punto violeta cuando la IA de la empresa está en vivo. Los módulos en beta llevan su etiqueta.
- En escritorio el menú se colapsa a iconos con «Ocultar menú»; la preferencia se guarda en `kadesh.panel.navCollapsed`, la misma llave de antes. En teléfono es un cajón.
- Los enlaces conservan `registro-exitoso` (píxel de Meta).

**Barra superior:** migas (Panel › grupo › sección › página), Tutorial, créditos (punto rojo si quedan menos de 5, ámbar si menos de 20, verde el resto) y **Nuevo cliente** si la persona puede ver Clientes. La campana solo la ven admins de plataforma.

**Mapa de Extracción.** Dentro del shell (`ObtenerClientesSection inShell`) va de orilla a orilla en teléfono y como tarjeta redondeada del alto disponible en escritorio. La ruta suelta `/panel/clientes/obtener-clientes` sigue a pantalla completa.

**Inicio** (`CompanyDashboard`): saludo grande, KPIs con cifras de 2 rem, y gráficas compartidas (`WeeklyBars`, `ShareBars`) sobre `ColumnBars` / `HBarList` del shell. La semana en curso va rayada.

Las secciones del CRM conservan sus propios títulos; el shell no agrega encabezado grande para no duplicarlos.

El ítem **Usuarios** (`?tab=usuarios`) lo ven admin de empresa y Gerencia. El resto de secciones del menú respetan permisos por módulo (`canAccessNavTab`); ver `src/components/profile/usuarios/README.md`.

Si el plan actual tiene un módulo **en beta** (Operaciones → Planes, hay que guardar), ese ítem del menú lleva la etiqueta **Beta**. Con el menú colapsado, el icono lleva un punto violeta. La marca sale del plan del catálogo con el mismo nombre, precio y periodo que la suscripción.

Mientras carga la sesión, el esqueleto depende de la ruta. En `/panel` (sin `tab`) es el del mapa: isla de búsqueda, superficie del mapa y panel de categorías. En `/panel?tab=inicio` y el resto de tabs del panel de control es el saludo, resumen, indicadores y gráficas (el menú real ya lo pinta el shell). El texto de carga solo lo lee el lector de pantalla.
