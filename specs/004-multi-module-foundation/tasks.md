# Tasks: Glance Platform Global Foundation

**Input**: Design documents from `/specs/plan/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Testing is MANDATORY.
- Unit Tests: Co-located with code, mock everything.
- E2E Tests: Global flow, use Wiremock/remote mocks.

**Organization**: Tasks are grouped by user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Web**: `web/src/`
- **Mobile**: `mobile/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure.

- [x] T001 Create multi-module root structure (backend/, web/, mobile/)
- [x] T002 Initialize NodeJS backend (Node 20+) with TypeScript and basic Hexagonal structure
- [x] T003 Initialize React web project (React 18+) with Tailwind CSS
- [x] T004 Initialize React Native mobile project with basic navigation
- [x] T005 [P] Configure shared linting (ESLint), formatting (Prettier), and Husky hooks
- [x] T006 [P] Configure GitHub Actions CI workflow in `.github/workflows/ci.yml`
- [x] T007 [P] Setup Vitest in backend/ and web/ and Jest in mobile/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [ ] T008 Apply `specs/plan/aggregated-data-model.sql` to Supabase/OrioleDB instance
- [ ] T009 [P] Implement Supabase Client and Database Adapter in `backend/src/infrastructure/database/supabase.adapter.ts`
- [ ] T010 [P] Implement Clerk Authentication Middleware in `backend/src/api/middleware/auth.ts`
- [ ] T011 [P] Create Domain Entities (User, Source, ContentItem) in `backend/src/core/domain/entities/`
- [ ] T012 [P] Implement Global Rate Limiting (Upstash) in `backend/src/api/middleware/rate-limit.ts`
- [ ] T013 Configure environment management and error handling in `backend/src/core/config/`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 2 - Secure Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can sign in securely via Clerk across all platforms.

**Independent Test**: Verify that a JWT from Clerk is correctly validated by the backend and grants access to protected routes.

### Tests for User Story 2 (MANDATORY) ⚠️

- [ ] T014 [P] [US2] Unit test for Auth Middleware in `backend/src/api/middleware/__tests__/auth.test.ts`
- [ ] T015 [P] [US2] Unit test for Clerk Service in `backend/src/infrastructure/auth/__tests__/clerk.service.test.ts`
- [ ] T016 [P] [US2] E2E test (mocked) for login flow in `web/src/features/auth/__tests__/login.e2e.ts`

### Implementation for User Story 2

- [ ] T017 [P] [US2] Implement ClerkAuthService in `backend/src/infrastructure/auth/clerk.service.ts`
- [ ] T018 [US2] Implement Identity verification endpoint `GET /api/v1/auth/me` in `backend/src/api/routes/auth.ts`
- [ ] T019 [US2] Integrate Clerk Provider in Web root `web/src/main.tsx`
- [ ] T020 [US2] Create Login Page and Auth Guard in `web/src/features/auth/AuthPage.tsx`
- [ ] T021 [US2] Integrate Clerk into Mobile app in `mobile/src/App.tsx`

**Checkpoint**: User can log in on Web and Mobile, and the Backend recognizes their identity.

---

## Phase 4: User Story 6 - Unified Source Registration (Priority: P1)

**Goal**: Users can register GitHub, News (RSS), and Social sources through a unified interface.

**Independent Test**: User registers a GitHub repository and an RSS feed, then verifies they appear in their source list.

### Tests for User Story 6 (MANDATORY) ⚠️

- [ ] T022 [P] [US6] Unit test for SourceService in `backend/src/core/services/__tests__/source.service.test.ts`
- [ ] T023 [P] [US6] E2E test (mocked) for source registration in `backend/tests/e2e/sources.spec.ts`

### Implementation for User Story 6

- [ ] T024 [P] [US6] Implement SourceRepository in `backend/src/infrastructure/database/source.repository.ts`
- [ ] T025 [US6] Implement SourceService with validation logic in `backend/src/core/services/source.service.ts`
- [ ] T026 [US6] Implement `POST /api/v1/sources` for multi-provider registration in `backend/src/api/routes/sources.ts`
- [ ] T027 [US6] Implement `GET /api/v1/sources` in `backend/src/api/routes/sources.ts`
- [ ] T028 [US6] Create Unified Configuration Form in `web/src/features/sources/SourceForm.tsx`
- [ ] T029 [US6] Implement Source List View in `web/src/features/sources/SourceList.tsx`

**Checkpoint**: Users can manage their technical data sources via the Web Admin.

---

## Phase 5: User Story 1 - GitHub Metadata Ingestion (Priority: P1)

**Goal**: Automatically fetch Issues, PRs, and Releases from registered GitHub repositories.

**Independent Test**: Manually trigger ingestion and verify that new items appear in the `content_items` table.

### Tests for User Story 1 (MANDATORY) ⚠️

- [ ] T030 [P] [US1] Unit test for GitHubAdapter in `backend/src/infrastructure/adapters/__tests__/github.adapter.test.ts`
- [ ] T031 [P] [US1] Unit test for IngestionService in `backend/src/core/services/__tests__/ingestion.service.test.ts`

### Implementation for User Story 1

- [ ] T032 [P] [US1] Implement GitHubAdapter using Octokit in `backend/src/infrastructure/adapters/github.adapter.ts`
- [ ] T033 [US1] Implement IngestionService (Fetch -> Normalize -> Save) in `backend/src/core/services/ingestion.service.ts`
- [ ] T034 [US1] Implement Ingestion Background Worker in `backend/src/infrastructure/workers/ingestion.worker.ts`
- [ ] T035 [US1] Implement `GET /api/v1/items` with pagination in `backend/src/api/routes/items.ts`

**Checkpoint**: Technical data is successfully flowing into the system from GitHub.

---

## Phase 6: User Story 2 (Mobile) - Mobile Consumer Feed (Priority: P1)

**Goal**: Display aggregated summaries on a read-only mobile app.

**Independent Test**: Open the mobile app and see the list of technical items fetched from the backend.

### Tests for User Story 2 (Mobile) (MANDATORY) ⚠️

- [ ] T036 [P] [US2] Unit test for FeedScreen in `mobile/src/screens/__tests__/FeedScreen.test.tsx`

### Implementation for User Story 2 (Mobile)

- [ ] T037 [P] [US2] Create FeedItem UI component in `mobile/src/components/FeedItem.tsx`
- [ ] T038 [US2] Implement FeedScreen with Pull-to-Refresh in `mobile/src/screens/FeedScreen.tsx`
- [ ] T039 [US2] Implement Detail View showing original source link in `mobile/src/screens/DetailScreen.tsx`

**Checkpoint**: End-to-end flow from GitHub to Mobile device is complete.

---

## Phase 7: User Story 2 (AI) - AI Enrichment Pipeline (Priority: P1)

**Goal**: Automatically summarize fetched items using AI.

### Tests for User Story 2 (AI) (MANDATORY) ⚠️

- [ ] T040 [P] [US2] Unit test for AIAdapter in `backend/src/infrastructure/adapters/__tests__/ai.adapter.test.ts`

### Implementation for User Story 2 (AI)

- [ ] T041 [P] [US2] Implement AIAdapter (Gemini/OpenAI) in `backend/src/infrastructure/adapters/ai.adapter.ts`
- [ ] T042 [US2] Integrate AI summarization into IngestionService flow

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T043 [P] Update OpenAPI specifications in `specs/plan/contracts/openapi.yaml`
- [ ] T044 [P] Update Mermaid diagrams in `specs/plan/` (Sequence, User Journey)
- [ ] T045 Implement health checks and basic monitoring in `backend/src/api/routes/health.ts`
- [ ] T046 Final validation of `quickstart.md` setup steps

---

## Implementation Strategy

1. **Phase 1-2 (Foundation)**: Establish the multi-module project structure and core infrastructure.
2. **Phase 3 (Auth)**: Secure the platform.
3. **Phase 4-5 (Ingestion MVP)**: Register sources and fetch GitHub data.
4. **Phase 6 (Consumer App)**: Deliver the mobile experience.
5. **Phase 7 (AI)**: Add summarization value.

## Dependencies

- Phase 2 depends on Supabase/Clerk credentials.
- All User Story phases (3-7) depend on Phase 2 (Foundation).
- Phase 5 (Ingestion) depends on Phase 4 (Source Registration).
- Phase 6 (Mobile) depends on Phase 5 (Data availability).
- Phase 7 (AI) depends on Phase 5 (Data availability).