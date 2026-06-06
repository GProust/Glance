import { env } from '../../core/config/env.config.js';
import type { AiEnricher } from './types.js';
import { geminiEnricher } from './gemini.adapter.js';

/** The configured primary enricher, or null when no AI provider is set up. */
export function getPrimaryEnricher(): AiEnricher | null {
  return env.GEMINI_API_KEY ? geminiEnricher : null;
}

export { heuristicEnricher } from './heuristic.enricher.js';
export type { AiEnricher, AiSummary, EnrichInput } from './types.js';
