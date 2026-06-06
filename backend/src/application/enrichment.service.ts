import { computeTrust } from '../core/enrichment/trust.js';
import { getPrimaryEnricher, heuristicEnricher } from '../infrastructure/ai/index.js';
import type { SourceRow } from '../infrastructure/database/source.repository.js';
import { listUnenrichedForSource, applyEnrichment } from '../infrastructure/database/content.repository.js';

export const DEFAULT_ENRICH_CAP = 5;

/**
 * Enrich up to `limit` of a source's un-summarized items: generate a summary + AI-detection
 * (via the configured AI provider, falling back to a local heuristic when AI is absent or
 * fails), compute a rule-based trust score, and persist. Returns how many items were enriched.
 *
 * Bounded per call to keep the manual fetch responsive and to respect provider quotas.
 */
export async function enrichSourceItems(source: SourceRow, limit = DEFAULT_ENRICH_CAP): Promise<number> {
  const primary = getPrimaryEnricher();
  const items = await listUnenrichedForSource(source.id, limit);

  let enriched = 0;
  for (const item of items) {
    let ai;
    try {
      ai = primary
        ? await primary.summarize({ title: item.title, content: item.raw_content })
        : await heuristicEnricher.summarize({ title: item.title, content: item.raw_content });
    } catch (err) {
      console.warn(`[enrichment] primary failed for ${item.id} (${(err as Error).message}); using heuristic`);
      ai = await heuristicEnricher.summarize({ title: item.title, content: item.raw_content });
    }

    const trust = computeTrust({
      type: source.type,
      provider: source.provider,
      hasOriginUrl: Boolean(item.origin_url),
      isAiGenerated: ai.likelyAiGenerated,
    });

    await applyEnrichment(item.id, {
      summary: ai.summary,
      is_ai_generated: ai.likelyAiGenerated,
      trust_level: trust.final,
      metadata: { ...item.metadata, trust, ai_confidence: ai.aiConfidence, enriched_by: ai.producedBy },
    });
    enriched++;
  }

  return enriched;
}
