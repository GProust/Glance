import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../../../core/config/env.config.js', () => ({ env: { GEMINI_API_KEY: 'test-key', GEMINI_MODEL: undefined } }));

import { geminiEnricher } from '../gemini.adapter.js';
import { heuristicEnricher } from '../heuristic.enricher.js';

const reply = (obj: unknown) => {
  const body = { candidates: [{ content: { parts: [{ text: JSON.stringify(obj) }] } }] };
  return new Response(JSON.stringify(body), { status: 200 });
};

afterEach(() => vi.unstubAllGlobals());

describe('geminiEnricher', () => {
  it('parses a summary from the first working model', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => reply({ summary: 'A summary', likelyAiGenerated: false, aiConfidence: 0.1 })));
    const r = await geminiEnricher.summarize({ title: 't', content: 'c' });
    expect(r.summary).toBe('A summary');
    expect(r.likelyAiGenerated).toBe(false);
    expect(r.producedBy).toBe('gemini:gemini-2.5-flash-lite');
  });

  it('falls back to the next model on 429 (quota)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('quota', { status: 429 }))
      .mockResolvedValueOnce(reply({ summary: 'second model', likelyAiGenerated: true, aiConfidence: 0.9 }));
    vi.stubGlobal('fetch', fetchMock);

    const r = await geminiEnricher.summarize({ title: 't', content: 'c' });
    expect(r.summary).toBe('second model');
    expect(r.producedBy).toBe('gemini:gemini-2.0-flash-lite');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('parses JSON wrapped in markdown fences', async () => {
    const text = '```json\n{"summary":"fenced","likelyAiGenerated":false,"aiConfidence":0}\n```';
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 })));
    const r = await geminiEnricher.summarize({ title: 't', content: 'c' });
    expect(r.summary).toBe('fenced');
  });

  it('throws when every model is exhausted', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('quota', { status: 429 })));
    await expect(geminiEnricher.summarize({ title: 't', content: 'c' })).rejects.toThrow();
  });
});

describe('heuristicEnricher', () => {
  it('truncates long content to a leading extract', async () => {
    const content = Array.from({ length: 100 }, (_, i) => `w${i}`).join(' ');
    const r = await heuristicEnricher.summarize({ title: 't', content });
    expect(r.producedBy).toBe('heuristic');
    expect(r.summary.endsWith('…')).toBe(true);
    expect(r.likelyAiGenerated).toBe(false);
  });

  it('falls back to the title when there is no content', async () => {
    const r = await heuristicEnricher.summarize({ title: 'Just a title', content: null });
    expect(r.summary).toBe('Just a title');
  });
});
