import type { Connector } from './types.js';
import { rssConnector } from './rss.connector.js';
import { githubConnector } from './github.connector.js';

// Maps a source's type+provider to its connector. Mirrors the provider registry
// (core/providers): keep the two in step when adding a provider.
const CONNECTORS: Record<string, Connector> = {
  'NEWS:RSS': rssConnector,
  'REPO:GITHUB': githubConnector,
};

export function getConnector(type: string, provider: string): Connector | undefined {
  return CONNECTORS[`${type}:${provider}`];
}

export type { Connector, NormalizedItem } from './types.js';
