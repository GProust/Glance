import { describe, it, expect, vi, beforeEach } from 'vitest';

// A chainable query-builder mock. select/eq/order return `this`; the terminal
// operations (range, maybeSingle) resolve to a Supabase-style { data, error }.
const { qb, fromMock } = vi.hoisted(() => {
  const qb = {
    select: vi.fn(() => qb),
    eq: vi.fn(() => qb),
    order: vi.fn(() => qb),
    range: vi.fn(),
    maybeSingle: vi.fn(),
  };
  return { qb, fromMock: vi.fn(() => qb) };
});

vi.mock('../supabase.adapter.js', () => ({
  SupabaseAdapter: { getInstance: () => ({ from: fromMock }) },
}));

import { listFeedForUser, getFeedItemForUser } from '../content.repository.js';

describe('content.repository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists feed items scoped to the user, newest first, paginated', async () => {
    const rows = [{ id: 'c1' }, { id: 'c2' }];
    qb.range.mockResolvedValue({ data: rows, error: null });

    const result = await listFeedForUser('user_1', { limit: 20, offset: 0 });

    expect(fromMock).toHaveBeenCalledWith('content_items');
    expect(qb.eq).toHaveBeenCalledWith('sources.user_id', 'user_1');
    expect(qb.order).toHaveBeenCalledWith('published_at', { ascending: false, nullsFirst: false });
    expect(qb.range).toHaveBeenCalledWith(0, 19);
    expect(result).toEqual(rows);
  });

  it('returns [] when there are no rows', async () => {
    qb.range.mockResolvedValue({ data: null, error: null });
    expect(await listFeedForUser('user_1', { limit: 10, offset: 0 })).toEqual([]);
  });

  it('throws when the query errors', async () => {
    qb.range.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(listFeedForUser('user_1', { limit: 10, offset: 0 })).rejects.toEqual({ message: 'boom' });
  });

  it('fetches a single item scoped to the user, or null', async () => {
    qb.maybeSingle.mockResolvedValue({ data: { id: 'c1' }, error: null });
    expect(await getFeedItemForUser('user_1', 'c1')).toEqual({ id: 'c1' });
    expect(qb.eq).toHaveBeenCalledWith('id', 'c1');
    expect(qb.eq).toHaveBeenCalledWith('sources.user_id', 'user_1');

    qb.maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await getFeedItemForUser('user_1', 'missing')).toBeNull();
  });
});
