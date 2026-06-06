# Glance

Glance is an AI-powered insights platform that aggregates technical content and news
from many providers (GitHub, RSS, and more), and presents AI-driven summaries across a
**Backend / Web / Mobile** stack.

- **Backend** — Node.js + TypeScript (Express), hexagonal layout. Auth, source
  registration, ingestion, and a read-only feed API.
- **Web** — React 19 + Vite + Tailwind. Admin dashboard for managing sources.
- **Mobile** — React Native / Expo. Read-only consumer feed.

> Status: foundation in progress. You can sign in, register GitHub/RSS sources, ingest
> their content (summarized + credibility-scored on the way in), and read it back via the
> feed API. The mobile feed screen and scheduled ingestion are next — see
> [`specs/plan/tasks.md`](specs/plan/tasks.md).

## Architecture

```
┌─────────┐     ┌─────────┐        ┌──────────────────────────┐
│   Web   │     │ Mobile  │        │  Providers                │
│ (admin) │     │ (feed)  │        │  GitHub · RSS · …         │
└────┬────┘     └────┬────┘        └─────────────┬────────────┘
     │  Clerk JWT     │  Clerk JWT                │ fetch
     ▼                ▼                           ▼
            ┌───────────────────────┐    ┌─────────────────┐
            │   Backend (Express)   │───▶│  Ingestion      │
            │  auth · sources · feed│    │  (connectors)   │
            └───────────┬───────────┘    └────────┬────────┘
                        │ service-role            │ upsert
                        ▼                         ▼
                 ┌──────────────────────────────────┐
                 │  Supabase / PostgreSQL (OrioleDB) │  schema: api
                 └──────────────────────────────────┘
```

- **Auth**: [Clerk](https://clerk.com). The backend validates the Clerk JWT and accesses
  the DB with the service-role key (RLS is deny-by-default for client roles).
- **Database**: [Supabase](https://supabase.com) PostgreSQL (OrioleDB). Tables live in
  the `api` schema. The migration runner creates OrioleDB tables when the extension is present.
- **Rate limiting**: [Upstash Redis](https://upstash.com) (optional in local dev).

## Repository layout

```
backend/    Node.js API, ingestion, DB migrations  (backend/db/migrations)
web/        React admin dashboard
mobile/     Expo (React Native) consumer app
specs/      Specifications + consolidated plan (specs/plan), OpenAPI, decisions
```

See [`CLAUDE.md`](CLAUDE.md) for contributor conventions and [`specs/`](specs/README.md)
for the full specification set.

## Prerequisites

- **Node.js 20+** and npm.
- A **Supabase** project (free tier).
- A **Clerk** application (free tier).
- Optional: an **Upstash Redis** database (rate limiting) and a **GitHub token**
  (higher ingestion rate limits).

## Setup

### 1. Install dependencies (per module)

```bash
cd backend && npm install
cd ../web    && npm install
cd ../mobile && npm install
```

### 2. Configure environment

Each module ships a `.env.example`. Copy it to `.env` and fill in real values
(`.env` is git-ignored — never commit secrets):

```bash
cp backend/.env.example backend/.env
cp web/.env.example     web/.env
cp mobile/.env.example  mobile/.env
```

| Module | Key | Where to get it |
|--------|-----|-----------------|
| backend | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| backend | `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (**use the Session pooler** URI — see note below) |
| backend | `CLERK_SECRET_KEY` | Clerk → API Keys (secret) |
| backend | `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Upstash → REST API (optional) |
| backend | `GITHUB_TOKEN` | GitHub → Developer settings → PAT (optional) |
| backend | `GEMINI_API_KEY` / `GEMINI_MODEL` | Google AI Studio (optional — falls back to a local heuristic summarizer) |
| web / mobile | `VITE_CLERK_PUBLISHABLE_KEY` / `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API Keys (publishable) |
| web | `VITE_API_BASE_URL` | Backend URL (defaults to `http://localhost:3000`) |

> **`DATABASE_URL` note:** use the **Session pooler** connection string (host
> `aws-0-<region>.pooler.supabase.com`, port `5432`, user `postgres.<ref>`). The "Direct
> connection" host (`db.<ref>.supabase.co`) is IPv6-only and unreachable from many
> IPv4 networks and CI runners. It's only needed for migrations.

### 3. Apply the database schema

```bash
cd backend && npm run db:migrate
```

This probes the server, creates the `api` schema tables (as OrioleDB tables when
available), and is safe to re-run (tracked in `api._migrations`).

## Running locally

```bash
# Backend API (http://localhost:3000)
cd backend && npm run dev

# Web admin (http://localhost:5173)
cd web && npm run dev

# Mobile (Expo)
cd mobile && npm start
```

### Try the flow

1. Open the web app and sign in via Clerk.
2. **Add a source** — e.g. an RSS feed (`https://feeds.bbci.co.uk/news/rss.xml`) or a
   GitHub repo (owner `facebook`, repo `react`).
3. Click **Fetch now** to ingest its latest content.
4. The content is stored and available via the feed API (`GET /api/v1/feed`).

## API

All endpoints are under `/api/v1` and require `Authorization: Bearer <Clerk token>`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/me` | Current user (synced into the DB) |
| GET / POST | `/sources` | List / register sources |
| GET / PUT / DELETE | `/sources/{id}` | Read / update / remove a source |
| POST | `/sources/{id}/fetch` | Trigger ingestion for a source |
| GET | `/feed`, `/feed/{id}` | Read-only aggregated content feed |

Full contract: [`specs/plan/contracts/openapi.yaml`](specs/plan/contracts/openapi.yaml).

## Testing & quality gates

Each module is gated independently (the same checks run in CI — `.github/workflows/ci.yml`):

```bash
# backend
cd backend && npm run lint && npm run test && npm run build
# web
cd web && npm run lint && npm run test && npm run build
# mobile
cd mobile && npm run lint
```

## Documentation

- **Constitution** (principles): [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
- **Specs & plan**: [`specs/README.md`](specs/README.md)
- **Decisions**: [`specs/plan/decisions.md`](specs/plan/decisions.md)
- **Contributor guide**: [`CLAUDE.md`](CLAUDE.md)
