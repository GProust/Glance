import Parser from 'rss-parser';
import type { SourceRow } from '../database/source.repository.js';
import type { Connector, NormalizedItem } from './types.js';

const parser = new Parser();

// Truncate raw content so we don't store huge payloads.
const MAX_RAW = 4000;

type RssItem = {
  guid?: string;
  link?: string;
  title?: string;
  content?: string;
  contentSnippet?: string;
  isoDate?: string;
  pubDate?: string;
};

export function normalizeRssItem(item: RssItem): NormalizedItem | null {
  const external_id = item.guid || item.link;
  if (!external_id) return null; // can't dedupe without a stable id
  const raw = item.contentSnippet || item.content || null;
  return {
    external_id,
    origin_url: item.link ?? null,
    title: item.title ?? null,
    raw_content: raw ? raw.slice(0, MAX_RAW) : null,
    published_at: item.isoDate ?? item.pubDate ?? null,
    metadata: {},
  };
}

export const rssConnector: Connector = {
  async fetch(source: SourceRow): Promise<NormalizedItem[]> {
    const url = String(source.config.url ?? '');
    const res = await fetch(url, { headers: { 'User-Agent': 'glance-bot' } });
    if (!res.ok) throw new Error(`RSS fetch failed for ${url}: HTTP ${res.status}`);

    const feed = await parser.parseString(await res.text());
    return (feed.items ?? []).map(normalizeRssItem).filter((i): i is NormalizedItem => i !== null);
  },
};
