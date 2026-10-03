# Panel

El botón de WhatsApp de soporte no vive en cada tab: está en `src/app/panel/layout.tsx`, así cubre extracción, CRM y rutas hijas (`/panel/creditos`, leads, etc.). Los globos periódicos se documentan en `src/components/shared/README.md`.

Mientras carga la sesión, el esqueleto depende de la ruta. En `/panel` (sin `tab`) es el del mapa: isla de búsqueda, superficie del mapa y panel de categorías. En `/panel?tab=inicio` y el resto de tabs del panel de control es el menú a la izquierda con saludo, resumen, indicadores y gráficas. El texto de carga solo lo lee el lector de pantalla.
