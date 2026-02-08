# Glance Specifications Index

This directory contains the detailed specifications and implementation plans for the Glance platform.

## Core Documentation
- **[Constitution](/.specify/memory/constitution.md)**: Architectural principles and standards.
- **[Global Foundation Plan](/specs/plan/plan.md)**: Consolidated technical strategy and data model.

## Feature Specifications

### Phase 1: Foundation & Data Ingestion
1.  **[001-github-issue-analysis](/specs/001-github-issue-analysis/spec.md)**: Retrieving and summarizing GitHub issues, PRs, and releases.
2.  **[005-generic-data-model](/specs/005-generic-data-model/spec.md)**: The underlying unified schema for all providers.
3.  **[006-unified-provider-registration](/specs/006-unified-provider-registration/spec.md)**: A single interface to manage repos, news feeds, and social media.

### Phase 2: Consumption & Enrichment
4.  **[002-glance-admin-news-mobile](/specs/002-glance-admin-news-mobile/spec.md)**: Admin console for sources and the Read-Only mobile consumer app.
5.  **[003-multi-system-extensibility](/specs/003-multi-system-extensibility/spec.md)**: Architecture for easily adding new providers (GitLab, HuggingFace, etc.).

## Visual Workflows
- **[User Journey Map](/specs/plan/user-journey.md)**
- **[Ingestion Pipeline Sequence](/specs/plan/sequence.md)**
- **[Global Data Model (ERD)](/specs/plan/data-model.md)**

## Active Plans
- **[Consolidated Implementation Plan](/specs/plan/plan.md)**
