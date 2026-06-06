/**
 * Credibility scoring (decision D-002): a transparent, rule-based composite — NOT an ML
 * model. A per-source reputation base plus explainable content adjustments, clamped to
 * 0–100. The breakdown is stored in content_items.metadata.trust so the score is auditable.
 */

export interface TrustBreakdown {
  base: number;
  adjustments: Record<string, number>;
  final: number;
}

export interface TrustInput {
  type: string;
  provider: string;
  hasOriginUrl: boolean;
  isAiGenerated: boolean;
}

// Seed reputation by source kind. Extend with a domain allowlist later.
function baseReputation(type: string, provider: string): number {
  if (type === 'REPO' && provider === 'GITHUB') return 70; // official project data
  if (type === 'NEWS' && provider === 'RSS') return 50; // neutral until we know the source
  return 50; // unknown -> neutral
}

export function computeTrust(input: TrustInput): TrustBreakdown {
  const base = baseReputation(input.type, input.provider);

  const adjustments: Record<string, number> = {};
  if (input.hasOriginUrl) adjustments.has_source_link = 5;
  adjustments.ai_generated = input.isAiGenerated ? -15 : 10;

  const sum = Object.values(adjustments).reduce((a, b) => a + b, 0);
  const final = Math.max(0, Math.min(100, base + sum));
  return { base, adjustments, final };
}
