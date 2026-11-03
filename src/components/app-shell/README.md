# app-shell — shell de los paneles internos

Menú lateral agrupado, barra superior flotante, encabezado de página, gráficas sin librería y el movimiento de los paneles. Hoy lo usa **Operaciones** (`kadesh/components/admin`). La idea es que el **panel de control de clientes** lo adopte después (ver "Siguiente paso").

El lenguaje viene del admin de ICARM (`icarm-web-morelia`, `src/app/(admin)/admin.css`), traducido a Tailwind y framer-motion y con **solo colores de Kadesh**: neutros cálidos y naranja como único acento. El morado es de Kadesh AI.

## Tokens (`src/app/globals.css`)

Las variables `--dash-*` viven en `:root` / `.dark`, no dentro del shell. Así las leen también los modales y menús en portal. Se usan como utilidades de Tailwind (`@theme inline`), sin repetir `dark:`:

| Utilidad | Uso |
|---|---|
| `bg-dash-canvas` | Fondo (la raíz `.kd-dash` ya lo pone, con brillos naranja en las esquinas) |
| `bg-dash-surface` / `-surface-2` / `-surface-3` | Tarjetas / pistas, celdas y filas / bordes de pista y hover |
| `text-dash-ink` / `-soft` / `-muted` / `-faint` | Texto principal → tenue (`muted` cumple AA en claro y oscuro) |
| `border-dash-line` / `-line-strong`, `divide-dash-line` | Bordes |
| `bg-dash-hover`, `bg-dash-glass` | Hover neutro, barra de vidrio |
| `bg-dash-ink text-dash-on-ink` | Elemento "en tinta": chip activo, página actual (negro en claro, blanco en oscuro) |
| `shadow-dash`, `shadow-dash-lift`, `shadow-dash-accent(-lift)` | Sombra de tarjeta, tarjeta levantada, brillo del botón primario |
| `dash-grad-accent` / `dash-grad-dark` / `dash-grad-tint` | Degradados: botón y barra pico / KPI oscuro / KPI durazno |
| `dash-hatch` | Rayas para lo que va a medias (periodo en curso) |
| `dash-shimmer`, `dash-enter` | Skeleton con brillo; entrada CSS escalonada con `style={{ "--i": n }}` |
| `font-dash` | Inter (variable). `.kd-dash` ya la pone; úsala en portales |

## Componentes

- **`AppShell`**: `brandTitle`, `brandSubtitle`, `groups` (`AppNavGroup[]`), `crumbs`, `actions` (lo que va en la barra antes de la campana), `showNotifications` y `children`.
  - `collapsibleStorageKey`: el menú se colapsa a iconos en escritorio y se recuerda (`useSidebarCollapsed`).
  - `navDataTour`: ancla de tutorial para todo el menú.
  - Cada `AppNavItem` acepta `dataTour`, `variant: "ai"` (degradado de Kadesh AI) y `extra` (etiqueta Beta, punto en vivo).
  - Escritorio (`lg`): grid `272px | contenido` con el menú fijo.
  - Móvil: el menú es un cajón. Se cierra con Escape, el ✕, el velo o al elegir una sección. Mientras está abierto, el resto queda inerte y sin scroll, y al cerrar el foco vuelve al botón.
  - Incluye "Saltar al contenido".
- **`AppSidebar`**: logo en cuadro con el degradado naranja (la K es blanca y llena su lienzo, por eso lleva aire alrededor), grupos con título. La opción activa es una píldora blanca que se desliza (`layoutId`), con el icono en naranja y un globo rojo para pendientes. Abajo va la tarjeta del usuario (Ir al sitio, Salir).
- **`AppTopBar`**: migas (en móvil solo la página actual), `actions`, campana (`NotificationBell variant="panel"`), tamaño de texto, tema y saludo con avatar.
- **`UserMenu`** (el avatar de la barra): Mi perfil, cambio entre **Panel de control** y **Operaciones** (esta última solo para admins de plataforma; la actual va marcada), Novedades, Ir al sitio y Cerrar sesión. Reemplaza el menú del avatar de la barra del sitio, que era el único camino a Operaciones.
- **`AppPageHeader`**: eyebrow, título, descripción y acciones. El `h1` lleva `data-app-title`; quien navega le pasa el foco al cambiar de vista.
- **`Reveal`**: fade-up al montar, con `index` para escalonar.
- **`AnimatedNumber`**: cifra que cuenta hacia arriba. El lector de pantalla recibe el valor final.
- **`DashAvatar`**: foto o iniciales sobre el degradado naranja.
- **Gráficas** (`charts.tsx`), hechas con divs y SVG porque el worker de Cloudflare tiene tope de 10 MB:
  - `Sparkline`: línea con área y trazo animado.
  - `ColumnBars`: barras tipo píldora. La del pico va en naranja con su cifra en una burbuja, la del periodo en curso rayada, y admite desglose apilado. Con más de 14 barras solo lleva las fechas de los extremos y repite los datos en una tabla oculta.
  - `HBarList`: ranking horizontal en naranja.

## Movimiento (`motion.ts`)

- Una sola curva: `DASH_EASE = [0.16, 0.84, 0.44, 1]`.
- Entradas: 0.55 s, `y: 10`, escalón de 50 ms con tope de 8.
- Indicadores: resorte (`indicatorTransition`). Menús: `popTransition`.
- Movimiento reducido: el shell usa `<MotionConfig reducedMotion="user">` y `globals.css` apaga las animaciones CSS dentro de `.kd-dash`.

## Quién lo usa

- **Operaciones** (`AdminDashboard`).
- **Panel de control de clientes** (`kadesh/components/panel/PanelShell`) y sus subrutas. Ver `src/components/panel/README.md`.

## Notas del panel de clientes

Ya montado (2026-11-03). Lo que se cuidó:

- `scripts/check-tours.mjs` lee `navItems` de `DashboardSidebar.tsx` (ruta y formato fijos).
- Los anclajes `data-tour="nav-*"` y `main-tab-*`, y los pasos `side: "right"`.
- El mapa de Extracción a pantalla completa (`ObtenerClientesSection.tsx`, alto calculado sobre el header actual).
- `PanelControlSkeleton` y `PanelMapSkeleton`.
