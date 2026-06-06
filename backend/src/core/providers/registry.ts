import { z } from 'zod';

/**
 * Provider registry — the single place that defines which information sources are
 * supported and what configuration each one needs (spec 006, FR-002).
 *
 * MVP scope is GitHub repositories + RSS feeds (decision D-001). Adding a new provider
 * is purely additive: append an entry here with its config schema; the API validation,
 * the list of "supported providers", and future connectors all read from this list.
 */

export const SOURCE_TYPES = ['REPO', 'NEWS', 'SOCIAL'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

// --- Provider-specific config schemas ---
const githubConfig = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  fetchLimit: z.number().int().positive().max(100).optional(),
});

const rssConfig = z.object({
  url: z.string().url(),
  // "Tags to follow" for filtering which articles to summarize (006 FR-004).
  tags: z.array(z.string()).optional(),
});

export interface ProviderDef {
  type: SourceType;
  provider: string;
  label: string;
  configSchema: z.ZodTypeAny;
}

export const PROVIDERS: ProviderDef[] = [
  { type: 'REPO', provider: 'GITHUB', label: 'GitHub repository', configSchema: githubConfig },
  { type: 'NEWS', provider: 'RSS', label: 'RSS / Atom feed', configSchema: rssConfig },
];

export function getProvider(type: string, provider: string): ProviderDef | undefined {
  return PROVIDERS.find((p) => p.type === type && p.provider === provider);
}

/** Human-readable list of supported type/provider pairs, e.g. "REPO/GITHUB, NEWS/RSS". */
export function supportedProvidersLabel(): string {
  return PROVIDERS.map((p) => `${p.type}/${p.provider}`).join(', ');
}
