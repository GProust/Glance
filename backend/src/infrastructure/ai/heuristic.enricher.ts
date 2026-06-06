import type { AiEnricher, AiSummary, EnrichInput } from './types.js';

const MAX_WORDS = 60;

/**
 * No-API fallback enricher. Produces a short extractive summary (leading words) so the
 * feed shows something even when no AI provider is available or its quota is exhausted.
 * It does not attempt AI-generated detection (defaults to false).
 */
export const heuristicEnricher: AiEnricher = {
  async summarize({ title, content }: EnrichInput): Promise<AiSummary> {
    const text = (content || title || '').replace(/\s+/g, ' ').trim();
    const words = text.split(' ').filter(Boolean);
    const summary = words.length > MAX_WORDS ? `${words.slice(0, MAX_WORDS).join(' ')}…` : text;
    return { summary, likelyAiGenerated: false, aiConfidence: 0, producedBy: 'heuristic' };
  },
};
