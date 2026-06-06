import { BadRequestError } from '../core/config/error-handling.js';
import { getConnector, type NormalizedItem } from '../infrastructure/connectors/index.js';
import type { SourceRow } from '../infrastructure/database/source.repository.js';
import { markFetched } from '../infrastructure/database/source.repository.js';
import { upsertContentItems } from '../infrastructure/database/content.repository.js';
import { enrichSourceItems } from './enrichment.service.js';

export interface IngestionResult {
  fetched: number;
  matched: number;
  stored: number;
  enriched: number;
}

/** Keep only items mentioning at least one followed tag (case-insensitive). */
export function filterByTags(items: NormalizedItem[], tags: string[]): NormalizedItem[] {
  if (tags.length === 0) return items; // no tags -> keep everything (006 edge case)
  const needles = tags.map((t) => t.toLowerCase());
  return items.filter((item) => {
    const haystack = `${item.title ?? ''} ${item.raw_content ?? ''}`.toLowerCase();
    return needles.some((n) => haystack.includes(n));
  });
}

/**
 * Fetch a source's latest content via its connector, apply tag filtering, store it
 * (idempotently), and stamp last_fetched_at. Throws BadRequestError if the source's
 * provider has no connector.
 */
export async function runIngestionForSource(source: SourceRow): Promise<IngestionResult> {
  const connector = getConnector(source.type, source.provider);
  if (!connector) {
    throw new BadRequestError(`No connector for ${source.type}/${source.provider}`);
  }

  const fetched = await connector.fetch(source);

  const tags = Array.isArray(source.config.tags) ? (source.config.tags as string[]) : [];
  const matched = filterByTags(fetched, tags);

  const stored = await upsertContentItems(source.id, matched);
  await markFetched(source.id);

  // Enrich newly stored items. Never let enrichment failures fail ingestion.
  let enriched = 0;
  try {
    enriched = await enrichSourceItems(source);
  } catch (err) {
    console.warn(`[ingestion] enrichment skipped for ${source.id}: ${(err as Error).message}`);
  }

  return { fetched: fetched.length, matched: matched.length, stored, enriched };
}
