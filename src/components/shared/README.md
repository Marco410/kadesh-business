# Shared

## WhatsApp flotante

Mismo botón verde abajo a la derecha en la **home** y en el **panel** (`src/app/panel/layout.tsx`). Número en `KADESH_SUPPORT.phoneE164`.

- Home: hover “¿Dudas?”; un mensaje genérico.
- Panel (`showPrompts`): de vez en cuando un globo (soporte técnico, ayuda, mejoras, plan/AI). Clic abre WhatsApp con ese texto. Cerrar (X) pospone el siguiente ~1 min. Copy y textos prellenados: `PANEL_SUPPORT_PROMPTS` en `kadesh/constants/support`. No prometas tiempos de respuesta ni nombres de proveedores.

## Scroll con modal abierto

`BodyScrollLock` (montado en `ClientProviders`) corta el scroll del fondo mientras exista en el DOM un `[aria-modal="true"]` o un `[data-body-scroll-lock]`. Los backdrops de modal llevan `data-body-scroll-lock`. Un modal nuevo con overlay a pantalla completa debe poner ese atributo (o `aria-modal="true"` en el diálogo) para no dejar mover la página de atrás.

## Buscador de clientes (`ClientLeadAutocomplete`)

Lo usan los modales de proyecto, cotización, seguimiento, actividad, propuesta, tarea y la importación de chats de WhatsApp.

- La búsqueda la hace el servidor: nombre que **contenga** lo escrito, sin distinguir mayúsculas, máximo 20 coincidencias. Sin texto muestra los 20 clientes más recientes.
- Espera 300 ms después de la última tecla antes de pedir. Mientras llega la respuesta el campo sigue editable y la lista dice "Buscando…".
- Solo pide `id` y `businessName`. Antes traía 500 clientes con estatus, vendedores y contacto cada vez que se abría un modal: era la consulta más pesada de esos flujos y, con más de 500 clientes, los más antiguos no se podían elegir.
- Si el cliente ya elegido no está entre las coincidencias (al abrir una cotización guardada), se pide aparte solo su nombre.
- Límite conocido: el servidor sí distingue acentos ("cafe" no encuentra "Café"). Antes el filtro era local y los ignoraba.
