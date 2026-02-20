import { SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <SignedOut>
        <div className="w-full max-w-md space-y-8 p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to Glance
          </h2>
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      <SignedIn>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome to Glance!</h2>
          <p className="mt-2">You are now signed in.</p>
        </div>
      </SignedIn>
    </div>
  );
}
