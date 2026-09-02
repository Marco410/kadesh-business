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
- `src/components/<feature>/` — feature code, colocated: components, `hooks/`, `queries.ts`/`mutations.ts`, `constants.ts`, `types.ts`, and a barrel `index.ts` exposing the feature's public API. Import other features via that barrel, not internal file paths.
- `src/core/routes.ts` — the single source of truth for every internal path (`Routes.panel`, `Routes.panelLead(id)`, etc.). Always link/navigate through `Routes`, never hardcode a path string.
- `src/providers/` — `apollo-client.ts` (Apollo Client + KeystoneJS session-token auth header + upload link) and `ThemeProvider`. Never instantiate a second Apollo client in a component.
- `src/utils/` — pure helpers, `UserContext` (client-side auth state), `getAuthUser.ts`, formatters. No UI here.
- `src/constants/constans.ts` — most of the app's shared enums/lookup tables live in this one file: `Role`, CRM `PIPELINE_STATUS` (+ per-status Tailwind color maps), `PLAN_FEATURE_KEYS`/`PLAN_FEATURES_MAP` (feature-gating per subscription plan), `QUOTATION_STATUS`, `SUBSCRIPTION_STATUS`, and `NICHE_TARGET_MAPPING` (drives the programmatic-SEO `/clientes-para/[nicho]` pages). Check here before adding a new status/enum elsewhere.

### Auth

Auth is KeystoneJS session-based: a `keystonejs-session-token` is stored in `localStorage` and attached as a `Bearer` header by the Apollo auth link (`src/providers/apollo-client.ts`). `UserProvider`/`useUser()` (`src/utils/UserContext.tsx`) holds the client-side authenticated user, fetched via the `authenticatedItem` GraphQL query. Role checks go through `kadesh/utils/user-roles.ts` (e.g. `isAdminCompanyUser`), checking against `Role` in `constants/constans.ts`.

### The panel is a client-rendered SPA, not folder-routed

Most of `/panel/*` is NOT separate App Router pages per view — `src/app/panel/page.tsx` renders a single `PanelPageSection`, which is a `"use client"` component that switches between sub-sections based on the `?tab=` query param (see `PanelPageSection.tsx`). CRM sub-views (leads, workspaces, quotations, credits, etc.) are swapped client-side inside that shell, driven by `usePathname`/`useSearchParams` + local state, not by navigating to new routes. When adding a new panel view, follow this tab-based pattern rather than assuming a new file under `src/app/panel/` is needed.

`WorkspaceProvider` (`src/components/profile/sales/workspaces/WorkspaceContext.tsx`) tracks the currently selected CRM workspace (persisted client-side) and wraps the whole app in `ClientProviders`.

### Provider stack

`src/app/ClientProviders.tsx` composes, in order: `ThemeProvider` → `HeroUIProvider` → `ApolloProviderWrapper` → `UserProvider` → `WorkspaceProvider`. Anything needing user/auth/workspace context must render underneath this tree (it already wraps the whole app via `RootLayout`).

### Plan-gated features

Subscription plans gate CRM functionality via `PLAN_FEATURE_KEYS`/`PLAN_FEATURES_MAP` in `constants/constans.ts`, checked with helpers in `src/components/profile/sales/helpers/plan-features.ts` and surfaced via `FeatureLockedSection`/`RoleAccessDeniedSection`. When adding a gated CRM feature, register its key there first.

## Code conventions (from `.cursor/rules/basic.mdc`)

- **Server vs Client**: default to React Server Components; add `"use client"` only when the component needs hooks/browser APIs/event handlers. Keep the client boundary as low as possible.
- **Icons**: `@hugeicons/react` only — do not introduce lucide, heroicons, or other icon libraries.
- **Styling**: Tailwind CSS, mobile-first, dark mode via `dark:` classes (the app supports light/dark throughout, see `ThemeProvider`).
- **GraphQL**: keep queries/mutations colocated in the feature that uses them (`queries.ts`/`mutations.ts` next to the components), using the shared Apollo client — don't create new client instances.
- **Naming**: PascalCase for component files (`AnimalCard.tsx`), camelCase for hooks/utils (`useLogin.ts`, `format-date.tsx`), lowercase-with-dashes for directories.
- **Validation**: Zod for schema validation where applicable.
- Early returns / guard clauses for error conditions over nested conditionals.

## Other `.cursor/rules/`

Beyond `basic.mdc` (code style, always applied), this repo also has Cursor rules for marketing/growth tasks that trigger contextually rather than on code changes: `pricing-strategy.mdc`, `content-strategy.mdc`, `referral-program.mdc`, and `ai-seo.mdc` (AEO/GEO optimization for LLM answer engines). These are relevant if asked to work on pricing, content strategy, referral programs, or SEO/AI-discoverability for this site rather than on app code itself.
