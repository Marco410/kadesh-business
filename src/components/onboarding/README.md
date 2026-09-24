# Onboarding: tutoriales guiados

## Promesa
Un usuario nuevo aprende a conseguir y registrar clientes en un minuto, y puede repasar cualquier sección cuando quiera.

## Cuándo aparece
- **Tutorial de bienvenida (`welcome`)**: automático la primera vez que el usuario entra a `/panel`, tanto con registro por correo como con Google. La señal es el progreso guardado, no el query `?registro-exitoso=1`.
- Usuarios creados antes de `ONBOARDING_LAUNCH_DATE` no lo ven solos; pueden abrirlo desde el botón de ayuda.
- **Tutoriales de sección**: solo bajo demanda con el botón "Tutorial" (`TourHelpButton`). Elige el tour de la sección actual y, si no hay, el de bienvenida.
- Siempre se puede salir (X, Esc o clic fuera). Salir cuenta como "visto" y no vuelve a aparecer solo.

## Tono y copy
Español, tuteo, frases cortas, una idea por paso. Sin nombres de proveedores ni detalles técnicos. Cada paso dice qué hacer, no cómo está construido.

## Acceso
Los pasos se omiten solos si el elemento no existe (rol, plan o feature sin acceso) o si `when(ctx)` es falso. No duplicar reglas de acceso aquí: si el botón no se renderiza, el paso se salta.

## Dónde vive
- `registry.ts`: única fuente de verdad de los tours.
- `OnboardingProvider` (dentro de `ClientProviders`): corre el tour con driver.js y navega entre secciones con `router.push` (el panel es un SPA por `?tab=`).
- Progreso: `User.onboardingState` (JSON en kadesh-back, solo lo lee/edita el propio usuario) + `localStorage` como respaldo. Se unen ambos para no repetir el tour si una falla.
- Estilos: `tour.css` (claro/oscuro, ancho completo en móvil).

## Cómo agregar o mantener un paso (obligatorio al crear features)
1. Pon `data-tour="<seccion>-<elemento>"` en el elemento (o reutiliza un `#id` estable).
2. Agrega el paso en `registry.ts` (en el tour de la sección y, si es clave, en `welcome`).
3. Si cambian pasos de un tour de forma relevante, sube su `version`: se vuelve a ofrecer.
4. Si agregas una sección al sidebar (`navItems`), regístrala o exímela en `scripts/check-tours.mjs`.
5. Corre `pnpm check:tours`.

## Pendiente
Secciones del sidebar sin tour propio (ver `EXEMPT_NAV_KEYS` en `scripts/check-tours.mjs`): perfil, vendedores, archivos, proyectos, calendario, WhatsApp, referidos, novedades. Ir retirándolas de esa lista al agregar su tour.
