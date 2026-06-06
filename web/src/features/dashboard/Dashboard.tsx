import { UserButton, useUser } from '@clerk/clerk-react'
import SourcesPage from '../sources/SourcesPage'

/** Signed-in admin shell: header + source management. */
export default function Dashboard() {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Glance Admin</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-6">
        <SourcesPage />
      </main>
    </div>
  )
}
