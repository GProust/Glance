import { describe, it, expect, vi, beforeEach } from 'vitest';

const { connector, upsertMock, markFetchedMock, enrichMock } = vi.hoisted(() => ({
  connector: { fetch: vi.fn() },
  upsertMock: vi.fn(),
  markFetchedMock: vi.fn(),
  enrichMock: vi.fn(),
}));

vi.mock('../../infrastructure/connectors/index.js', () => ({
  getConnector: (type: string, provider: string) => (type === 'NEWS' && provider === 'RSS' ? connector : undefined),
}));
vi.mock('../../infrastructure/database/content.repository.js', () => ({ upsertContentItems: upsertMock }));
vi.mock('../../infrastructure/database/source.repository.js', () => ({ markFetched: markFetchedMock }));
vi.mock('../enrichment.service.js', () => ({ enrichSourceItems: enrichMock }));

import { runIngestionForSource, filterByTags } from '../ingestion.service.js';

const item = (id: string, title: string) => ({
  external_id: id,
  origin_url: null,
  title,
  raw_content: null,
  published_at: null,
});

const source = (config: Record<string, unknown> = {}) =>
  ({ id: 's1', type: 'NEWS', provider: 'RSS', config }) as never;

describe('filterByTags', () => {
  it('keeps everything when no tags', () => {
    const items = [item('1', 'hello'), item('2', 'world')];
    expect(filterByTags(items, [])).toHaveLength(2);
  });

  it('matches tags case-insensitively in title or content', () => {
    const items = [item('1', 'About TypeScript'), item('2', 'About Go')];
    expect(filterByTags(items, ['typescript']).map((i) => i.external_id)).toEqual(['1']);
  });
});

describe('runIngestionForSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    markFetchedMock.mockResolvedValue(undefined);
    enrichMock.mockResolvedValue(0);
  });

  it('fetches, stores, marks fetched, and reports counts', async () => {
    connector.fetch.mockResolvedValue([item('1', 'a'), item('2', 'b')]);
    upsertMock.mockResolvedValue(2);
    enrichMock.mockResolvedValue(2);

    const result = await runIngestionForSource(source());

    expect(result).toEqual({ fetched: 2, matched: 2, stored: 2, enriched: 2 });
    expect(upsertMock).toHaveBeenCalledWith('s1', expect.arrayContaining([expect.objectContaining({ external_id: '1' })]));
    expect(markFetchedMock).toHaveBeenCalledWith('s1');
  });

  it('applies tag filtering before storing', async () => {
    connector.fetch.mockResolvedValue([item('1', 'TypeScript rocks'), item('2', 'Go is fine')]);
    upsertMock.mockResolvedValue(1);

    const result = await runIngestionForSource(source({ tags: ['typescript'] }));

    expect(result).toEqual({ fetched: 2, matched: 1, stored: 1, enriched: 0 });
    expect(upsertMock.mock.calls[0]![1]).toHaveLength(1);
  });

  it('throws when no connector exists for the provider', async () => {
    await expect(runIngestionForSource({ id: 's1', type: 'SOCIAL', provider: 'X', config: {} } as never)).rejects.toThrow(
      /No connector/,
    );
  });
});
