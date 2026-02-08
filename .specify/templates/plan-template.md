# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: NodeJS (Backend), React (Web), React Native (Mobile)  
**Primary Dependencies**: Supabase Client, OrioleDB  
**Storage**: PostgreSQL (Supabase/OrioleDB)  
**Testing**: Jest/Vitest (Unit + Mocks), Wiremock (E2E Mocks)  
**API Strategy**: OpenAPI v3.1 (Mandatory Examples), SemVer for Breaking Changes
**Diagrams**: Mermaid.js (Sequence, User Journey, Data Model)
**Target Platform**: Web, iOS, Android, Linux Server  
**Project Type**: Multi-module (Backend/Web/Mobile)  
**Performance Goals**: [domain-specific, e.g., 1000 req/s or NEEDS CLARIFICATION]  
**Constraints**: No stored credentials, resilient code, strict separation of concerns.  
**Scale/Scope**: [domain-specific, e.g., 10k users or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] **Modularity**: Are Backend, Web, and Mobile concerns separate?
- [ ] **Stack Compliance**: Does it use Node, React, RN, Supabase?
- [ ] **API Standards**: Is OpenAPI planned? Are breaking changes identified?
- [ ] **Diagrams**: Are Mermaid.js Sequence, User Journey, and Data Model diagrams included?
- [ ] **Security**: Are credentials externalized?
- [ ] **Testing**: Is the Unit vs E2E (w/ Mocks) strategy defined?

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── user-journey.md      # Phase 1 output (/speckit.plan command)
├── sequence.md          # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── modules/
│   ├── services/
│   └── api/
└── tests/
    ├── unit/ (co-located or adjacent)
    └── e2e/

web/
├── src/
│   ├── components/
│   ├── features/
│   └── services/
└── tests/

mobile/
├── src/
│   ├── screens/
│   ├── components/
│   └── navigation/
└── tests/
```

**Structure Decision**: [Confirm adherence to the 3-module structure above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., New Microservice] | [current need] | [why monolithic backend insufficient] |
