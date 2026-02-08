<!-- Sync Impact Report
Version: 2.2.0 -> 2.3.0
Modified Principles:
  - Added VII. Visual Specification & Diagrams
Added Sections:
  - Visual Specification & Diagrams (Core Principle)
Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ updated (Diagrams check)
  - .specify/templates/spec-template.md: ✅ updated (User Journey diagrams)
  - .specify/templates/tasks-template.md: ✅ updated (Diagrams task)
  - .gemini/commands/speckit.plan.toml: ✅ updated (Phase 1 artifacts)
-->

# Glance Constitution

## Core Principles

### I. Separation of Concerns & Modularity
The system MUST be divided into three distinct, independently managed modules: **Backend** (NodeJS), **Web** (React), and **Mobile** (React Native). Code should be resilient with strict boundaries; logic should not leak between layers or platforms.

### II. Technology Standards
Adherence to the defined stack is mandatory:
- **Backend**: NodeJS
- **Web**: React
- **Mobile**: React Native
- **Database**: PostgreSQL (via Supabase) with OrioleDB
- **Security**: No credentials shall be stored in the codebase; use environment variables and secure vaults.

### III. Specification-First
No implementation code is written without a prior approved Specification and Plan. This includes identifying all feature dependencies upfront to prevent architectural debt.

### IV. Comprehensive Testing Strategy
Testing is mandatory and follows a strict dual approach:
- **Unit Tests**: Must be co-located with code, covering 100% of core logic using mocks.
- **E2E Tests**: Validate global flows using remote mocks (e.g., Wiremock) to simulate external dependencies.
- **Mocking**: All tests must use mocks to ensure determinism and speed; no flaky live calls.

### V. Incremental Delivery
Deliver features in small, independently testable increments. "Big bang" releases are prohibited. Each increment must pass all unit and E2E gates before merging.

### VI. API Lifecycle & Documentation
- **OpenAPI**: All APIs MUST be documented using OpenAPI with concrete examples. Documentation must be updated immediately within the same task that modifies an endpoint.
- **Versioning**: Breaking changes trigger a MAJOR version update.
- **Deprecation**: Endpoints MUST NOT be removed immediately. They must be marked deprecated for at least 1-2 minor versions to allow client migration before removal.

### VII. Visual Specification & Diagrams
Complex logic and structures MUST be visually represented to ensure architectural alignment.
- **Tooling**: All diagrams MUST be authored using **Mermaid.js** syntax for version control compatibility and rendering on GitHub/GitLab.
- **Mandatory Diagrams**: Every implementation plan MUST include:
  - **Sequence Diagrams**: For complex multi-step flows or inter-module communication.
  - **User Journey**: To visualize the path a user takes through the feature.
  - **Data Model**: For all schema changes or new entity relationships.

## Operational Standards

### Code Quality
Code must be readable, idiomatic to the target language (JS/TS), and secure by design. Comments should explain "why", not "what".

### Documentation
Documentation should be treated as a first-class citizen. READMEs, Specs, Plans, **OpenAPI definitions**, and **Mermaid diagrams** must be kept synchronous with code changes.

### Code Review Standards
Every task or PR must pass a 4-point review before merging:
1.  **Business Value**: Does it solve the user's problem as specified?
2.  **Test Coverage**: Is the new logic fully covered by tests?
3.  **Build Status**: Does the build (lint/compile/test) pass locally and in CI?
4.  **Extensibility**: Is the design open for modification based on the next planned tasks?

## Governance

This constitution serves as the primary guidance for architectural and process decisions.

- **Amendments**: Changes to this document require a Pull Request with explicit reasoning and team consensus.
- **Versioning**: This document follows Semantic Versioning:
  - **Major**: Removal or redefinition of core principles (e.g., stack change).
  - **Minor**: Addition of new principles or significant guidance.
  - **Patch**: Clarifications, formatting, or minor refinements.
- **Compliance**: All contributions are expected to align with these principles. Reviews should flag constitution violations.

**Version**: 2.3.0 | **Ratified**: 2026-02-01 | **Last Amended**: 2026-02-08
