# Notificaciones (campana)

Campana en la barra de navegación. En la fase 1 solo la ven los admins de plataforma (`isPlatformAdminUser`): ahí llegan los avisos que antes eran correos al admin, como un animal nuevo de un usuario en Kadesh Pet, un servicio solicitado por una veterinaria o un cambio de datos bancarios. El modelo y las reglas viven en kadesh-back: `models/Notification/README.md`.

- **Contador:** se revisa cada 3 min (`NOTIFICATIONS_POLL_MS`) y solo con la pestaña visible; al volver a una pestaña que estuvo oculta 30 s o más se revisa de inmediato. Antes era cada 60 s también en segundo plano: una pestaña olvidada hacía 1,440 peticiones al día y no dejaba descansar al backend ni a su base. En esta fase no hay websockets. No bajes el intervalo ni quites `skipPollAttempt` sin revisar ese costo.
- **Lista:** las últimas 20, y solo se piden al abrir la campana.
- **Clic en un aviso:** lo marca como leído y lleva a la sección de Operaciones que lo resuelve (`notificationHref`). Un animal nuevo abre Kadesh Pet → Animales con ese animal.
- **Tipo nuevo:** se agrega en el back (`NOTIFICATION_TYPE`) y aquí en `constants.ts`, con su ícono y su enlace. Si un tipo no está mapeado, usa el `url` del aviso.
