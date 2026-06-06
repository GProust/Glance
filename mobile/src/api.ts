import { useAuth } from '@clerk/clerk-expo';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export interface FeedItem {
  id: string;
  origin_url: string | null;
  title: string | null;
  summary: string | null;
  published_at: string | null;
  trust_level: number | null;
  is_ai_generated: boolean;
  metadata: Record<string, unknown>;
  sources: { type: string; provider: string; display_name: string } | null;
}

/** API client bound to the current Clerk session token. */
export function useApi() {
  const { getToken } = useAuth();
  return {
    async getFeed(limit = 20, offset = 0): Promise<FeedItem[]> {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/feed?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      if (!res.ok) throw new Error(`Failed to load feed (HTTP ${res.status})`);
      const body = (await res.json()) as { items: FeedItem[] };
      return body.items;
    },
  };
}
