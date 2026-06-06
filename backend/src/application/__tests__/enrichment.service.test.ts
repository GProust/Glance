import { describe, it, expect, vi, beforeEach } from 'vitest';

const { primary, getPrimaryMock, listMock, applyMock } = vi.hoisted(() => ({
  primary: { summarize: vi.fn() },
  getPrimaryMock: vi.fn(),
  listMock: vi.fn(),
  applyMock: vi.fn(),
}));

vi.mock('../../infrastructure/ai/index.js', () => ({
  getPrimaryEnricher: getPrimaryMock,
  heuristicEnricher: {
    summarize: vi.fn(async () => ({ summary: 'heuristic summary', likelyAiGenerated: false, aiConfidence: 0, producedBy: 'heuristic' })),
  },
}));
vi.mock('../../infrastructure/database/content.repository.js', () => ({
  listUnenrichedForSource: listMock,
  applyEnrichment: applyMock,
}));

import { enrichSourceItems } from '../enrichment.service.js';

const source = { id: 's1', type: 'NEWS', provider: 'RSS' } as never;

beforeEach(() => {
  vi.clearAllMocks();
  applyMock.mockResolvedValue(undefined);
  getPrimaryMock.mockReturnValue(primary);
});

describe('enrichSourceItems', () => {
  it('summarizes via the primary enricher and persists summary + trust + metadata', async () => {
    listMock.mockResolvedValue([{ id: 'c1', title: 't', raw_content: 'body', origin_url: 'u', metadata: { number: 1 } }]);
    primary.summarize.mockResolvedValue({ summary: 'AI summary', likelyAiGenerated: false, aiConfidence: 0.2, producedBy: 'gemini:x' });

    const n = await enrichSourceItems(source);

    expect(n).toBe(1);
    const [id, patch] = applyMock.mock.calls[0]!;
    expect(id).toBe('c1');
    expect(patch.summary).toBe('AI summary');
    expect(patch.trust_level).toBe(65); // RSS 50 + link 5 + not-AI 10
    expect(patch.metadata).toMatchObject({ number: 1, enriched_by: 'gemini:x' });
    expect(patch.metadata.trust).toBeDefined();
  });

  it('falls back to the heuristic when the primary enricher throws', async () => {
    listMock.mockResolvedValue([{ id: 'c1', title: 't', raw_content: 'body', origin_url: null, metadata: {} }]);
    primary.summarize.mockRejectedValue(new Error('429 quota'));

    const n = await enrichSourceItems(source);

    expect(n).toBe(1);
    expect(applyMock.mock.calls[0]![1].metadata.enriched_by).toBe('heuristic');
  });

  it('uses the heuristic directly when no primary enricher is configured', async () => {
    getPrimaryMock.mockReturnValue(null);
    listMock.mockResolvedValue([{ id: 'c1', title: 't', raw_content: 'body', origin_url: null, metadata: {} }]);

    await enrichSourceItems(source);

    expect(primary.summarize).not.toHaveBeenCalled();
    expect(applyMock.mock.calls[0]![1].metadata.enriched_by).toBe('heuristic');
  });
});
