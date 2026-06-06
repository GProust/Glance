import { SignedIn, SignedOut } from '@clerk/clerk-react'
import AuthPage from './features/auth/AuthPage'
import Dashboard from './features/dashboard/Dashboard'

function App() {
  return (
    <>
      <SignedOut>
        <AuthPage />
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  )
}

export default App
