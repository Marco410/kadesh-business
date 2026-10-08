# Perfil

La ficha de empresa vive en `ProfileCompanySection` (perfil del panel, no una ruta nueva). Los datos personales están en `ProfileData` (`?tab=profile`).

## Acceso

- Ver la tab: `perfil.ver` (sidebar y `PanelControlSection`).
- Editar nombre, foto, teléfonos y datos de empresa del usuario: `perfil.editar`. Sin ese permiso el formulario queda en solo lectura.
- Catálogo: `usuarios/README.md`.

## Cómo se presenta

Una sola tarjeta de empresa: logo, datos de contacto, colores y el bloque **Información** (qué / quién / cuánto / cómo) para Kadesh AI. El copy de IA no habla de llamadas ni créditos por prompt; ver `ai/README.md`.

## Motion

Corporate, igual que el dashboard y el CRM: 280 ms, `cubic-bezier(0.2, 0, 0, 1)`, subida de 12 px. Entra la tarjeta y los bloques del formulario en cascada. **Guardar empresa** aparece y desaparece con fade. El logo hace scale al tap. Los cuatro campos de color/contacto se animan **juntos** (no cada celda) para que la grilla conserve la misma altura. Respeta `prefers-reduced-motion`.
