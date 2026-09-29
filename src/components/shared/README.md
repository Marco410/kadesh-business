# Shared

## WhatsApp flotante

Mismo botón verde abajo a la derecha en la **home** y en el **panel** (`src/app/panel/layout.tsx`). Número en `KADESH_SUPPORT.phoneE164`.

- Home: hover “¿Dudas?”; un mensaje genérico.
- Panel (`showPrompts`): de vez en cuando un globo (soporte técnico, ayuda, mejoras, plan/AI). Clic abre WhatsApp con ese texto. Cerrar (X) pospone el siguiente ~1 min. Copy y textos prellenados: `PANEL_SUPPORT_PROMPTS` en `kadesh/constants/support`. No prometas tiempos de respuesta ni nombres de proveedores.

## Scroll con modal abierto

`BodyScrollLock` (montado en `ClientProviders`) corta el scroll del fondo mientras exista en el DOM un `[aria-modal="true"]` o un `[data-body-scroll-lock]`. Los backdrops de modal llevan `data-body-scroll-lock`. Un modal nuevo con overlay a pantalla completa debe poner ese atributo (o `aria-modal="true"` en el diálogo) para no dejar mover la página de atrás.
