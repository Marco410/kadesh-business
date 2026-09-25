# Google Calendar en Mi Calendario

## Promesa
El vendedor y el administrador ven en un solo calendario lo que pasa en Kadesh y en sus calendarios de Google, y lo que crean en Kadesh aparece también en Google.

## Qué ve el usuario
- **Nuevo evento**: crea un evento (título, inicio/fin o todo el día, lugar, descripción). Sin fin dura 1 hora. Se envía a los calendarios de Google marcados.
- **Google Calendar**: barra plegable (con flecha y resumen "2 cuentas · 2 de 28 calendarios visibles") que despliega el panel de cuentas. Cada usuario conecta *su* cuenta; el administrador de empresa además puede conectar una cuenta **compartida** para todo el equipo.
- Cada calendario de una cuenta se marca o desmarca: marcado = se ve en Mi Calendario y recibe los eventos de Kadesh.
- Los tipos de Kadesh se distinguen por color: actividad (naranja), propuesta (azul), seguimiento (verde), **tarea** (ámbar; solo lectura, sale de `TechTask` por `responsible`) y **evento** (creado en Kadesh). Los eventos de **Google** conservan el color de su calendario en Google (puntos, etiqueta y borde); al hacer clic abren Google Calendar.
- **Capas visibles** (barra sobre el calendario, sustituye a la leyenda): una casilla por cada tipo de Kadesh (Actividades, Propuestas, Seguimientos, Tareas, Eventos) y una por cada calendario de Google visible, agrupadas por cuenta, con el color de Google. Son casillas independientes (se pueden ver varias a la vez); "Todos/Ninguno" actúa sobre un grupo. Es solo de vista y se reinicia al recargar.
- En "Google Calendar" (botón con flecha) cada cuenta es una tarjeta plegable con todos sus calendarios. Un interruptor por calendario lo hace visible u oculto; cuando está visible aparece "Kadesh envía aquí" con casillas para **Actividades, Propuestas, Seguimientos y Tareas** (por defecto todas activas, y solo aplican a registros nuevos). Con más de 8 calendarios hay buscador.
- La cuenta compartida se muestra siempre como **"Cuenta compartida de la empresa"** (barra de capas, destinos de "Nuevo evento", etiqueta de sus eventos); su calendario principal se llama "Principal" y el correo de quien la conectó solo se ve en el panel del admin (`labels.ts`).
- El panel solo lista las cuentas que el usuario puede administrar: un vendedor ve únicamente las suyas y no ve la cuenta compartida de la empresa (sus calendarios visibles sí aparecen como capas en el calendario y como destino al crear un evento). El admin de empresa ve todas.
- **Nuevo evento** pregunta a qué calendarios de Google se envía (todos los visibles vienen marcados). Un evento creado a mano solo va a los que se dejen marcados; si no hay ninguno, queda solo en Kadesh.

## Reglas de negocio (las aplica el backend)
- Cuenta personal: solo su dueño la administra. Cuenta compartida: solo el administrador de la empresa cambia su selección o la desconecta; el resto de la empresa la ve en modo lectura.
- Depende del feature de plan `calendar_crm` (ya gatea la pestaña).
- Solo las actividades, seguimientos, tareas y propuestas **nuevas** generan evento en Google; las anteriores no. En Mi Calendario esos registros siguen saliendo de sus propias queries: aquí solo se muestran los eventos `native` para no duplicar.
- Los eventos que Kadesh mismo empujó a Google (`kadeshEventId`) se omiten al leer Google, por la misma razón.

## Flujo OAuth
1. `getGoogleCalendarAuthUrl(scopeType)` → redirige a Google.
2. Google regresa a `Routes.panelGoogleCalendarCallback` (`/panel/google-calendar/callback`) con `?code&state`. Ese mismo URL debe ser `GOOGLE_CALENDAR_REDIRECT_URI` del backend y estar autorizado en Google Cloud.
3. `GoogleCalendarCallbackSection` llama a `connectGoogleCalendarAccount(code, state)` **una sola vez** (el `code` es de un solo uso) y vuelve a `?tab=calendar`.

## Archivos
- `queries.ts`: todas las queries/mutaciones y tipos (cuentas, OAuth, eventos nativos, pull de Google).
- `GoogleCalendarConnectionsPanel.tsx`: cuentas, calendarios, reconectar, actualizar lista, desconectar.
- `CalendarFilterBar.tsx`: chips de filtro por fuente.
- `CalendarEventModal.tsx`: crear / ver / borrar eventos nativos.
- `useGoogleCalendarAccounts.ts`: cuentas + ids de calendarios seleccionados (caché compartida).
- La integración con el calendario vive en `../vendedores/VendedoresCalendar.tsx` y `../SalesCalendarView.tsx`.

## Límites actuales
- Google se lee bajo demanda para el mes visible (no hay actualización en vivo); cambiar de mes o tocar un toggle vuelve a consultar.
- Los eventos de varios días de Google solo se pintan en su día de inicio.
- Los eventos nativos se crean y borran; editarlos aún no.
