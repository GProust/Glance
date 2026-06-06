import { describe, it, expect } from 'vitest';
import { computeTrust } from '../trust.js';

describe('computeTrust', () => {
  it('uses a higher base for GitHub repos than for RSS news', () => {
    const gh = computeTrust({ type: 'REPO', provider: 'GITHUB', hasOriginUrl: false, isAiGenerated: false });
    const rss = computeTrust({ type: 'NEWS', provider: 'RSS', hasOriginUrl: false, isAiGenerated: false });
    expect(gh.base).toBe(70);
    expect(rss.base).toBe(50);
  });

  it('rewards a source link and penalizes AI-generated content', () => {
    const t = computeTrust({ type: 'NEWS', provider: 'RSS', hasOriginUrl: true, isAiGenerated: false });
    expect(t.adjustments).toEqual({ has_source_link: 5, ai_generated: 10 });
    expect(t.final).toBe(65); // 50 + 5 + 10

    const ai = computeTrust({ type: 'NEWS', provider: 'RSS', hasOriginUrl: true, isAiGenerated: true });
    expect(ai.final).toBe(40); // 50 + 5 - 15
  });

  it('clamps to 0..100', () => {
    const t = computeTrust({ type: 'REPO', provider: 'GITHUB', hasOriginUrl: true, isAiGenerated: false });
    expect(t.final).toBeLessThanOrEqual(100);
    expect(t.final).toBeGreaterThanOrEqual(0);
  });
});
