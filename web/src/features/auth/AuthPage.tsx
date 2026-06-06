import { SignIn } from '@clerk/clerk-react'

/**
 * Signed-out screen. Rendered by App when the user is not authenticated.
 * The signed-in experience is handled separately (see Dashboard).
 */
export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to Glance</h2>
        <SignIn routing="hash" />
      </div>
    </div>
  )
}
