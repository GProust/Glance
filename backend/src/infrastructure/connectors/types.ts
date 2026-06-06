import type { SourceRow } from '../database/source.repository.js';

/**
 * A provider item normalized into Glance's shape, ready to upsert into content_items.
 * Enrichment fields (summary, trust_level, is_ai_generated) are added later by the AI
 * pipeline — connectors only produce the raw, normalized content.
 */
export interface NormalizedItem {
  external_id: string;
  origin_url: string | null;
  title: string | null;
  raw_content: string | null;
  published_at: string | null;
  metadata?: Record<string, unknown>;
}

/** A connector knows how to fetch + normalize content for one kind of source. */
export interface Connector {
  fetch(source: SourceRow): Promise<NormalizedItem[]>;
}
