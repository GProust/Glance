import { useEffect, useState } from 'react'
import { useApi, type Source } from '../../lib/api'

// Mirrors the backend provider registry (MVP: GitHub + RSS).
const PROVIDER_OPTIONS = [
  {
    key: 'REPO/GITHUB',
    type: 'REPO',
    provider: 'GITHUB',
    label: 'GitHub repository',
    fields: [
      { name: 'owner', label: 'Owner', placeholder: 'e.g. facebook' },
      { name: 'repo', label: 'Repository', placeholder: 'e.g. react' },
    ],
  },
  {
    key: 'NEWS/RSS',
    type: 'NEWS',
    provider: 'RSS',
    label: 'RSS / Atom feed',
    fields: [
      { name: 'url', label: 'Feed URL', placeholder: 'https://…/rss.xml' },
      { name: 'tags', label: 'Tags to follow (optional, comma-separated)', placeholder: 'ai, typescript' },
    ],
  },
] as const

function configSummary(s: Source): string {
  if (s.config.url) return String(s.config.url)
  if (s.config.owner && s.config.repo) return `${s.config.owner}/${s.config.repo}`
  return JSON.stringify(s.config)
}

export default function SourcesPage() {
  const api = useApi()
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add-source form state
  const [providerKey, setProviderKey] = useState<string>(PROVIDER_OPTIONS[0].key)
  const [displayName, setDisplayName] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [recurrence, setRecurrence] = useState('hourly')
  const [submitting, setSubmitting] = useState(false)

  // Per-row action state
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rowMsg, setRowMsg] = useState<Record<string, string>>({})

  const selected = PROVIDER_OPTIONS.find((p) => p.key === providerKey) ?? PROVIDER_OPTIONS[0]

  async function reload() {
    try {
      const { sources } = await api.listSources()
      setSources(sources)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  useEffect(() => {
    void (async () => {
      setLoading(true)
      await reload()
      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function buildConfig(): Record<string, unknown> {
    const cfg: Record<string, unknown> = {}
    for (const f of selected.fields) {
      const val = (fields[f.name] ?? '').trim()
      if (f.name === 'tags') {
        const tags = val.split(',').map((t) => t.trim()).filter(Boolean)
        if (tags.length) cfg.tags = tags
      } else if (val) {
        cfg[f.name] = val
      }
    }
    return cfg
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.createSource({
        type: selected.type,
        provider: selected.provider,
        display_name: displayName,
        config: buildConfig(),
        recurrence,
      })
      setDisplayName('')
      setFields({})
      await reload()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function onFetch(id: string) {
    setBusyId(id)
    setRowMsg((m) => ({ ...m, [id]: '' }))
    try {
      const r = await api.fetchSource(id)
      setRowMsg((m) => ({ ...m, [id]: `fetched ${r.fetched}, stored ${r.stored}` }))
      await reload()
    } catch (e) {
      setRowMsg((m) => ({ ...m, [id]: (e as Error).message }))
    } finally {
      setBusyId(null)
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm('Delete this source and its content?')) return
    setBusyId(id)
    try {
      await api.deleteSource(id)
      await reload()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm'

  return (
    <div className="space-y-8">
      {/* Add a source */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Add a source</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Type</span>
              <select
                className={inputClass}
                value={providerKey}
                onChange={(e) => {
                  setProviderKey(e.target.value)
                  setFields({})
                }}
              >
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Display name</span>
              <input
                className={inputClass}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="My source"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {selected.fields.map((f) => (
              <label key={f.name} className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">{f.label}</span>
                <input
                  className={inputClass}
                  value={fields[f.name] ?? ''}
                  onChange={(e) => setFields((prev) => ({ ...prev, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              </label>
            ))}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Check for updates</span>
              <select className={inputClass} value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add source'}
          </button>
        </form>
      </section>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* Source list */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Your sources</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : sources.length === 0 ? (
          <p className="text-sm text-gray-500">No sources yet. Add one above.</p>
        ) : (
          <ul className="divide-y">
            {sources.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{s.display_name}</p>
                  <p className="truncate text-sm text-gray-500">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                      {s.type}/{s.provider}
                    </span>{' '}
                    {configSummary(s)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {s.last_fetched_at ? `Last fetched ${new Date(s.last_fetched_at).toLocaleString()}` : 'Never fetched'}
                    {rowMsg[s.id] ? ` · ${rowMsg[s.id]}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onFetch(s.id)}
                    disabled={busyId === s.id}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    {busyId === s.id ? 'Working…' : 'Fetch now'}
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    disabled={busyId === s.id}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
