# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Kadesh is a Next.js (App Router) SaaS B2B app: a lead-extraction tool (Google Maps scraping with phone numbers) bundled with an integrated CRM. The repo is both the public marketing site (landing, pricing, "conócenos", programmatic-SEO niche pages) and the authenticated app (`/panel` — extraction tool, CRM leads/pipeline, quotations, workspaces, subscriptions/credits billed via Stripe). The GraphQL API is a separate KeystoneJS backend, not part of this repo.

## Commands

```bash
pnpm install     # always use pnpm — never npm or yarn
pnpm dev         # start dev server (localhost:3000)
pnpm build       # production build
pnpm start       # run production build
pnpm lint        # eslint (eslint-config-next core-web-vitals)
pnpm preview     # OpenNext build + local Cloudflare Workers preview (workerd)
pnpm deploy      # OpenNext build + deploy to Cloudflare Workers
```

There is no test suite configured in this repo currently.

### Hosting (Cloudflare Workers via OpenNext)

Production runs on Cloudflare Workers through `@opennextjs/cloudflare`, not Vercel. Config lives in `open-next.config.ts` (R2 incremental cache + Durable Object revalidation queue, needed because the blog and home use `revalidate`) and `wrangler.jsonc` (bindings, custom domains). The `www.` host is redirected to `https://kadesh.com.mx` in `next.config.ts` `redirects()`. `negocios.kadesh.com.mx` is not served by this worker: it falls under the `*` wildcard DNS record (shared with registro, food, dev-front), which must not be touched. `workers_dev` is explicitly `false` (the site is only served on the custom domains) and `preview_urls` is `true`, so each version uploaded with `pnpm run upload` (e.g. from a non-`main` branch) gets its own preview URL before being promoted.

The OpenNext build runs **`next build --webpack`**, not Turbopack (set via `buildCommand` in `open-next.config.ts`): with Turbopack every page ships a ~2.7 MB client-reference-manifest and the worker ends up ~11.7 MB gzipped, over Cloudflare's 10 MB limit; with webpack it's ~4.9 MB. It needs `NODE_OPTIONS=--max-old-space-size=6144` or webpack fails with "heap out of memory". Check the size with `pnpm wrangler deploy --dry-run --outdir /tmp/cf-dry` (the `gzip` figure must stay under 10 MB). `@vercel/analytics` / `@vercel/speed-insights` were removed since they only work on Vercel.

### Environment

Copy `.env` and fill in real values (Stripe publishable key, Google Maps/OAuth client id, image domain). The GraphQL endpoint env var is **`NEXT_PUBLIC_API_URL`** (not `NEXT_PUBLIC_GRAPHQL_ENDPOINT` — the README is stale on this).

## Architecture

### Path alias

All internal imports use the **`kadesh/*`** alias, mapped to `./src/*` (see `tsconfig.json`). Never use deep relative imports like `../../../utils/foo` — use `kadesh/utils/foo`.

```ts
import { Routes } from "kadesh/core/routes";
import { AnimalCard } from "kadesh/components/animals";
```

### Directory layout

- `src/app/` — Next.js App Router pages/layouts. Route groups are thin: most pages just render one section component from `src/components/`.
- `src/components/<feature>/` — feature code, colocated: components, `hooks/`, `queries.ts`/`mutations.ts`, `constants.ts`, `types.ts`, a barrel `index.ts` exposing the feature's public API, and a `README.md` for product/UX/copy decisions that the code does not make obvious. Import other features via that barrel, not internal file paths. Exception: `profile/ai` does not barrel-export React components (import the file).
- `src/core/routes.ts` — the single source of truth for every internal path (`Routes.panel`, `Routes.panelLead(id)`, etc.). Always link/navigate through `Routes`, never hardcode a path string.
- `src/providers/` — `apollo-client.ts` (Apollo Client + KeystoneJS session-token auth header + upload link) and `ThemeProvider`. Never instantiate a second Apollo client in a component.
- `src/utils/` — pure helpers, `UserContext` (client-side auth state), `getAuthUser.ts`, formatters. No UI here.
- `src/constants/constans.ts` — most of the app's shared enums/lookup tables live in this one file: `Role`, CRM `PIPELINE_STATUS` (+ per-status Tailwind color maps), `PLAN_FEATURE_KEYS`/`PLAN_FEATURES_MAP` (feature-gating per subscription plan), `QUOTATION_STATUS`, `SUBSCRIPTION_STATUS`, and `NICHE_TARGET_MAPPING` (drives the programmatic-SEO `/clientes-para/[nicho]` pages). Check here before adding a new status/enum elsewhere.

### Auth

Auth is KeystoneJS session-based: a `keystonejs-session-token` is stored in `localStorage` and attached as a `Bearer` header by the Apollo auth link (`src/providers/apollo-client.ts`). `UserProvider`/`useUser()` (`src/utils/UserContext.tsx`) holds the client-side authenticated user, fetched via the `authenticatedItem` GraphQL query. Role checks go through `kadesh/utils/user-roles.ts` (e.g. `isAdminCompanyUser`), checking against `Role` in `constants/constans.ts`. Platform admins can "entrar como" another user from Operaciones: `kadesh/components/impersonation` swaps the session token for a read-only one (the backend blocks every mutation) and keeps the admin token in `kadesh-admin-session-token`. When the backend rejects a token (sessions closed, suspended, expired) it returns `extensions.session`; `SessionEndedListener` (`src/components/auth/`) then clears the token and sends the person to the login with the reason.

### The panel is a client-rendered SPA, not folder-routed

Most of `/panel/*` is NOT separate App Router pages per view — `src/app/panel/page.tsx` renders a single `PanelPageSection`, which is a `"use client"` component that switches between sub-sections based on the `?tab=` query param (see `PanelPageSection.tsx`). CRM sub-views (leads, workspaces, quotations, credits, etc.) are swapped client-side inside that shell, driven by `usePathname`/`useSearchParams` + local state, not by navigating to new routes. When adding a new panel view, follow this tab-based pattern rather than assuming a new file under `src/app/panel/` is needed.

`WorkspaceProvider` (`src/components/profile/sales/workspaces/WorkspaceContext.tsx`) tracks the currently selected CRM workspace (persisted client-side). It only wraps `/panel*` and `/admin*`, via `PanelAppProviders`.

### Provider stack

`src/app/ClientProviders.tsx` composes, in order: `CookieConsentProvider` → `ThemeProvider` → `ApolloProviderWrapper` → `UserProvider`, and wraps the whole app via `RootLayout`. Inside it, `/panel*` and `/admin*` also get `PanelAppProviders` (`HeroUIProvider` → `WorkspaceProvider` → `OnboardingProvider`), and `/auth*` gets `AuthAppProviders`. This keeps driver.js and workspace state out of the marketing bundle. Anything needing workspace or onboarding context must render under a panel route.

### Plan-gated features

Subscription plans gate CRM functionality via `PLAN_FEATURE_KEYS`/`PLAN_FEATURES_MAP` in `constants/constans.ts`, checked with helpers in `src/components/profile/sales/helpers/plan-features.ts` and surfaced via `FeatureLockedSection`/`RoleAccessDeniedSection`. When adding a gated CRM feature, register its key there first. Example: the customer **Analítica** section (`kadesh/components/analytics`, tab `analitica`) is gated by `analytics` and by the `analitica.ver` / `analitica.ver_equipo` permissions; the backend `companyAnalytics` always uses the session's company.

### Activity tracking

`kadesh/utils/activity` sends browser-only usage events (sections viewed, heartbeat, locked features, tours, exports, logout, and admin views in Operaciones) to the backend `trackEvents` mutation. Panel sections are tracked automatically from `?tab=`/path by `src/app/PanelActivityTracker.tsx`. A new client event type must be added both to `TRACK_EVENT` here and to `CLIENT_EVENT_TYPES` in kadesh-back, or the backend drops it. Never put personal data (lead names, phones, free text) in event metadata. See `src/utils/activity/README.md`.

Signup attribution is separate: `AttributionTracker` (`kadesh/components/consent`, mounted in `ClientProviders`) stores the first-touch `utm_*`, referrer domain and landing path via `kadesh/utils/attribution` (skipped if cookies were rejected), and the signup hooks send it as `attribution` to `registerUser` / `authenticateUserWithGoogle`. It feeds Operaciones → Analítica → Adquisición.

### Onboarding tour

`src/components/onboarding/` runs the guided tours (driver.js). `registry.ts` is the single source of truth; progress is stored in `User.onboardingState` (kadesh-back) plus localStorage. **Any new panel section, main button or flow must add a `data-tour` anchor and a step in the registry**, then run `pnpm check:tours` (see `.cursor/rules/onboarding-tour.mdc`).

## Code conventions (from `.cursor/rules/basic.mdc`)

- **Server vs Client**: default to React Server Components; add `"use client"` only when the component needs hooks/browser APIs/event handlers. Keep the client boundary as low as possible.
- **Icons**: `@hugeicons/react` only — do not introduce lucide, heroicons, or other icon libraries.
- **Styling**: Tailwind CSS, **mobile-first** (`.cursor/rules/mobile-first.mdc`), dark mode via `dark:` classes (the app supports light/dark throughout, see `ThemeProvider`). Unprefixed classes are the phone layout; `sm:` / `md:` / `lg:` only enhance. Do not design desktop-first and patch with `max-*`.
- **GraphQL**: keep queries/mutations colocated in the feature that uses them (`queries.ts`/`mutations.ts` next to the components), using the shared Apollo client — don't create new client instances.
- **Backend load**: see "Rendimiento y costo" below before adding any query, polling or cache.
- **Naming**: PascalCase for component files (`AnimalCard.tsx`), camelCase for hooks/utils (`useLogin.ts`, `format-date.tsx`), lowercase-with-dashes for directories.
- **Validation**: Zod for schema validation where applicable.
- Early returns / guard clauses for error conditions over nested conditionals.

## Rendimiento y costo

How the performance rules in `~/.claude/CLAUDE.md` land in this repo. The backend (kadesh-back, Railway) and its Postgres are billed by RAM and uptime, so every request the front adds has a cost. The Apollo default is `cache-and-network`: **every mounted `useQuery` hits the network**.

### Reuse these, don't write new ones

| Need | Use | Where |
|---|---|---|
| Pause polling while the tab is hidden | `skipPollAttempt: skipPollWhenHidden` | `src/utils/pageVisibility.ts` |
| Refetch when the tab comes back | `useOnPageVisible(cb, { minHiddenMs })` | `src/utils/pageVisibility.ts` |
| Session data many screens ask for (user's company, subscription, plans, AI live status) | `useStableQuery` instead of `useQuery` | `src/providers/useStableQuery.ts`; allowlist and rules in `src/providers/stableQueries.ts` |
| Accent/case-insensitive search against a backend `*Search` field | `normalizeSearchText` (copy of the backend function; change both together) | `src/utils/normalizeSearchText.ts` |
| Debounce a search box | `useDebouncedValue(value, 300)` | `src/components/admin/hooks/useDebouncedValue.ts` |
| Pick a CRM lead in a form | `ClientLeadAutocomplete` (minimal query, server search, `take: 20`) | `src/components/shared/ClientLeadAutocomplete.tsx` |
| Server-side blog queries | `queryGraphql` and the cache window; never pass an exact time, use `publishedCutoff()` | `src/components/blog/server.ts` |
| Favorites for a list of posts in one query | `PostFavoritesBatchProvider` | `src/components/blog/hooks/PostFavoritesBatch.tsx` |
| Retry of failed queries | already global (`queryRetryLink`, up to 3 retries); don't add retry loops | `src/providers/queryRetryLink.ts` |

To make another query "stable", add its operation name to `STABLE_OPERATIONS` and switch its call sites to `useStableQuery`. The registry is tied to the session token and cleared by any mutation except those in `READ_ONLY_MUTATIONS`.

### Current values

Change them in the constant, and update this table.

| What | Value | Constant |
|---|---|---|
| Notification bell (platform admins) | 3 min; on return only if hidden ≥ 30 s | `NOTIFICATIONS_POLL_MS`, `NOTIFICATIONS_REFRESH_AFTER_HIDDEN_MS` in `src/components/notifications/constants.ts` |
| WhatsApp conversation list | 15 s | `CONVERSATIONS_POLL_MS` in `WhatsAppChatsTab.tsx` |
| WhatsApp open chat messages | 10 s | `POLL_INTERVAL_MS` in `WhatsAppChatPanel.tsx` |
| WhatsApp 24 h window status | 60 s, plus on each new inbound message | `STATUS_POLL_MS` in `WhatsAppChatPanel.tsx` |
| WhatsApp config | 20 s, only while waiting on Meta (template pending or no first webhook) | `WAITING_ON_META_POLL_MS` in `WhatsAppConfigTab.tsx` |
| Operaciones nav counters | 60 s | inline in `src/components/admin/AdminDashboard.tsx` |
| Activity heartbeat | 5 min | `HEARTBEAT_MS` in `src/utils/activity/usePanelActivity.ts` |
| Stable queries | 60 s | `STABLE_QUERY_TTL_MS` in `src/providers/stableQueries.ts` |
| Blog server data cache | 10 min window | `CACHE_WINDOW_SECONDS` in `src/components/blog/server.ts`; `revalidate = 600` in `src/app/blog/page.tsx` and `src/app/blog/[url]/page.tsx` |
| Blog share image route | 1 h | `src/app/blog/[url]/og/route.ts` |
| Landing stats | 6 h | `REVALIDATE_SECONDS` in `src/components/home/landing-stats.ts` |
| Autocomplete search | 300 ms debounce, `take: 20` | `SEARCH_DEBOUNCE_MS`, `SEARCH_TAKE` in `ClientLeadAutocomplete.tsx` |
| Signed image URLs (covers, avatars) | expire after 1 h | `signed.expiry: 3600` in kadesh-back `keystone.ts` |
| Backend Postgres pool | `connection_limit` 5, `pool_timeout` 20 s | `DB_CONNECTION_LIMIT`, `DB_POOL_TIMEOUT` in kadesh-back `keystone.ts` |

Any cache that holds image URLs must stay well under the 1 h signature. That is why the blog window is 10 minutes and why `/blog/[url]` has no `generateStaticParams`: a prerendered page is served stale to the first visitor after a quiet period, with expired image URLs. Prerendering needs a stable image URL first.

### Known hot spots, not fixed yet

Don't copy these patterns or add load to them. Several need a kadesh-back change first.

- **Clients list filters in the browser**: with an assignment or text filter it fetches every candidate, up to `MAX_LEADS_EXPORT` (10,000) leads, and paginates locally. `src/components/profile/sales/SalesSection.tsx` (`clientListFetchTake`).
- **Lead locations**: `take: 10000` to build the location filters. `src/components/profile/sales/obtener-clientes/hooks/useCompanyLeadLocations.ts`.
- **Credits read as a mutation on mount**: `useRemainingCredits` fires the `RemainingCredits` mutation from 6 components. `src/components/panel/hooks/useRemainingCredits.ts`. Needs a backend query.
- **Dashboard counts rows in the browser**: `DASHBOARD_STATUS_TAKE = 2000` statuses fetched and aggregated client-side. `src/components/panel/dashboard/queries.ts`, `useCompanyDashboard.ts`. Needs backend counts.
- **Stats strip**: 4 separate queries on every Clients visit. `src/components/profile/sales/StatsSection.tsx`.
- **Bulk assignment**: one `updateLead` mutation per selected lead, in a loop. `src/components/profile/sales/SalesSection.tsx`. Needs a batch mutation.
- **Lead detail**: about 10 requests each time a lead is opened. `src/components/profile/sales/detail_lead/`.
- **Project picker**: `take: 500`, filtered locally. `src/components/shared/ClientProjectAutocomplete.tsx`. Should follow `ClientLeadAutocomplete`.
- **Large unpaginated lists**: calendar events `take: 1000` (`sales/google-calendar/queries.ts`), lead statuses `take: 500` (`sales/queries.ts`), company users `take: 300` (`sales/queries.ts`, `sales/workspaces/queries.ts`, `usuarios/queries.ts`).
- **Operaciones counters keep polling in a hidden tab**: the two `pollInterval: 60_000` in `src/components/admin/AdminDashboard.tsx` lack `skipPollAttempt`.
- **WhatsApp inbox**: the list comes from the custom `whatsappConversations` resolver in kadesh-back and is polled every 15 s, so its cost per call lives there. Don't add fields to `WHATSAPP_CONVERSATIONS_QUERY` without checking that resolver.

### Checking that a feature adds no load

In the browser Network tab, filtered by the API host (requests are named by GraphQL operation in the payload):

1. Load the screen once and count requests. No operation should appear twice, and none should repeat per card or row.
2. Navigate away and back within a minute: `UserCompanyCategories`, `SubscriptionStatus`, `SaasPlans` and `CompanyAiLiveStatus` must not fire again.
3. Leave the screen idle for 2 minutes: only the polls in the table above may appear, at their interval.
4. Hide the tab for a minute: nothing should fire. On return, one refetch per poll.
5. Open a response and check its size and row count; a list must come with `take`.
6. No mutation should fire just from opening a screen (except `RemainingCredits`, listed above, and `trackEvents`).
7. For anonymous pages (`/blog`, home, niche pages) there should be no GraphQL request from the browser at all.

In the backend logs (Railway, or the local server on `:3002`): visit a blog page several times within 10 minutes and confirm only the first visit produces requests. For a new panel feature, compare request count per minute with the screen open and idle against the same screen before the change.

## Other `.cursor/rules/`

Beyond `basic.mdc` (code style, always applied) and `module-docs.mdc` (keep a feature `README.md` in sync with product/UX changes), this repo also has Cursor rules for marketing/growth tasks that trigger contextually rather than on code changes: `pricing-strategy.mdc`, `content-strategy.mdc`, `referral-program.mdc`, and `ai-seo.mdc` (AEO/GEO optimization for LLM answer engines). These are relevant if asked to work on pricing, content strategy, referral programs, or SEO/AI-discoverability for this site rather than on app code itself.
