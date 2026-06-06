import { useState } from 'react'
import { UserButton, useAuth, useUser } from '@clerk/clerk-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

/**
 * Signed-in landing screen. Minimal for now: shows the user and a button that calls the
 * backend's authenticated endpoint with the Clerk session token, to verify the full
 * web -> Clerk -> backend auth chain end to end.
 */
export default function Dashboard() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function verifyBackend() {
    setLoading(true)
    setResult(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.text()
      setResult(`HTTP ${res.status}: ${body}`)
    } catch (err) {
      setResult(`Request failed: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Glance Admin</h1>
        <UserButton afterSignOutUrl="/" />
      </header>
      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <p className="text-gray-700">
          Signed in as{' '}
          <span className="font-medium">{user?.primaryEmailAddress?.emailAddress}</span>.
        </p>
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Backend connectivity</h2>
          <p className="mb-4 text-sm text-gray-600">
            Calls <code>GET /api/v1/auth/me</code> with your Clerk session token.
          </p>
          <button
            onClick={verifyBackend}
            disabled={loading}
            className="rounded-md bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Verify backend auth'}
          </button>
          {result && (
            <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-3 text-xs">{result}</pre>
          )}
        </section>
      </main>
    </div>
  )
}
