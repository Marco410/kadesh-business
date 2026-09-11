# Kadesh AI (panel)

Pantalla de empresa en `/panel?tab=ai` (`Routes.panelAi`). Solo la ve quien `canManageCompanyAi` (admin de empresa o admin de plataforma). Los vendedores usan la IA con lo configurado aquí; no entran a esta tab.

Marca en UI: `KADESH_URIM_AI_NAME` (`"Kadesh AI"`). No mostrar proveedor ni modelo al usuario en mensajes de éxito (p. ej. prueba de conexión: `"Conexión OK con Kadesh AI"`).

No reexportes componentes React desde `index.ts` (rompe el language service). Importa archivos: `kadesh/components/profile/ai/AiSection`. El barrel solo exporta constants, queries y `useCompanyAiLive`.

## Tabs (`AiSection`)

1. **Dashboard** — resumen del día (`DailyDigestCard`) + recomendaciones (`AiRecommendationsCard`).
2. **Información** — solo el bloque Qué / Quién / Cuánto / Cómo (`AiCompanyInfoTab`). Logo, colores, contacto y términos se quedan en Datos del perfil.
3. **Configuración** — modalidad BYOK vs administrado, créditos, API key, probar conexión (`AiSettingsSection`).

**Tab por defecto (una sola vez al entrar):**

- IA **no configurada** → Configuración.
- IA **configurada** (`isCompanyAiConfigured`: managed, o BYOK con `aiApiKeyPreview`) → Dashboard.

No cambies de tab después de guardar. `configured` ≠ `isAiLive`: live exige además un `connection_test` exitoso. El digest y el playbook de IA se piden solo si `isAiLive`.

## Copy: la IA ya conoce el negocio

Al usuario: Kadesh **ya sabe** de su empresa por lo que van capturando (perfil / Información) y por cómo usan el SaaS.

**Nunca** digas que el contexto se reenvía, se inyecta o “alimenta cada llamada / cada respuesta”. Eso es detalle de implementación.

Misma regla en `ProfileCompanySection` (bloque Información del perfil) y en la tarjeta “Contexto de tu negocio” de Configuración. Los campos y labels canónicos están en `ONBOARDING_CONTEXT_FIELDS`.

## Recomendaciones

Heurísticas inmediatas desde onboarding + nichos (`profileRecommendations.ts`). Si la IA está live, pueden pedir un playbook cacheado (`aiPlaybook` / `generateAiPlaybook` en el backend). El playbook sustituye las heurísticas cuando existe.

## Digest diario

`DailyDigestCard` vive en **Inicio** (`CompanyDashboard`) y en esta tab Dashboard. No quitarlo de Inicio al meterlo aquí. 3 siguientes pasos del pipeline (cotizaciones enviadas, sin contacto, seguimientos vencidos, leads fríos). Cache por día en backend.

## Backend

GraphQL en kadesh-back (`dailyDigest`, `generateDailyDigest`, `aiPlaybook`, `generateAiPlaybook`). Tras añadir campos, hay que reiniciar el API.
