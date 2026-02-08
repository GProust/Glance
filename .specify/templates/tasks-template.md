---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
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

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure (backend/web/mobile)
- [ ] T002 Initialize NodeJS backend with dependencies
- [ ] T003 Initialize React web project
- [ ] T004 Initialize React Native mobile project
- [ ] T005 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T006 Setup Supabase/Postgres schema and migrations
- [ ] T007 [P] Implement authentication/authorization framework
- [ ] T008 [P] Setup API routing and middleware structure
- [ ] T009 Create base models/entities that all stories depend on
- [ ] T010 Configure error handling and logging infrastructure
- [ ] T011 Setup environment configuration management

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (MANDATORY) ⚠️

> **NOTE: Write Unit tests FIRST (TDD preferred), ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Unit test (mocked) for [service] in backend/src/services/__tests__/[service].test.ts
- [ ] T013 [P] [US1] E2E test (Wiremocked) for [flow] in backend/tests/e2e/[flow].spec.ts

### Implementation for User Story 1

- [ ] T014 [P] [US1] Create [Entity1] model in backend/src/models/[entity1].ts
- [ ] T015 [US1] Implement [Service] in backend/src/services/[service].ts (depends on T014)
- [ ] T016 [US1] Implement [endpoint/feature] in backend/src/api/[file].ts
- [ ] T017 [US1] Update OpenAPI specification with examples for [endpoint]
- [ ] T018 [US1] Implement Web UI component in web/src/components/[Component].tsx
- [ ] T019 [US1] Implement Mobile screen in mobile/src/screens/[Screen].tsx

**Checkpoint**: Review Gate (Business Value, Tests, Build, Extensibility) - Story must be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (MANDATORY) ⚠️

- [ ] T020 [P] [US2] Unit test (mocked) for [service]
- [ ] T021 [P] [US2] E2E test (Wiremocked) for [flow]

### Implementation for User Story 2

- [ ] T022 [P] [US2] Create [Entity] model
- [ ] T023 [US2] Implement [Service]
- [ ] T024 [US2] Implement [endpoint/feature]
- [ ] T025 [US2] Update OpenAPI specification with examples for [endpoint]
- [ ] T026 [US2] Implement Web/Mobile UI

**Checkpoint**: Review Gate (Business Value, Tests, Build, Extensibility) - User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (MANDATORY) ⚠️

- [ ] T027 [P] [US3] Unit test (mocked) for [service]
- [ ] T028 [P] [US3] E2E test (Wiremocked) for [flow]

### Implementation for User Story 3

- [ ] T029 [P] [US3] Create [Entity] model
- [ ] T030 [US3] Implement [Service]
- [ ] T031 [US3] Implement [endpoint/feature]
- [ ] T032 [US3] Update OpenAPI specification with examples for [endpoint]
- [ ] T033 [US3] Implement Web/Mobile UI

**Checkpoint**: Review Gate (Business Value, Tests, Build, Extensibility) - All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] TXXX [P] Update Mermaid diagrams (Sequence, User Journey, Data Model) in specs/
- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---