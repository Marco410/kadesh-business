# Shared

## WhatsApp flotante

Mismo botón verde abajo a la derecha en la **home** y en el **panel** (`src/app/panel/layout.tsx`). Número en `KADESH_SUPPORT.phoneE164`.

- Home: hover “¿Dudas?”; un mensaje genérico.
- Panel (`showPrompts`): de vez en cuando un globo (soporte técnico, ayuda, mejoras, plan/AI). Clic abre WhatsApp con ese texto. Cerrar (X) pospone el siguiente ~1 min. Copy y textos prellenados: `PANEL_SUPPORT_PROMPTS` en `kadesh/constants/support`. No prometas tiempos de respuesta ni nombres de proveedores.
