# Decisions

A log of cross-cutting product/architecture decisions that several specs depend on.
Each entry is the *resolved* answer to a question the specs left open. Newest first.

---

## D-004 · AI enrichment provider — one provider behind a port
**Status:** Accepted · **Affects:** 002, 003

Summarization, credibility scoring, and AI-generated detection go through a single
`AiEnrichmentPort` (hexagonal). One concrete adapter to start; default **Gemini Flash**
(cheap for summarization, already in use on this project). The spec does not hard-commit
to a vendor beyond "one provider behind a port" so the model can be swapped without
touching the pipeline.

---

## D-003 · Mobile is a strictly read-only consumer
**Status:** Accepted · **Affects:** 002, 004

The mobile app only consumes the feed: `GET /api/feed` and `GET /api/feed/{id}`. No
source management, no admin — all writes live in the Web admin. This matches the original
ask ("a mobile app which will be read only"), keeps the app small, and minimizes the
mobile security surface. 004's "three co-equal modules" framing is read as "three modules,
mobile being a read-only client."

---

## D-002 · Credibility score — transparent rule-based composite (no ML for MVP)
**Status:** Accepted · **Affects:** 002

`content_items.trust_level` (0–100) is computed as a transparent composite, not an ML model:

- **Source reputation (base):** seeded per source from a small allowlist + provider type.
  Official docs / known domains → high; anonymous social / unknown blog → low;
  **unknown → 50 with an "Unknown source" label.**
- **Content adjustments (±):** has original link, identifiable author, not flagged
  AI-generated, coherence/length.
- The component breakdown is stored in `content_items.metadata.trust` so the score is
  explainable and tunable; the clamped result goes to `trust_level`.

**AI-generated detection (FR-005):** no separate classifier — the enrichment LLM returns
a `likelyAiGenerated` boolean + confidence in the same call, surfaced as **"Likely AI"**
(matches the false-positive handling in 002's edge cases). Satisfies SC-003 (>80%
high/low-trust discrimination) via a testable fixture set, at near-zero extra cost.

---

## D-001 · MVP provider list — GitHub + RSS only
**Status:** Accepted · **Affects:** 001, 003, 005, 006

| Provider | Status | Reason |
|----------|--------|--------|
| **GitHub** (`REPO`) | MVP | Official API, generous free tier, the origin use-case (001) |
| **RSS** (`NEWS`) | MVP | No auth, no rate-limit/cost issues; proves the generic model with a 2nd type |
| GitLab | Next | Easy once GitHub exists; good "2nd repo provider" to prove extensibility (003) |
| X / Twitter | Deferred | API now paid (~$100+/mo) and restrictive |
| LinkedIn | Deferred | No public feed-read API; requires partner approval |
| Reddit / HuggingFace | Later | Reddit API paid/restricted; HF niche |

MVP ships **two source types (REPO, NEWS) and two providers**, enough to validate unified
registration (006) and the generic data model (005) without any paid/approval-gated API on
the critical path. The connector interface (003) keeps the rest as drop-in additions.
