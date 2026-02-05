# Research: Multi-Module Foundation

## R-001: Authentication Provider
- **Decision**: Clerk (Initial recommendation for fast multi-platform setup).
- **Rationale**: Excellent React and React Native SDKs, robust free tier, handles JWT session management out of the box.
- **Alternatives**: Auth0 (more complex), Firebase (proprietary ecosystem).

## R-002: DDOS & Rate Limiting
- **Decision**: Express-rate-limit + Cloudflare (Free tier).
- **Rationale**: Layered protection. Cloudflare handles edge-level traffic, `express-rate-limit` handles application-level abuse.
- **Alternatives**: Custom middleware (harder to maintain).

## R-003: Hexagonal Folder Structure
- **Structure**:
    - `src/domain`: Entities, Value Objects, Domain Services (No dependencies).
    - `src/application`: Use cases, Ports (interfaces).
    - `src/infrastructure`: Adapters (DB, External APIs, Auth implementation).
- **Rationale**: Strict separation allows swapping Supabase or Auth providers without touching core logic.
