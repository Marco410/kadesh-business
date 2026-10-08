# Panel

El botón de WhatsApp de soporte no vive en cada tab: está en `src/app/panel/layout.tsx`, así cubre extracción, CRM y rutas hijas (`/panel/creditos`, leads, etc.). Los globos periódicos se documentan en `src/components/shared/README.md`.

El menú lateral del panel de control (`DashboardSidebar`) se puede colapsar con «Ocultar menú». Colapsado muestra solo iconos: en teléfono, en fila; desde escritorio, en una columna estrecha. La preferencia se guarda en el navegador y se respeta al volver. Los `data-tour` del menú siguen en los botones aunque esté colapsado.

El ítem **Usuarios** (`?tab=usuarios`) lo ven admin de empresa y Gerencia. El resto de secciones del menú respetan permisos por módulo (`canAccessNavTab`); ver `src/components/profile/usuarios/README.md`.

Si el plan actual tiene un módulo **en beta** (Operaciones → Planes, hay que guardar), ese ítem del menú lleva la etiqueta **Beta**. Colapsado, el icono lleva un punto violeta. La marca sale del plan del catálogo con el mismo nombre, precio y periodo que la suscripción.

Mientras carga la sesión, el esqueleto depende de la ruta. En `/panel` (sin `tab`) es el del mapa: isla de búsqueda, superficie del mapa y panel de categorías. En `/panel?tab=inicio` y el resto de tabs del panel de control es el menú a la izquierda con saludo, resumen, indicadores y gráficas. El texto de carga solo lo lee el lector de pantalla.
