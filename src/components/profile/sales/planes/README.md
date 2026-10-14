# Planes (tarjetas de precios)

`PlansSection` se usa en tres lugares: la home (`#precios`), `/precios` y el panel (`/panel/clientes/planes`). Un cambio aquí se ve en los tres.

## Tarjeta del plan Gratis (2026-10-14)

En el backend el plan se llama «Free» y cuesta 0 al mes, pero es una **prueba de 7 días**. La tarjeta decía «Free» en una página en español y «$0.00 mxn /mes», que suena a gratis para siempre y chocaba con «Prueba gratuita de 7 días». Ahora:

- Nombre **Gratis**, precio **«$0 · 7 días»** y etiqueta **«Sin tarjeta»** (se oculta si es el plan actual, para no chocar con «Tu plan actual»).
- Frase principal y caja «Todo Kadesh, sin límites de funciones»: lo único que cuenta son los créditos (1 por prospecto; el resumen diario de Kadesh AI usa unos 4).
- Botón «Probar gratis 7 días» → registro, **solo para visitantes** (quien ya tiene sesión no lo ve).
- **Pendiente:** el texto de qué pasa al terminar los 7 días (cuenta y prospectos) no está publicado hasta confirmarlo.

## Funciones en 4 bloques

`PlanFeatureGroups` reemplaza los chips/filas sueltos en **todas** las tarjetas: Kadesh AI y WhatsApp Business como chips destacados, y el resto en «Encuentra clientes», «Da seguimiento», «Cierra la venta» y «Trabaja en equipo». Un bloque sin funciones incluidas no se muestra (por eso Starter no tiene «Trabaja en equipo»): así se comparan planes por créditos y por equipo, no contando chips.

**Al agregar una función nueva** (`PLAN_FEATURE_KEYS`), asígnala a un bloque en `FEATURE_GROUPS`; si no, cae en «Más funciones».
