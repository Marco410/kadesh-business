# Agregar cliente

Formulario en `/panel/clientes/lead/agregar`. Lo abre **Agregar cliente** desde la lista. No es un tab del panel.

## Cómo se presenta

Tres pasos. El pie queda fijo:

1. **El negocio** — nombre y categoría obligatorios, teléfono, fuente (pastillas) y oportunidad (Alta / Media / Baja). Fuente por default: **Referido** (es un alta a mano, no una extracción).
2. **Ubicación** — opcional. Dirección a mano o mapa. Se puede saltar.
3. **Más datos** — email, web, redes, notas. Las reseñas van detrás de **Añadir reseñas**; no se muestran 5 campos vacíos.

Con nombre + categoría, **Guardar ahora** está disponible desde el paso 1 y 2 como botón explícito: Enter y Continuar **nunca** guardan. El CTA naranja de los pasos 1–2 es **Continuar**; en el 3 es **Agregar cliente**. Los pasos del encabezado son clicables; no se puede saltar al 2 o 3 si faltan nombre o categoría.

Enter en un input avanza de paso. En notas (textarea) sí inserta salto de línea. El alta real solo ocurre con **Guardar ahora** o **Agregar cliente**.

## Copy

- En UI: **cliente**, no “lead”.
- No mencionar GraphQL ni el mapa interno. El mapa se ofrece como **Elegir en el mapa**.
- **INEGI** y **Google Maps** como fuentes, igual que en Obtener clientes y en el filtro de la lista.

## Acceso

La feature de plan `add_own_leads`. Si no está, `FeatureLockedSection`. Sin empresa asociada, la página muestra `EmptyCompanySection` antes de montar este formulario.

## Alta rápida desde WhatsApp

La bandeja de WhatsApp (`profile/whatsapp`) crea clientes con **solo nombre y teléfono** usando el mismo `addOwnLead`, con fuente `WhatsApp`. No pasa por este formulario ni pide categoría: es para empezar a escribir ya. Por eso el barrel (`index.ts`) exporta también `ADD_OWN_LEAD_MUTATION` y sus tipos: se importa desde ahí, no desde `queries.ts`.

- `WhatsApp` es un texto libre, **no** una de las pastillas de **Fuente** de este formulario. Si algún día se lista o filtra por fuente, hay que agregarlo en los dos sitios.
- La alta rápida no oculta el botón según el plan; la feature `add_own_leads` la valida el backend y el aviso de error llega al usuario.
