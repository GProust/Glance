# Data Model: Glance Global Schema

## Overview
The schema is designed for high extensibility using a "Core + Metadata" approach. Common fields are promoted to top-level columns, while provider-specific data is stored in JSONB fields.

## Tables

### 1. `users`
Profiles for authenticated users.
- `id`: UUID (Primary Key, matches Clerk ID)
- `email`: VARCHAR(255)
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### 2. `sources`
Registered information sources (Repos, RSS, Social handles).
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> users.id)
- `type`: VARCHAR(20) -- 'REPO', 'NEWS', 'SOCIAL'
- `provider`: VARCHAR(50) -- 'GITHUB', 'GITLAB', 'X', 'LINKEDIN', 'RSS', 'HUGGINGFACE'
- `display_name`: VARCHAR(255)
- `is_active`: BOOLEAN DEFAULT TRUE
- `recurrence_interval`: INTERVAL -- e.g., '1 hour', '1 day'
- `config`: JSONB -- Provider-specific (url, tags, accounts, depth)
- `last_fetched_at`: TIMESTAMP WITH TIME ZONE
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### 3. `content_items`
Unified storage for all ingested and summarized content.
- `id`: UUID (Primary Key)
- `source_id`: UUID (Foreign Key -> sources.id)
- `external_id`: VARCHAR(255) -- ID from the provider (e.g., GitHub Issue ID, Tweet ID)
- `origin_url`: TEXT -- Link to the original content
- `title`: TEXT
- `summary`: TEXT -- AI Generated Resume
- `raw_content`: TEXT -- Full content before summarization (optional/truncated)
- `published_at`: TIMESTAMP WITH TIME ZONE -- Date from provider
- `fetched_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `trust_level`: INTEGER -- 0-100 credibility score
- `is_ai_generated`: BOOLEAN -- AI detection flag
- `metadata`: JSONB -- Provider-specific metadata (issue_count, pr_count, version, likes, etc.)

### 4. `tags`
Global and user-specific tags for categorization.
- `id`: UUID (Primary Key)
- `name`: VARCHAR(50) UNIQUE
- `is_global`: BOOLEAN DEFAULT FALSE

### 5. `source_tags`
Mapping between sources and the tags they follow.
- `source_id`: UUID (Foreign Key -> sources.id)
- `tag_id`: UUID (Foreign Key -> tags.id)
- PRIMARY KEY (source_id, tag_id)

## Relationships
- A **User** has many **Sources**.
- A **Source** has many **ContentItems**.
- A **Source** can follow many **Tags**.
- A **Tag** can be associated with many **Sources**.

## Supabase Implementation Notes
- Use **Row Level Security (RLS)**: Users can only see/manage their own `sources` and the resulting `content_items`.
- Use **OrioleDB** for the `content_items` table to optimize for high-frequency inserts and range scans on `published_at`.
- Indexing:
  - `content_items(source_id, published_at DESC)`
  - `content_items(external_id)` for upsert operations.
  - `sources(user_id, is_active)`
