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
