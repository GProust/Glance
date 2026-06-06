# Glance Specifications

Glance aggregates technical content and news from many providers (GitHub, GitLab,
RSS, social) and produces AI-driven summaries across a Backend / Web / Mobile stack.

This directory holds the **feature specifications** (the *what* and *why*) and the
**consolidated plan** (the *how*). Implementation must follow an approved spec + plan
— see the [Constitution](../.specify/memory/constitution.md).

## Layout

```text
specs/
├── 00N-<feature>/spec.md   # one specification per feature (what & why)
└── plan/                   # the single, shared implementation plan (how)
```

- **`00N-<feature>/spec.md`** — one self-contained spec per feature: user stories,
  functional requirements, and measurable success criteria. No implementation detail.
- **`plan/`** — the program-level plan that turns those specs into work. This is the
  **single source of truth** for the data model, API contract, and task tracking;
  feature folders intentionally do *not* duplicate it.

## Feature specifications

| # | Feature | Summary |
|---|---------|---------|
| **001** | [GitHub Issue Analysis](001-github-issue-analysis/spec.md) | Fetch & AI-summarize GitHub issues, PRs, and releases |
| **002** | [Admin, News & Mobile](002-glance-admin-news-mobile/spec.md) | Admin console for sources + read-only mobile consumer app |
| **003** | [Multi-System Extensibility](003-multi-system-extensibility/spec.md) | Connector architecture for adding new providers (GitLab, HF, …) |
| **004** | [Multi-Module Foundation](004-multi-module-foundation/spec.md) | Backend/Web/Mobile structure, secure auth, generic data model |
| **005** | [Generic Data Model](005-generic-data-model/spec.md) | Provider-agnostic unified schema |
| **006** | [Unified Provider Registration](006-unified-provider-registration/spec.md) | One interface to register repos, news feeds, and social sources |

**004 is the foundation** that the other features build on. Its planning artifacts
(plan, tasks, data model, API contract) live in `plan/` rather than in `004/`,
because they are shared across all features.

## The plan (`plan/`)

| Document | Purpose |
|----------|---------|
| [plan.md](plan/plan.md) | Consolidated implementation plan & architecture |
| [tasks.md](plan/tasks.md) | Phase 1–8 task tracker (T001–T046) — **current status lives here** |
| [research.md](plan/research.md) | Technology and pattern decisions |
| [data-model.md](plan/data-model.md) | Unified data model + ERD (Mermaid) |
| [aggregated-data-model.sql](plan/aggregated-data-model.sql) | Concrete PostgreSQL schema |
| [contracts/openapi.yaml](plan/contracts/openapi.yaml) | API contract (OpenAPI 3.1) |
| [sequence.md](plan/sequence.md) · [user-journey.md](plan/user-journey.md) | Mermaid diagrams |
| [quickstart.md](plan/quickstart.md) | Environment setup & developer onboarding |

## Delivery phases

- **Phase 1 — Foundation & Ingestion:** 004 (foundation), 005 (data model), 006 (registration), 001 (GitHub).
- **Phase 2 — Consumption & Enrichment:** 002 (admin + mobile), 003 (extensibility).
