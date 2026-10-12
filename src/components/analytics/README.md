# Analítica (módulo del cliente)

Sección **Analítica** del panel (`?tab=analitica`). Es un módulo de pago: `PLAN_FEATURE_KEYS.ANALYTICS` (`analytics`). Qué planes lo incluyen se decide en Operaciones → Planes → Módulos. Sin el módulo se ve el aviso de "mejora tu plan" (`FeatureLockedSection`, copy "Analítica").

## Qué muestra

Velocidad comercial **solo de la empresa de quien entra** (`companyAnalytics` en kadesh-back toma la empresa de la sesión; no acepta otra):

- Cierre: tasa de cierre, ciclo de venta, valor ganado y tratos estancados.
- Primer contacto: tiempo al primer contacto y contactados en 48 h.
- WhatsApp: tiempo de respuesta, contestados en 1 h y si los clientes contestan.
- Etapas del pipeline: entraron, avanzaron, se perdieron, días en la etapa, estancados.
- Tu equipo (solo con permiso): los mismos números por vendedor, más actividades y WhatsApp enviados.
- Tratos estancados: lista con enlace al lead.

La regla de cálculo es la misma que ve Kadesh en Operaciones → Analítica → Ventas (`utils/analytics/salesVelocity.ts` del back).

## Quién ve qué

- Permiso **Ver analítica** (`analitica.ver`): entra a la sección. Sin lista de permisos, todos.
- Permiso **Ver la analítica de todo el equipo** (`analitica.ver_equipo`): ve a todo el equipo. Sin él, solo los leads que tiene asignados (lo dice arriba de la sección). Sin lista de permisos: admin de la empresa y Gerencia.

## Ayudas

Empieza con **Cómo leer esta sección** y cada número, tarjeta y columna tiene un ícono ⓘ (`InfoTip` de `kadesh/components/shared`). Los textos están en `help.ts`, en español sencillo y hablándole a "tu equipo". Hay un tour de la sección en `onboarding/registry.ts` (`analitica`).

## Decisiones

### 2026-10-12 — Módulo propio y solo de su empresa

Kadesh vende la analítica como módulo aparte. La empresa siempre sale de la sesión para que nadie pueda pedir números de otra empresa, y el vendedor sin permiso de equipo solo ve lo suyo para no exponer el desempeño de sus compañeros.
