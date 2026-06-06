import { describe, it, expect } from 'vitest';
import { getProvider, supportedProvidersLabel, PROVIDERS } from '../registry.js';

describe('provider registry', () => {
  it('resolves supported providers and rejects unknown ones', () => {
    expect(getProvider('REPO', 'GITHUB')?.label).toBe('GitHub repository');
    expect(getProvider('NEWS', 'RSS')?.label).toBe('RSS / Atom feed');
    expect(getProvider('SOCIAL', 'X')).toBeUndefined();
    expect(getProvider('REPO', 'GITLAB')).toBeUndefined();
  });

  it('lists supported providers (MVP = GitHub + RSS)', () => {
    expect(supportedProvidersLabel()).toBe('REPO/GITHUB, NEWS/RSS');
    expect(PROVIDERS).toHaveLength(2);
  });

  it('validates GitHub config', () => {
    expect(getProvider('REPO', 'GITHUB')!.configSchema.safeParse({ owner: 'a', repo: 'b' }).success).toBe(true);
    expect(getProvider('REPO', 'GITHUB')!.configSchema.safeParse({ owner: 'a' }).success).toBe(false);
    expect(getProvider('REPO', 'GITHUB')!.configSchema.safeParse({ owner: 'a', repo: 'b', fetchLimit: 999 }).success).toBe(false);
  });

  it('validates RSS config (URL required, tags optional)', () => {
    expect(getProvider('NEWS', 'RSS')!.configSchema.safeParse({ url: 'https://x.com/feed' }).success).toBe(true);
    expect(getProvider('NEWS', 'RSS')!.configSchema.safeParse({ url: 'https://x.com/feed', tags: ['ai'] }).success).toBe(true);
    expect(getProvider('NEWS', 'RSS')!.configSchema.safeParse({ url: 'not-a-url' }).success).toBe(false);
  });
});
