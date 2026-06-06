-- 0001_init_schema.sql
-- Glance initial schema. Target: Supabase (PostgreSQL, OrioleDB-backed).
--
-- Notes for this deployment:
--   * Tables live in the `api` schema (the only schema this project exposes via PostgREST),
--     NOT the default `public`.
--   * The migration runner (scripts/migrate.mjs) sets default_table_access_method='orioledb'
--     for the session when the orioledb extension is present, so these tables become
--     OrioleDB tables without per-table USING clauses.
--   * Auth model: the backend validates the Clerk JWT and accesses the DB with the
--     service-role key (which bypasses RLS). RLS is therefore enabled WITHOUT policies as a
--     deny-by-default safety net for the anon/authenticated client roles. Add policies later
--     only if web/mobile query Supabase directly.
--   * users.id is TEXT because it stores the Clerk user id (e.g. "user_2abc..."), which is
--     not a UUID.

CREATE SCHEMA IF NOT EXISTS api;

-- 1. Users (identity owned by Clerk; this row is a local projection)
CREATE TABLE IF NOT EXISTS api.users (
    id          TEXT PRIMARY KEY,                 -- Clerk user id
    email       TEXT UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tags (global or user-scoped categorization)
CREATE TABLE IF NOT EXISTS api.tags (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    is_global   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Sources (unified provider registration)
CREATE TABLE IF NOT EXISTS api.sources (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             TEXT NOT NULL REFERENCES api.users(id) ON DELETE CASCADE,
    type                TEXT NOT NULL,                       -- 'REPO' | 'NEWS' | 'SOCIAL'
    provider            TEXT NOT NULL,                       -- 'GITHUB' | 'RSS' | ...
    display_name        TEXT NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    recurrence_interval INTERVAL NOT NULL DEFAULT '1 hour',
    config              JSONB NOT NULL DEFAULT '{}'::jsonb,  -- provider-specific settings
    last_fetched_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Source <-> Tag mapping
CREATE TABLE IF NOT EXISTS api.source_tags (
    source_id   UUID NOT NULL REFERENCES api.sources(id) ON DELETE CASCADE,
    tag_id      UUID NOT NULL REFERENCES api.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (source_id, tag_id)
);

-- 5. Content items (unified storage with AI enrichment)
CREATE TABLE IF NOT EXISTS api.content_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id       UUID NOT NULL REFERENCES api.sources(id) ON DELETE CASCADE,
    external_id     TEXT NOT NULL,                           -- id from origin provider
    origin_url      TEXT,
    title           TEXT,
    summary         TEXT,                                    -- AI-generated summary
    raw_content     TEXT,
    published_at    TIMESTAMPTZ,
    fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trust_level     INTEGER CHECK (trust_level BETWEEN 0 AND 100),
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,      -- e.g. trust breakdown, likes, pr_count
    UNIQUE (source_id, external_id)                          -- idempotent ingestion
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_items_source_id    ON api.content_items(source_id);
CREATE INDEX IF NOT EXISTS idx_content_items_published_at ON api.content_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_sources_user_id            ON api.sources(user_id);

-- Row Level Security: deny-by-default (no policies). service_role bypasses RLS.
ALTER TABLE api.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.tags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.sources       ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.source_tags   ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.content_items ENABLE ROW LEVEL SECURITY;

-- Privileges: backend uses service_role; expose schema usage to the standard Supabase roles.
GRANT USAGE ON SCHEMA api TO anon, authenticated, service_role;
GRANT ALL    ON ALL TABLES IN SCHEMA api TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT ALL ON TABLES TO service_role;

-- Ask PostgREST to refresh its schema cache so the new tables are immediately queryable.
NOTIFY pgrst, 'reload schema';
