import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../../../core/config/env.config.js', () => ({ env: { GITHUB_TOKEN: undefined } }));

import { rssConnector, normalizeRssItem } from '../rss.connector.js';
import { githubConnector, normalizeGithubIssue } from '../github.connector.js';

const RSS_XML = `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Demo</title>
  <item><title>First post</title><link>https://ex.com/1</link><guid>g1</guid>
    <pubDate>Wed, 01 Jan 2025 00:00:00 GMT</pubDate><description>Hello world</description></item>
  <item><title>Second</title><link>https://ex.com/2</link><guid>g2</guid>
    <pubDate>Thu, 02 Jan 2025 00:00:00 GMT</pubDate><description>More</description></item>
</channel></rss>`;

const sourceRss = { id: 's', type: 'NEWS', provider: 'RSS', config: { url: 'https://ex.com/feed' } } as never;
const sourceGh = { id: 's', type: 'REPO', provider: 'GITHUB', config: { owner: 'o', repo: 'r' } } as never;

afterEach(() => vi.unstubAllGlobals());

describe('rss.connector', () => {
  it('normalizes an item, falling back from guid to link', () => {
    expect(normalizeRssItem({ title: 't', link: 'https://x/1', guid: 'g1', isoDate: '2025-01-01T00:00:00Z' })?.external_id).toBe('g1');
    expect(normalizeRssItem({ title: 't', link: 'https://x/1' })?.external_id).toBe('https://x/1');
    expect(normalizeRssItem({ title: 't' })).toBeNull(); // no stable id
  });

  it('fetches and parses a feed', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(RSS_XML, { status: 200 })));
    const items = await rssConnector.fetch(sourceRss);
    expect(items).toHaveLength(2);
    expect(items[0]!.external_id).toBe('g1');
    expect(items[0]!.origin_url).toBe('https://ex.com/1');
  });

  it('throws on non-200', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })));
    await expect(rssConnector.fetch(sourceRss)).rejects.toThrow(/HTTP 500/);
  });
});

describe('github.connector', () => {
  it('normalizes an issue and flags pull requests', () => {
    const norm = normalizeGithubIssue({ id: 7, number: 3, html_url: 'https://gh/3', title: 'Bug', body: 'x', state: 'open', comments: 2, created_at: '2025-01-01T00:00:00Z', pull_request: {} });
    expect(norm.external_id).toBe('7');
    expect(norm.metadata).toMatchObject({ number: 3, is_pull_request: true });
  });

  it('fetches issues from the GitHub API', async () => {
    const issues = [{ id: 1, number: 1, html_url: 'u', title: 't', body: null, state: 'open', comments: 0, created_at: '2025-01-01T00:00:00Z' }];
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(issues), { status: 200 })));
    const items = await githubConnector.fetch(sourceGh);
    expect(items).toHaveLength(1);
    expect(items[0]!.external_id).toBe('1');
  });
});
