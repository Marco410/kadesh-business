# Registro de uso (`kadesh/utils/activity`)

Lo que solo sabe el navegador: qué secciones abre la gente, cuánto tiempo tiene el panel abierto, qué módulos bloqueados ve, tours, exportaciones y salida. También qué datos de clientes abre el admin de Kadesh en Operaciones. Va a la mutación `trackEvents` de kadesh-back, que lo guarda en `ActivityEvent` (y el tiempo activo en `UserActivityDay`).

## Qué se registra y dónde

| Evento | Dónde se dispara | Para qué |
| --- | --- | --- |
| `ui.section_viewed` (`section`) | `usePanelActivity`, montado una vez en `src/app/PanelActivityTracker.tsx` | Qué módulos usan de verdad |
| `auth.heartbeat` | El mismo hook, cada 5 min con la pestaña visible | Tiempo activo y "visto por última vez" |
| `ui.feature_locked_viewed`, `ui.upgrade_clicked` | `FeatureLockedSection` | Intención de compra |
| `ui.tour_completed`, `ui.tour_skipped` | `OnboardingProvider` | En qué paso abandonan los tours |
| `lead.exported` (`count`) | `exportLeadsExcel` | Uso fuerte o riesgo de que se lleven la cartera |
| `auth.logout` | `Navigation` (antes de borrar el token) | Fin de sesión |
| `admin.viewed_company` / `admin.viewed_person` / `admin.viewed_ai_prompt` | 360, ficha de persona, conversación de IA | Auditoría del admin (el back solo los acepta de admin de plataforma) |

La sección sale de la URL: `/panel?tab=clientes` → `clientes`, `/panel` → `extraccion`, otras rutas del panel sin ids (`cotizacion/:id`). Operaciones (`/panel/clientes/admin`) no se registra como navegación: lo del admin va con los `admin.*`.

## Cómo funciona

- `trackActivity(type, { metadata, entityType, entityId, companyId })` encola; el lote sale cada 10 s, al ocultar la pestaña o al salir.
- Usa `fetch` con `keepalive` y el token de `localStorage`, no Apollo: es lo único que sigue enviando cuando la página se cierra (`sendBeacon` no deja mandar `Authorization`).
- El mismo evento repetido en 3 s cuenta una vez (StrictMode monta los efectos dos veces en desarrollo; algunos componentes se vuelven a renderizar al cargar sus datos).
- Nunca lanza ni bloquea la UI. Si falla, el evento se pierde.
- El back pone actor y empresa desde la sesión y rechaza tipos que no estén en su lista (`CLIENT_EVENT_TYPES`).

## Reglas

- `metadata` chica y plana (texto, número, booleano). Nada personal: ni nombres de leads, ni teléfonos, ni textos que escribe el usuario.
- Un evento nuevo va en **dos** lugares: `TRACK_EVENT` aquí y `CLIENT_EVENT_TYPES` en kadesh-back (`models/ActivityEvent/constants.ts`). Si no está en el back, se descarta.
- Las secciones nuevas del panel se registran solas (salen de `?tab=`). Si quieres que Operaciones muestre su nombre, agrégalo a `PANEL_SECTION_LABELS` en `src/components/admin/constants.ts`.

## Decisiones

### 2026-10-10 — Eventos propios en vez de una herramienta de analítica externa

Qué: el panel manda sus eventos al back de Kadesh (Postgres), sin PostHog ni similares.

Por qué: se decidió así al planear Operaciones. Los eventos quedan junto a los datos de la empresa (plan, créditos, CRM) para cruzarlos y, más adelante, vender analítica agregada sin depender de un tercero.
