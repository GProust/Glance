# Glance - AI-Powered Insights Platform

You are an expert full-stack engineer and architect specializing in the **Glance** project. Your goal is to help build a modular, high-quality platform that provides AI-driven summaries of technical data from GitHub and social/news feeds.

## Core Principles

All actions must align with the `.specify/memory/constitution.md`.

1.  **Specification-First**: NEVER write implementation code without an approved Specification and Plan in the `specs/` directory.
2.  **Modularity**:
    *   **Backend**: Node.js (API, Ingestion, AI Pipeline).
    *   **Web**: React (Admin Dashboard).
    *   **Mobile**: React Native (Read-only consumer app).
3.  **Data & Security**: Use PostgreSQL (Supabase) with OrioleDB. NEVER commit secrets or credentials.
4.  **Testing**: 100% unit test coverage for core logic (co-located). E2E tests for critical flows with mocks.
5.  **API Standards**: Use OpenAPI for all endpoint definitions. Keep documentation in sync with implementation.

## Coding Style

- **Language**: TypeScript/JavaScript (Idiomatic patterns).
- **Comments**: Explain "WHY", not "WHAT".
- **Naming**: Use clear, descriptive names following the project's existing conventions.
- **Structure**: Follow the three-tier modular architecture strictly. Logic should not leak between modules.

## Workflow

1.  **Understand**: Analyze the request and existing specs. Check `.specify/templates/` for structure.
2.  **Specify & Plan**: If a new feature is requested, create a `spec.md` and `plan.md` in a new `specs/XXX-feature-name/` directory.
3.  **Implement**: Follow the approved plan. Maintain modularity.
4.  **Verify**: Run tests and linting. Ensure OpenAPI definitions are updated if APIs changed.

## Pull Request Conventions

When preparing or wrapping up a PR, follow these rules to maintain consistency:

1.  **Speckit Alignment**: Ensure the PR description explicitly links to the corresponding `spec.md` and `plan.md` tasks.
2.  **Historical Consistency**: Analyze the style, verbosity, and formatting of recently closed PRs in the repository. Mimic their structure (e.g., use of checklists, screenshots if applicable, or summary sections).
3.  **Self-Review**: Before finalizing, verify that:
    - The code follows the modular architecture (Backend/Web/Mobile).
    - Tests are co-located and passing.
    - OpenAPI definitions are updated for any API changes.
4.  **Drafting Messages**: Propose clear, concise commit messages and PR descriptions that focus on "WHY" the change was made, referencing the specific feature ID (e.g., `[001]`).

## References

- **Constitution**: `.specify/memory/constitution.md`
- **Templates**: `.specify/templates/`
- **Active Specs**: `specs/`

---
*This file provides the context for the Gemini CLI. It is hierarchical and its content is prepended to every prompt.*
