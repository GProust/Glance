/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Chainable Supabase query-builder mock. Non-terminal ops return `qb`; terminal ops
// (single, maybeSingle, and select-after-delete) resolve to { data, error }. Loosely
// typed because a query builder is dual-use (chainable and awaitable).
const { qb, fromMock } = vi.hoisted(() => {
  const qb: any = {};
  for (const m of ['insert', 'update', 'delete', 'select', 'eq', 'order']) qb[m] = vi.fn(() => qb);
  qb.single = vi.fn();
  qb.maybeSingle = vi.fn();
  return { qb, fromMock: vi.fn(() => qb) };
});

vi.mock('../supabase.adapter.js', () => ({
  SupabaseAdapter: { getInstance: () => ({ from: fromMock }) },
}));

import {
  createSource,
  listSourcesForUser,
  getSourceForUser,
  updateSource,
  deleteSource,
} from '../source.repository.js';

beforeEach(() => {
  vi.clearAllMocks();
  // re-point chainable methods at qb after clearAllMocks reset their implementations
  for (const m of ['insert', 'update', 'delete', 'select', 'eq', 'order'] as const) {
    qb[m].mockReturnValue(qb);
  }
});

describe('source.repository', () => {
  it('creates a source, omitting recurrence_interval when not provided', async () => {
    qb.single.mockResolvedValue({ data: { id: 's1' }, error: null });

    await createSource({ user_id: 'u1', type: 'REPO', provider: 'GITHUB', display_name: 'x', config: {} });

    expect(fromMock).toHaveBeenCalledWith('sources');
    const inserted = qb.insert.mock.calls[0]![0];
    expect(inserted).not.toHaveProperty('recurrence_interval');
    expect(inserted).toMatchObject({ user_id: 'u1', type: 'REPO' });
  });

  it('keeps recurrence_interval when provided', async () => {
    qb.single.mockResolvedValue({ data: { id: 's1' }, error: null });
    await createSource({ user_id: 'u1', type: 'NEWS', provider: 'RSS', display_name: 'x', config: {}, recurrence_interval: '1 day' });
    expect(qb.insert.mock.calls[0]![0]).toMatchObject({ recurrence_interval: '1 day' });
  });

  it('lists sources scoped to the user', async () => {
    qb.order.mockResolvedValue({ data: [{ id: 's1' }], error: null });
    const rows = await listSourcesForUser('u1');
    expect(qb.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(rows).toEqual([{ id: 's1' }]);
  });

  it('scopes get/update/delete by id AND user_id', async () => {
    qb.maybeSingle.mockResolvedValue({ data: { id: 's1' }, error: null });
    await getSourceForUser('u1', 's1');
    expect(qb.eq).toHaveBeenCalledWith('id', 's1');
    expect(qb.eq).toHaveBeenCalledWith('user_id', 'u1');

    vi.clearAllMocks();
    for (const m of ['update', 'select', 'eq'] as const) qb[m].mockReturnValue(qb);
    qb.maybeSingle.mockResolvedValue({ data: { id: 's1', display_name: 'new' }, error: null });
    const updated = await updateSource('u1', 's1', { display_name: 'new' });
    expect(updated).toEqual({ id: 's1', display_name: 'new' });
  });

  it('reports whether a delete removed a row', async () => {
    qb.select.mockResolvedValueOnce({ data: [{ id: 's1' }], error: null });
    expect(await deleteSource('u1', 's1')).toBe(true);

    qb.select.mockResolvedValueOnce({ data: [], error: null });
    expect(await deleteSource('u1', 'missing')).toBe(false);
  });
});
