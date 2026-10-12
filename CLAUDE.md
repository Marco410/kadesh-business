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
```

There is no test suite configured in this repo currently.

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

Auth is KeystoneJS session-based: a `keystonejs-session-token` is stored in `localStorage` and attached as a `Bearer` header by the Apollo auth link (`src/providers/apollo-client.ts`). `UserProvider`/`useUser()` (`src/utils/UserContext.tsx`) holds the client-side authenticated user, fetched via the `authenticatedItem` GraphQL query. Role checks go through `kadesh/utils/user-roles.ts` (e.g. `isAdminCompanyUser`), checking against `Role` in `constants/constans.ts`. Platform admins can "entrar como" another user from Operaciones: `kadesh/components/impersonation` swaps the session token for a read-only one (the backend blocks every mutation) and keeps the admin token in `kadesh-admin-session-token`.

### The panel is a client-rendered SPA, not folder-routed

Most of `/panel/*` is NOT separate App Router pages per view — `src/app/panel/page.tsx` renders a single `PanelPageSection`, which is a `"use client"` component that switches between sub-sections based on the `?tab=` query param (see `PanelPageSection.tsx`). CRM sub-views (leads, workspaces, quotations, credits, etc.) are swapped client-side inside that shell, driven by `usePathname`/`useSearchParams` + local state, not by navigating to new routes. When adding a new panel view, follow this tab-based pattern rather than assuming a new file under `src/app/panel/` is needed.

`WorkspaceProvider` (`src/components/profile/sales/workspaces/WorkspaceContext.tsx`) tracks the currently selected CRM workspace (persisted client-side). It only wraps `/panel*` and `/admin*`, via `PanelAppProviders`.

### Provider stack

`src/app/ClientProviders.tsx` composes, in order: `CookieConsentProvider` → `ThemeProvider` → `ApolloProviderWrapper` → `UserProvider`, and wraps the whole app via `RootLayout`. Inside it, `/panel*` and `/admin*` also get `PanelAppProviders` (`HeroUIProvider` → `WorkspaceProvider` → `OnboardingProvider`), and `/auth*` gets `AuthAppProviders`. This keeps driver.js and workspace state out of the marketing bundle. Anything needing workspace or onboarding context must render under a panel route.

### Plan-gated features

Subscription plans gate CRM functionality via `PLAN_FEATURE_KEYS`/`PLAN_FEATURES_MAP` in `constants/constans.ts`, checked with helpers in `src/components/profile/sales/helpers/plan-features.ts` and surfaced via `FeatureLockedSection`/`RoleAccessDeniedSection`. When adding a gated CRM feature, register its key there first.

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
- **Naming**: PascalCase for component files (`AnimalCard.tsx`), camelCase for hooks/utils (`useLogin.ts`, `format-date.tsx`), lowercase-with-dashes for directories.
- **Validation**: Zod for schema validation where applicable.
- Early returns / guard clauses for error conditions over nested conditionals.

## Other `.cursor/rules/`

Beyond `basic.mdc` (code style, always applied) and `module-docs.mdc` (keep a feature `README.md` in sync with product/UX changes), this repo also has Cursor rules for marketing/growth tasks that trigger contextually rather than on code changes: `pricing-strategy.mdc`, `content-strategy.mdc`, `referral-program.mdc`, and `ai-seo.mdc` (AEO/GEO optimization for LLM answer engines). These are relevant if asked to work on pricing, content strategy, referral programs, or SEO/AI-discoverability for this site rather than on app code itself.
