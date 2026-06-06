import { useAuth } from '@clerk/clerk-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export interface Source {
  id: string
  type: string
  provider: string
  display_name: string
  is_active: boolean
  recurrence_interval: string
  config: Record<string, unknown>
  last_fetched_at: string | null
}

export interface IngestResult {
  fetched: number
  matched: number
  stored: number
}

async function call(token: string | null, path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}`, ...opts.headers },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(body.message || `Request failed (HTTP ${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}

/** API client bound to the current Clerk session token. */
export function useApi() {
  const { getToken } = useAuth()
  const c = async (path: string, opts?: RequestInit) => call(await getToken(), path, opts)
  return {
    listSources: (): Promise<{ sources: Source[] }> => c('/sources'),
    createSource: (body: unknown): Promise<Source> => c('/sources', { method: 'POST', body: JSON.stringify(body) }),
    deleteSource: (id: string): Promise<null> => c(`/sources/${id}`, { method: 'DELETE' }),
    fetchSource: (id: string): Promise<IngestResult> => c(`/sources/${id}/fetch`, { method: 'POST' }),
  }
}
