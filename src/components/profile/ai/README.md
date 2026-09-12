# Kadesh AI (panel)

Pantalla de empresa en `/panel?tab=ai` (`Routes.panelAi`). Solo la ve quien `canManageCompanyAi` (admin de empresa o admin de plataforma). Los vendedores usan la IA con lo configurado aquí; no entran a esta tab.

Marca en UI: `KADESH_URIM_AI_NAME` (`"Kadesh AI"`). No mostrar proveedor ni modelo al usuario en mensajes de éxito (p. ej. prueba de conexión: `"Conexión OK con Kadesh AI"`).

No reexportes componentes React desde `index.ts` (rompe el language service). Importa archivos: `kadesh/components/profile/ai/AiSection`. El barrel solo exporta constants, queries y `useCompanyAiLive`.

## Tabs (`AiSection`)

1. **Dashboard** — dos columnas: a la izquierda resumen del día + recomendaciones; a la derecha lo que Kadesh AI ya sabe del negocio (`AiCompanyKnowledgeCard`).
2. **Información** — formulario editable Qué / Quién / Cuánto / Cómo (`AiCompanyInfoTab`). El usuario edita los recuadros, guarda, y el Dashboard actualiza el resumen. Logo, colores, contacto y términos se quedan en Datos del perfil.
3. **Configuración** — modalidad BYOK vs administrado, créditos, API key, probar conexión (`AiSettingsSection`). En administrado, el saldo explica cobro y tope **sin jerga**: 1 crédito = 1,000 tokens (lo que escribe la IA cuenta ×5; un digest típico son 4 créditos); tope de 15 consultas/minuto y 500/día. Nunca digas “rate limit”, RPM ni el fallback de modelos. Si el cupo se llena: espera o pasa a API key propia. Números en `constants.ts`, alineados con kadesh-back.

**Tab por defecto (una sola vez al entrar):**

- IA **no configurada** → Configuración.
- IA **configurada** (`isCompanyAiConfigured`: managed, o BYOK con `aiApiKeyPreview`) → Dashboard.

No cambies de tab después de guardar. `configured` ≠ `isAiLive`: live exige además un `connection_test` exitoso. El digest, el playbook y el brief de empresa se piden al modelo solo si `isAiLive`.

## Copy: la IA ya conoce el negocio

Al usuario: Kadesh **ya sabe** de su empresa por lo que van capturando (perfil / Información) y por cómo usan el SaaS.

**Nunca** digas que el contexto se reenvía, se inyecta o “alimenta cada llamada / cada respuesta”. Eso es detalle de implementación.

Misma regla en `ProfileCompanySection` (bloque Información del perfil) y en la tarjeta “Contexto de tu negocio” de Configuración. Los campos y labels canónicos están en `ONBOARDING_CONTEXT_FIELDS`.

## Lo que sabe de la empresa (columna derecha)

Por cada pilar (Qué, Quién, Cuánto, Cómo): un **resumen** de lo que ya quedó escrito y **puntos exactos** que aún no mencionó.

Se **regenera cada vez que se guardan esos cuatro campos** (tab Información o Datos del perfil), si la IA está live. Si el texto no cambió, no se vuelve a llamar al modelo. Si aún no hay brief y el perfil ya tiene texto, el Dashboard pide uno la primera vez.

El Dashboard prioriza el escaneo: título + 2 líneas; “Ver más” solo si el texto realmente se recorta. En “Lo que sabe”, cada pilar usa `Qué — Oferta principal` (y equivalentes). Lo que aún no está en el perfil no se esconde en “por completar”: va junto abajo, titulado **Para afinar lo que sabe**, con CTA a Información.

## Recomendaciones

Heurísticas inmediatas desde onboarding + nichos (`profileRecommendations.ts`). Si la IA está live, pueden pedir un playbook cacheado (`aiPlaybook` / `generateAiPlaybook` en el backend). El playbook sustituye las heurísticas cuando existe.

## Digest diario

`DailyDigestCard` vive en **Inicio** (`CompanyDashboard`) y en esta tab Dashboard (columna izquierda). No quitarlo de Inicio al meterlo aquí. 3 siguientes pasos del pipeline (cotizaciones enviadas, sin contacto, seguimientos vencidos, leads fríos). Cache por día en backend.

## Backend

GraphQL en kadesh-back: `dailyDigest` / `generateDailyDigest`, `aiPlaybook` / `generateAiPlaybook`, `companyAiBrief` / `generateCompanyAiBrief`. Tras añadir campos, hay que reiniciar el API.
