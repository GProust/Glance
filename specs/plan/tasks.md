# Tasks: Glance Platform Global Foundation

**Input**: Design documents from `/specs/plan/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, aggregated-data-model.sql

**Organization**: Tasks are grouped by phase and user story to ensure independent testability and incremental delivery.

## Phase 1: Setup (Project Initialization)

**Purpose**: Establish the multi-module project structure and core configurations.

- [ ] T001 Create multi-module root structure (backend/, web/, mobile/)
- [ ] T002 Initialize Backend (NodeJS) with TypeScript and Hexagonal structure
- [ ] T003 Initialize Web (React) with Tailwind and basic routing
- [ ] T004 Initialize Mobile (React Native) with basic navigation
- [ ] T005 [P] Configure shared linting, formatting, and Husky hooks
- [ ] T006 Configure Environment variables and Clerk Auth in all modules
- [ ] T007 [P] Setup Vitest in Backend and Web, and Jest in Mobile

---

## Phase 2: Foundational (Data & Auth)

**Purpose**: Core infrastructure required for all subsequent features.

- [ ] T008 Apply `specs/plan/aggregated-data-model.sql` to Supabase DB
- [ ] T009 Implement Supabase Client and Database Adapter in `backend/src/infrastructure/database/`
- [ ] T010 Implement Clerk Authentication Middleware in `backend/src/api/middleware/auth.ts`
- [ ] T011 [P] Create Generic Domain Models (User, Source, ContentItem) in `backend/src/core/domain/`
- [ ] T012 [P] Implement Base API Routing and Error Handling in `backend/src/api/`

---

## Phase 3: [US 006-1] Unified Source Registration (Priority: P1)

**Goal**: Allow users to register Repos, News, and Social sources through a single interface.

- [ ] T013 [P] [US6] Create Source Repository and Service in `backend/src/core/services/source.service.ts`
- [ ] T014 [US6] Implement `POST /api/v1/sources` for multi-provider registration in `backend/src/api/routes/sources.ts`
- [ ] T015 [US6] Implement `GET /api/v1/sources` to list active subscriptions
- [ ] T016 [US6] Create Unified Configuration Form in Web Admin (`web/src/features/sources/SourceForm.tsx`)
- [ ] T017 [US6] Implement Dynamic Field Rendering based on Provider Type in Web UI

**Checkpoint**: User can register and see different types of sources in the Web Admin.

---

## Phase 4: [US 001-1] GitHub Metadata Ingestion (Priority: P1)

**Goal**: Fetch Issues, PRs, and Releases from GitHub without code download.

- [ ] T018 [P] [US1] Implement GitHub API Adapter in `backend/src/infrastructure/adapters/github.adapter.ts`
- [ ] T019 [US1] Implement Ingestion Service for Repository type in `backend/src/core/services/ingestion.service.ts`
- [ ] T020 [US1] Create Trigger Endpoint `POST /api/repos/import` in `backend/src/api/routes/repos.ts`
- [ ] T021 [US1] Implement Background Ingestion Worker for Repositories (Recurrence logic)

**Checkpoint**: GitHub metadata is successfully fetched and stored in `content_items`.

---

## Phase 5: [US 002-3] AI Enrichment Pipeline (Priority: P1)

**Goal**: Automatically summarize fetched items and calculate credibility/AI-tag.

- [ ] T022 [P] [US2] Implement AI Provider Adapter (OpenAI/Gemini) in `backend/src/infrastructure/adapters/ai.adapter.ts`
- [ ] T023 [US2] Implement AI Enrichment Service for Summarization and Scoring
- [ ] T024 [US2] Integrate AI Service into the Ingestion Pipeline (Step between Fetch and Save)
- [ ] T025 [US2] Implement `GET /api/repos/{id}/summary` to retrieve generated summary

**Checkpoint**: Ingested items now have AI-generated summaries and credibility scores.

---

## Phase 6: [US 002-4] Mobile Consumer Feed (Priority: P1)

**Goal**: Display aggregated summaries on a read-only mobile app.

- [ ] T026 [US2] Implement Unified Feed API `GET /api/feed` with pagination
- [ ] T027 [US2] Create Feed Item UI Components in `mobile/src/components/FeedItem.tsx`
- [ ] T028 [US2] Implement Read-Only Feed Screen with Pull-to-Refresh in `mobile/src/screens/FeedScreen.tsx`
- [ ] T029 [US2] Implement Detail View showing Summary and Original Source Link

**Checkpoint**: Users can consume insights on their mobile devices.

---

## Phase 7: [US 003-2] Modular Connector Registry (Priority: P2)

**Goal**: Ensure adding new providers (GitLab, X, etc.) requires minimal code changes.

- [ ] T030 [P] [US3] Refactor Ingestion Service to use the `IConnector` interface pattern
- [ ] T031 [US3] Implement Registry Pattern for automatic discovery of new Provider Adapters
- [ ] T032 [US3] Create "Dummy" Connector to verify modularity and standard configuration

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T033 [P] Update OpenAPI specifications in `specs/plan/contracts/` for all new endpoints
- [ ] T034 [P] Implement Backend Logging and Health Checks
- [ ] T035 [P] Security Audit: Verify RLS policies and Auth scopes
- [ ] T036 Final validation of `quickstart.md` setup steps

## Implementation Strategy

1. **MVP (Phase 1-4)**: Focus on GitHub metadata ingestion and display.
2. **Phase 5-6**: Add AI value and mobile consumption.
3. **Phase 7**: Formalize the extensibility for future providers.

## Dependencies

- Phase 2 depends on Supabase/Clerk setup.
- Phase 3-7 depend on Phase 2 (Foundation).
- Phase 5 depends on items being available in DB (Phase 4).
- Phase 6 depends on API and Data being ready (Phase 5).
