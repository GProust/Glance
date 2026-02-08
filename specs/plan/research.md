# Research: Glance Platform Foundation

## Decision: Supabase + OrioleDB
- **Rationale**: User explicitly requested Supabase with OrioleDB. OrioleDB provides high-concurrency and efficient storage for the high-volume ingestion expected from social/news feeds.
- **Alternatives Considered**: Standard PostgreSQL (rejected per constitution).

## Decision: Clerk for Authentication
- **Rationale**: Provides a generous free plan, easy SDKs for React and NodeJS, and handles complex flows like OIDC and session management.
- **Alternatives Considered**: Auth0 (more complex free tier), Firebase Auth (vendor lock-in).

## Decision: Hexagonal Architecture (Ports & Adapters)
- **Rationale**: Crucial for multi-provider extensibility (FR-007, 008 in 005/006). Allows adding GitHub, GitLab, Reddit adapters without touching the core business logic.
- **Implementation**: Define `IngestionPort` and `StoragePort`. Use adapters for each provider.

## Decision: Upstash or Cloudflare for Rate Limiting
- **Rationale**: To meet FR-004 (DDOS protection). Upstash Redis is easy to integrate with NodeJS for global rate limiting.
- **Alternatives Considered**: In-memory middleware (fails in multi-instance environments).

## Decision: Generic Content Schema (JSONB for Provider Metadata)
- **Rationale**: To handle varying fields between providers (Issue counts vs Tweet likes) while keeping a unified core.
- **Approach**: Unified columns for common fields (origin, summary, trust) + JSONB column for provider-specific "SourceConfig".
