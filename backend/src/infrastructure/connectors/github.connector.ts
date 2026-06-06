import { env } from '../../core/config/env.config.js';
import type { SourceRow } from '../database/source.repository.js';
import type { Connector, NormalizedItem } from './types.js';

const MAX_RAW = 4000;
const DEFAULT_LIMIT = 30;

interface GithubIssue {
  id: number;
  number: number;
  html_url: string;
  title: string;
  body: string | null;
  state: string;
  comments: number;
  created_at: string;
  pull_request?: unknown;
}

export function normalizeGithubIssue(issue: GithubIssue): NormalizedItem {
  return {
    external_id: String(issue.id),
    origin_url: issue.html_url,
    title: issue.title,
    raw_content: issue.body ? issue.body.slice(0, MAX_RAW) : null,
    published_at: issue.created_at,
    metadata: {
      number: issue.number,
      state: issue.state,
      comments: issue.comments,
      is_pull_request: Boolean(issue.pull_request),
    },
  };
}

/** Fetches recent issues (GitHub's issues endpoint also includes PRs). */
export const githubConnector: Connector = {
  async fetch(source: SourceRow): Promise<NormalizedItem[]> {
    const owner = String(source.config.owner ?? '');
    const repo = String(source.config.repo ?? '');
    const limit = Number(source.config.fetchLimit) || DEFAULT_LIMIT;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'glance-bot',
    };
    // Optional token for higher rate limits / private repos.
    if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&sort=updated&per_page=${limit}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub fetch failed for ${owner}/${repo}: HTTP ${res.status}`);

    const issues = (await res.json()) as GithubIssue[];
    return issues.map(normalizeGithubIssue);
  },
};
