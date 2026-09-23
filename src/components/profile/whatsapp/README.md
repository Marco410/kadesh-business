# WhatsApp Business (panel)

Tab del panel en `/panel?tab=whatsapp` (ítem **WhatsApp Business** del menú lateral, no una ruta nueva). Cada empresa conecta **su propio** número y su propia App de Meta (BYOK): no hay una App de Kadesh compartida. La parte de servidor, los permisos y por qué está así están en `kadesh-back/models/README.md` (entradas 2026-09-22 y 2026-09-23).

## Acceso

Hoy el tab lo ve **solo el admin de empresa** con la feature de plan `WHATSAPP` (`requireAdminCompany` en el menú y `isAdminCompany && hasWhatsappFeature` al renderizar en `PanelControlSection`). Si no, `FeatureLockedSection`.

**Pendiente de decidir:** el backend ya deja que un vendedor vea *sus* chats (los de clientes que tiene asignados y los internos donde participa), pero la UI no le da la bandeja. Hoy un vendedor solo llega a los chats de sus clientes desde la ficha del cliente (`LeadCrmActions` → `WhatsAppChatModal`), y **no tiene entrada a los chats internos**. Para que "asignar un chat para que solo ese vendedor lo vea" funcione de punta a punta hay que abrirle el tab de Chats (y dejar Configuración solo para el admin). No lo cambies sin decidir el acceso: es una decisión de rol/plan.

## Tabs

**Chats** y **Configuración**. Arranca en **Configuración** y no salta sola a Chats: sin credenciales conectadas no hay nada que ver.

### Chats

Bandeja estilo WhatsApp: conversaciones a la izquierda, chat abierto a la derecha. En móvil se ve una cosa a la vez (lista o chat, con flecha para volver).

- La lista trae **solo conversaciones que ya tienen mensajes**, la más reciente arriba. Excepción: un chat que abriste en esta sesión y aún no tiene mensajes aparece como **Nuevo** para poder escribirle. Eso vive solo en el navegador: al recargar desaparece hasta que haya un mensaje (el cliente sí queda guardado en Clientes).
- **Nueva** abre dos pestañas:
  - **Cliente** — alta rápida con solo nombre y teléfono (`addOwnLead`, fuente `WhatsApp`). No pedimos categoría ni ubicación a propósito: es para escribir ya. El formulario completo sigue en `sales/lead`.
  - **Mi equipo** — no crea nada; usa el teléfono del perfil de la persona. Sin teléfono aparece deshabilitado.
- **Regla de las 24 h de Meta**: si la persona no ha escrito en 24 h, en vez del cuadro de texto se ve **Iniciar conversación** (plantilla aprobada). Aplica igual a chats con clientes y a chats internos. Las plantillas de marketing las cobra Meta por mensaje.

### Quién ve qué (lo decide el backend, la UI solo lo refleja)

| Conversación | La ven |
|---|---|
| Cliente asignado a un vendedor | Ese vendedor + admins |
| Cliente sin asignar | Solo admins |
| Chat interno | La persona + quien lo abrió + admins |
| Número que no coincide con nadie | Solo admins (no arma conversación en la bandeja) |

**Asignar un chat = asignarle el cliente al vendedor** (el mismo campo del CRM). No existe una asignación propia de WhatsApp a propósito: la visibilidad ya cuelga de esa asignación y un segundo campo sería una segunda verdad. El selector **Asignado a** solo lo ve el admin; **Nadie (solo admins)** deja el chat sin dueño. En la lista, un chat sin dueño muestra **Sin asignar** solo a quien puede asignar.

### Configuración

Credenciales (Phone Number ID, WABA ID, Access Token, App Secret), guardar / probar / quitar, guía paso a paso e **Importar historial de chats**.

- **Advertencia de exportar antes de conectar**: al mover un número a la Cloud API deja de usarse en la app normal de WhatsApp y su historial ya no se puede sacar de ahí. Está en tres sitios que deben decir lo mismo: el banner ámbar (solo mientras **no** está conectado), el paso 2 de la guía y el texto de Importar historial.
- **La Callback URL y el Verify Token nunca van en el código del front.** Se piden en vivo con `companyWhatsappWebhookInfo` (autenticada, solo para quien puede administrar el WhatsApp de la empresa; el valor sale de env vars del backend). Si esa consulta falla, la guía dice "pídeselos a tu contacto en Kadesh". El token se muestra **oculto hasta el clic**, con botón de copiar. Ocultarlo es solo para que no quede a la vista en pantalla: no es una barrera de seguridad.
- El aviso **Conexión OK** no se borra en el efecto que sincroniza el formulario. Una prueba exitosa actualiza `whatsappConnectedAt`, el refetch dispara ese efecto y antes se llevaba el mensaje al instante.

## Un solo panel de chat

`WhatsAppChatPanel` recibe `target` (`{ kind: "lead" | "team", id }`) y lo usan el tab de Chats **y** el modal de la ficha del cliente. Es a propósito: polling, plantilla de inicio, adjuntos y ventana de 24 h se comportan igual en los dos sitios. Si cambias uno, cambia el otro sin querer. El modal solo pone el marco.

`WhatsAppNewConversationModal` reutiliza `ADD_OWN_LEAD_MUTATION`, que `sales/lead` exporta en su barrel para esto.

## Copy

En UI decimos **cliente** (no "lead"), **chat**, **conversación**, **equipo**, **asignado**. Nunca `salesPerson`, `teamMember` ni ids.
