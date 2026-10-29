# Kadesh AI (panel)

Pantalla de empresa en `/panel?tab=ai` (`Routes.panelAi`).

## Acceso

- Ver la tab: `ai.ver`. Sin lista de permisos (legado): solo admin de empresa / plataforma (`canManageCompanyAi`).
- Tab **Configuración** y mutaciones de proveedor/key: `ai.configurar` (mismo fallback de legado).
- Quien solo tiene `ai.ver` ve Dashboard e Información; no la config. Catálogo: `usuarios/README.md`.

Marca en UI: `KADESH_URIM_AI_NAME` (`"Kadesh AI"`). No mostrar proveedor ni modelo al usuario en mensajes de éxito (p. ej. prueba de conexión: `"Conexión OK con Kadesh AI"`).

Color seleccionado: el mismo degradado violeta–azul de los chips de marketing (`ai-urim-fill`). El ítem del menú lateral, el ícono del encabezado y la tab activa (Dashboard / Información / Configuración) lo usan; el resto del panel sigue en naranja.

No reexportes componentes React desde `index.ts` (rompe el language service). Importa archivos: `kadesh/components/profile/ai/AiSection`. El barrel solo exporta constants, queries y `useCompanyAiLive`.

Visuales compartidos en `AiVisuals.tsx`: `AiMeter` (avance contra un tope, relleno con el degradado y riel violeta claro), `AiSegmentMeter` (puntos de una pregunta), `PillarStateIcon`, `AiKindChip`, `AiActionLinkButton` y `AiThinking`. Botones de acción del panel siguen en naranja; lo que es “de la IA” va en violeta.

## Tabs (`AiSection`)

1. **Dashboard** — de arriba abajo:
   - `AiOverviewCard`: **qué hace la IA y en qué va**. Estado (Activa / Falta probar la conexión / Sin activar) y el flujo en 3 pasos, cada uno con su dato real: _Conoce tu negocio_ (medidor %), _Revisa tu pipeline_ (pendientes de hoy), _Te dice qué hacer_ (pasos listos o por generar). El único botón grande es activar/probar; completar el perfil es un enlace dentro del paso 1.
   - Columna izquierda: `AiTodayCard` (resumen del día) y `AiRecommendationsCard`. Columna derecha: `AiCompanyKnowledgeCard` (lo que ya sabe, fija al hacer scroll).
2. **Información** — paso a paso, una pregunta a la vez (`AiCompanyInfoTab`). Arriba: “N de 4 respondidas” con medidor y un stepper Qué / Quién / Cuánto / Cómo; cada pregunta **guardada con texto** lleva check verde, y un punto naranja marca cambios sin guardar. Por paso: la pregunta en grande (`question`), ejemplo como placeholder (`example`), medidor de “nivel de detalle” (misma regla de longitud que el backend) y a la derecha qué mencionar (`PILLAR_GUIDE_POINTS`) o, si el brief de IA está vigente para esa respuesta, “Kadesh AI aún no sabe” con sus huecos. Botón principal: “Guardar y seguir” / “Siguiente” / “Saltar por ahora”; en la última, “Guardar y terminar”. Desde el Dashboard se puede abrir directo en una pregunta (`initialStep`); sin paso, abre en la primera sin responder. Logo, colores, contacto y términos se quedan en Datos del perfil.
3. **Configuración** — modalidad BYOK vs administrado, créditos, API key, probar conexión (`AiSettingsSection`). En administrado, el saldo explica cobro y tope **sin jerga**: 1 crédito = 1,000 tokens (lo que escribe la IA cuenta ×5; un digest típico son 4 créditos); tope de 15 consultas/minuto y 500/día. Nunca digas “rate limit”, RPM ni el fallback de modelos. Si el cupo se llena: espera o pasa a API key propia. Números en `constants.ts`, alineados con kadesh-back. En marketing (`KADESH_AI_CREDIT_HINT`) di lo mismo: misma bolsa que extraer leads; Pro/Agencia = más créditos, no otra IA. No inventes un tope de IA distinto al backend.

   **BYOK:** al elegir “API key propia”, formulario y guía van **a mitades** (50/50): izquierda proveedor/key/modelo/guardar, derecha `ByokApiKeyGuide`. En móvil, formulario arriba y guía abajo. Claude, OpenAI y Gemini, cada uno con 3 pasos y enlace a su consola. Clic en **toda la tarjeta** elige el proveedor (el texto “Elegir” es solo la señal); el enlace a la consola sigue aparte. Copy y URLs en `AI_PROVIDER_KEY_GUIDES`. No prometas precios ni cupos de esos proveedores; el cobro es de su cuenta, no créditos Kadesh. En mensajes de éxito de conexión sigue sin nombrarse el proveedor.

**Tab por defecto (una sola vez al entrar):**

- IA **no configurada** → Configuración.
- IA **configurada** (`isCompanyAiConfigured`: managed, o BYOK con `aiApiKeyPreview`) → Dashboard.

No cambies de tab después de guardar. `configured` ≠ `isAiLive`: live exige además un `connection_test` exitoso. El digest, el playbook y el brief de empresa se piden al modelo solo si `isAiLive`.

## Tutorial guiado

El tour `ai` (`onboarding/registry.ts`) recorre encabezado y las tres tabs con anclas `data-tour="ai-header"`, `ai-tabs` y `ai-tab-<key>`; abre desde el botón "Tutorial" del panel. Solo resalta elementos siempre visibles: no cambia de tab. Mismo tono y prohibiciones de copy que esta pantalla (sin proveedor, modelo ni jerga). Si agregas una tab, agrégala al tour.

## Copy: la IA ya conoce el negocio

Al usuario: Kadesh **ya sabe** de su empresa por lo que van capturando (perfil / Información) y por cómo usan el SaaS.

**Nunca** digas que el contexto se reenvía, se inyecta o “alimenta cada llamada / cada respuesta”. Eso es detalle de implementación.

Misma regla en `ProfileCompanySection` (bloque Información del perfil) y en la tarjeta “Contexto de tu negocio” de Configuración. Los campos y labels canónicos están en `ONBOARDING_CONTEXT_FIELDS`.

## Landing

La sección `#kadesh-ai` (`KadeshAiSection` en home, después de la vitrina de plataforma) explica el mismo flujo: perfil → pipeline → 3 pasos de hoy. El mock del resumen es **ejemplo**, no datos reales. Misma marca y mismas prohibiciones de copy. CTA a registro.

## Motion

Corporate, igual que dashboard, perfil y CRM: 280 ms, `cubic-bezier(0.2, 0, 0, 1)`, subida de 12 px. Tokens en `motion.ts`.

- Encabezado y tablist entran en fade-up. La tab activa usa `layoutId` con el degradado `ai-urim-fill`; el contenido de cada tab entra/sale con `AnimatePresence` (wait).
- Dashboard anima la cabecera y las **dos columnas** (digest+recs vs conocimiento), no cada tarjeta suelta. Señales, pasos, recomendaciones y pilares entran en cascada corta. Los medidores crecen una vez (600 ms).
- Información: cada pregunta entra/sale con un desliz horizontal corto (`AnimatePresence` wait). El aviso de “Listo” aparece con fade.
- Mientras la IA genera, `AiThinking` muestra lo que está haciendo como checklist que avanza solo y se queda en el último paso hasta que llega la respuesta. Sustituye a los esqueletos grises.
- Configuración: contexto y formulario en cascada. Las dos modalidades de pago se animan como **un grupo** (`h-full` en cada radio). BYOK: las tres guías de proveedor en cascada.
- Respeta `prefers-reduced-motion`: solo opacity, sin y ni layoutId.

## Lo que sabe de la empresa (columna derecha)

Por cada pilar (Qué, Quién, Cuánto, Cómo): **estado** (check verde _Completo_, ámbar _Falta afinar_, gris _Sin responder_; siempre ícono + texto, nunca solo color), un medidor de 3 segmentos, el **resumen** y, plegado en “Para afinar (n)”, los huecos exactos con enlace a esa pregunta. Una pregunta vacía no repite “Todavía no…”: muestra la pregunta y “Responder”. Arriba: “N de 4 preguntas respondidas · conoce tu negocio al X%”.

**Cómo se calcula el %** (`companyKnowledge.ts`): cada pregunta vale 3 puntos (los 3 de `PILLAR_GUIDE_POINTS`). Vacía = 0; con texto, cada hueco resta un punto, sin bajar de 1. % = puntos / 12. Los huecos salen del brief de IA si sigue vigente para esa respuesta; si no, de la regla de longitud (la misma que `fallbackCompanyBriefPillars` en kadesh-back).

**Brief vigente por pregunta** (`useCompanyKnowledge`): el `sourceHash` del brief es el texto de las 4 respuestas unido con `\n---\n` (igual que kadesh-back). Si una respuesta cambió desde el brief, esa pregunta usa la lectura local hasta que se regenere: nunca mostramos huecos de un texto viejo.

**Cuándo se regenera**: al abrir el Dashboard, si no hay brief (y el perfil tiene texto) o si el perfil cambió desde el último (`force: true`; el backend no cobra si el hash coincide). Una vez por montaje, sin reintento en bucle. Datos del perfil sigue regenerando al guardar.

> Decisión (2026-10-28): Información ya **no** regenera al guardar. Con el paso a paso se guarda pregunta por pregunta y eso serían hasta 4 llamadas al modelo (créditos en administrado) por una sola sesión de llenado. Regenerar al ver el Dashboard cuesta una sola llamada y llega a tiempo, porque el brief solo se muestra ahí.

## Recomendaciones

Heurísticas inmediatas desde onboarding + nichos (`profileRecommendations.ts`). Si la IA está live, pueden pedir un playbook cacheado (`aiPlaybook` / `generateAiPlaybook` en el backend). El playbook sustituye las heurísticas cuando existe.

Se muestran como **tarjetas sin número** en rejilla de 2 (son consejos, no pasos en orden), cada una con tipo e ícono. Subtítulo: “Escritas por Kadesh AI · fecha” o “Sugerencias según tu perfil”. Sin perfil ni nichos: estado vacío con “Responder preguntas”. Lo que falta del perfil **no** va como recomendación: ya lo muestran los checks de “Lo que sabe”.

## Tipo de cada acción

`classifyAiAction` (`actionKinds.ts`) le pone tipo a cada paso del digest y a cada recomendación leyendo título y detalle: Seguimiento, Cotización, Reactivar, Calificar, Primer contacto, Prospección, Perfil, Mensaje o “Siguiente paso”. El tipo da ícono, etiqueta y a dónde ir (calendario, cotizaciones, clientes, extracción o la tab Información). El enlace solo aparece si la persona puede abrir esa pantalla (`canAccessNavTab`, vía `navCtx` que pasa `PanelControlSection`). Si el patrón no reconoce el texto, queda “Siguiente paso” sin enlace: mejor sin botón que un botón equivocado.

## Digest diario

`DailyDigestCard` vive en **Inicio** (`CompanyDashboard`). En esta tab, el digest es `AiTodayCard`. Ambos usan `useDailyDigest` (query, generar, créditos) y `AiStepTimeline`, así que se ven y se comportan igual. No quitarlo de Inicio. Cache por día en backend.

`AiTodayCard` tiene dos bloques:

1. **Lo que revisa en tu pipeline**: 4 números del CRM, en el orden en que el backend los prioriza (`AI_PIPELINE_SIGNALS`): seguimientos vencidos, cotizaciones sin respuesta, sin primer contacto, leads fríos (`AI_COLD_LEAD_DAYS`, igual que `COLD_LEAD_DAYS` en kadesh-back). Los filtros de `useAiPipelineSignals` copian los de `gatherDailyDigestSnapshot`. No usan la IA: se ven aunque esté apagada, que es justo lo que explica qué hará. La primera señal con pendientes se resalta con “Empieza aquí”.
2. **Tus 3 pasos para hoy**: línea de tiempo numerada (tipo, título, detalle, enlace). Sin IA live: vista previa borrosa con candado y botón de activar/probar. Generando: `AiThinking`.

Por qué tarjetas de número y no una gráfica de barras: los conteos tienen escalas muy distintas (miles de leads sin contacto vs. 3 seguimientos) y una barra haría invisibles justo los más urgentes.

## Backend

GraphQL en kadesh-back: `dailyDigest` / `generateDailyDigest`, `aiPlaybook` / `generateAiPlaybook`, `companyAiBrief` / `generateCompanyAiBrief`. Tras añadir campos, hay que reiniciar el API.
