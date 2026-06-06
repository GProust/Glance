# Glance — AI-Powered Insights Platform

Glance is a modular platform that aggregates technical content and news from many
providers (GitHub, GitLab, RSS, social) and produces AI-driven summaries.

## Architecture (three independent modules)

- **`backend/`** — Node.js + TypeScript (Express). Hexagonal layout:
  `core/domain` (entities), `core/config` (env, errors), `infrastructure/`
  (auth, database adapters), `api/` (routes, middleware). ESM (`"type": "module"`),
  so **relative imports must use the `.js` extension**.
- **`web/`** — React 19 + Vite + Tailwind (admin dashboard).
- **`mobile/`** — React Native / Expo (read-only consumer app).

Stack: PostgreSQL via Supabase (OrioleDB), Clerk for auth, Upstash Redis for rate
limiting, Zod for env validation. Vitest for backend/web tests.

## Governing documents (read before changing anything)

- **Constitution**: `.specify/memory/constitution.md` — Spec-First, modularity,
  testing, OpenAPI, mandatory Mermaid diagrams. Contributions must comply.
- **Specs**: `specs/` — feature specs `001`–`006`. The consolidated foundation
  plan and task tracker live in `specs/plan/` (canonical); `specs/004-multi-module-foundation/`
  holds the foundation feature spec. Do **not** write implementation code without an
  approved spec + plan.

## Build / test / lint gates (run per-module before committing)

Each module is installed and gated independently in CI (`.github/workflows/ci.yml`)
via `npm ci → lint → test → build`. Reproduce locally:

```bash
# backend
cd backend && npm ci && npm run lint && npm run test && npm run build
# web
cd web    && npm ci && npm run lint && npm run test && npm run build
# mobile
cd mobile && npm ci && npm run lint
```

CI runs `npm ci`, which installs **exactly** what is in `package-lock.json`. If you
add an import, add the package to that module's `package.json` **and** run
`npm install` so the lockfile is updated — otherwise the build passes locally (stale
`node_modules`) but fails in CI with "cannot find module".

## Conventions

- Comments explain **why**, not what. Match surrounding style.
- Tests are co-located under `__tests__/`. Mock external services (Clerk, Supabase,
  Upstash) — no live calls in tests.
- Keep `specs/.../contracts/openapi.yaml` in sync when you change an endpoint.
- Never commit secrets; configuration comes from validated env vars (`core/config/env.config.ts`).
- PR descriptions should link the relevant spec/plan tasks and reference the feature
  ID (e.g. `[004]`).

## Known gaps (as of this writing)

The foundation modules are scaffolded but not yet fully integrated end-to-end:
domain entities, `ClerkAuthService`, and `SupabaseAdapter` exist but are not yet
wired into request flows, and the web `AuthPage` is not yet routed from `App.tsx`.
The database schema (`specs/plan/aggregated-data-model.sql`, task T008) is not yet
applied. Treat these as the next implementation steps, not as finished features.
