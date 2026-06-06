import { SupabaseAdapter } from './supabase.adapter.js';
import type { NormalizedItem } from '../connectors/types.js';

/**
 * A content item as exposed in the read-only feed, with a thin slice of its source.
 */
export interface FeedItem {
  id: string;
  source_id: string;
  external_id: string;
  origin_url: string | null;
  title: string | null;
  summary: string | null;
  published_at: string | null;
  fetched_at: string;
  trust_level: number | null;
  is_ai_generated: boolean;
  metadata: Record<string, unknown>;
  sources: { type: string; provider: string; display_name: string } | null;
}

// `sources!inner` joins the parent source and lets us filter the feed by its owner.
const FEED_COLUMNS =
  'id, source_id, external_id, origin_url, title, summary, published_at, fetched_at, ' +
  'trust_level, is_ai_generated, metadata, sources!inner(type, provider, display_name, user_id)';

export interface FeedQuery {
  limit: number;
  offset: number;
}

/** List a user's feed items, newest first. */
export async function listFeedForUser(userId: string, { limit, offset }: FeedQuery): Promise<FeedItem[]> {
  const { data, error } = await SupabaseAdapter.getInstance()
    .from('content_items')
    .select(FEED_COLUMNS)
    .eq('sources.user_id', userId)
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data ?? []) as unknown as FeedItem[];
}

/**
 * Insert or update content items for a source, keyed by (source_id, external_id) so
 * re-fetching is idempotent. Returns how many rows were written.
 */
export async function upsertContentItems(sourceId: string, items: NormalizedItem[]): Promise<number> {
  if (items.length === 0) return 0;

  const rows = items.map((i) => ({
    source_id: sourceId,
    external_id: i.external_id,
    origin_url: i.origin_url ?? null,
    title: i.title ?? null,
    raw_content: i.raw_content ?? null,
    published_at: i.published_at ?? null,
    metadata: i.metadata ?? {},
  }));

  const { data, error } = await SupabaseAdapter.getInstance()
    .from('content_items')
    .upsert(rows, { onConflict: 'source_id,external_id' })
    .select('id');

  if (error) throw error;
  return data?.length ?? 0;
}

export interface UnenrichedItem {
  id: string;
  title: string | null;
  raw_content: string | null;
  origin_url: string | null;
  metadata: Record<string, unknown>;
}

/** Items for a source that have not been summarized yet (summary IS NULL). */
export async function listUnenrichedForSource(sourceId: string, limit: number): Promise<UnenrichedItem[]> {
  const { data, error } = await SupabaseAdapter.getInstance()
    .from('content_items')
    .select('id, title, raw_content, origin_url, metadata')
    .eq('source_id', sourceId)
    .is('summary', null)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as UnenrichedItem[];
}

export interface EnrichmentPatch {
  summary: string;
  is_ai_generated: boolean;
  trust_level: number;
  metadata: Record<string, unknown>;
}

/** Write enrichment results onto a content item. */
export async function applyEnrichment(id: string, patch: EnrichmentPatch): Promise<void> {
  const { error } = await SupabaseAdapter.getInstance().from('content_items').update(patch).eq('id', id);
  if (error) throw error;
}

/** Fetch a single feed item the user owns, or null if not found / not theirs. */
export async function getFeedItemForUser(userId: string, id: string): Promise<FeedItem | null> {
  const { data, error } = await SupabaseAdapter.getInstance()
    .from('content_items')
    .select(FEED_COLUMNS)
    .eq('id', id)
    .eq('sources.user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as FeedItem) ?? null;
}
