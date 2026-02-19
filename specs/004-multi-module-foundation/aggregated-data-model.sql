-- Aggregated Data Model for Glance Platform
-- Target: Supabase (PostgreSQL + OrioleDB)

-- 1. Users (Auth via Clerk, synced to users table)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY, -- Matches Clerk User ID
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tags (Global and User-Specific categorization)
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Source Registrations (Unified Provider Registration)
CREATE TABLE IF NOT EXISTS public.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'REPO', 'NEWS', 'SOCIAL'
    provider TEXT NOT NULL, -- 'GITHUB', 'RSS', 'X', 'LINKEDIN', etc.
    display_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    recurrence_interval INTERVAL DEFAULT '1 hour',
    config JSONB DEFAULT '{}'::jsonb, -- Provider-specific settings
    last_fetched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Source Tags (Mapping between sources and followed interests)
CREATE TABLE IF NOT EXISTS public.source_tags (
    source_id UUID REFERENCES public.sources(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (source_id, tag_id)
);

-- 5. Content Items (Unified storage with AI Enrichment)
-- Note: Using OrioleDB optimized table if available, else standard PG
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL, -- ID from origin provider
    origin_url TEXT,
    title TEXT,
    summary TEXT, -- AI-Generated Resume
    raw_content TEXT, -- Truncated raw content
    published_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    trust_level INTEGER CHECK (trust_level BETWEEN 0 AND 100),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb -- Provider-specific metadata (e.g., pr_count, likes)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_items_source_id ON public.content_items(source_id);
CREATE INDEX IF NOT EXISTS idx_content_items_published_at ON public.content_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_sources_user_id ON public.sources(user_id);
CREATE INDEX IF NOT EXISTS idx_content_items_external_id ON public.content_items(external_id);

-- RLS (Row Level Security) - Basic Setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified)
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can manage their own sources" ON public.sources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view content items from their sources" ON public.content_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sources WHERE sources.id = content_items.source_id AND sources.user_id = auth.uid())
);
