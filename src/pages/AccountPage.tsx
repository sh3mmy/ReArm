import React, { useState } from "react";

// If your AuthContext is in a different path, change this import.
import { useAuth } from "../context/AuthContext";

/**
 * AccountPage
 * - Shows current user if logged in
 * - Otherwise renders a clean sign-in/sign-up panel
 * - Includes "Skip login (dev)" to bypass auth fast
 */
const AccountPage: React.FC = () => {
  const {
    user,
    signInEmail,
    signUpEmail,
    signInGoogle,
    devSkipLogin,
    signOut,
  } = useAuth();

  // local form state (only used when logged out)
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // for sign-up only
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "signin") {
        await signInEmail(email, password);
      } else {
        await signUpEmail(name, email, password);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            My Account
          </h1>

          <div className="mt-6 rounded-2xl border border-white/10 p-6 bg-white/5">
            <div className="flex items-center gap-4">
              <img
                src={
                  user.photoURL ||
                  "https://api.dicebear.com/8.x/identicon/svg?seed=ReArm"
                }
                alt=""
                className="w-14 h-14 rounded-full border border-white/20"
              />
              <div>
                <div className="text-lg">{user.displayName}</div>
                <div className="text-white/70 text-sm">{user.email}</div>
                <div className="text-white/40 text-xs mt-1">UID: {user.uid}</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => signOut()}
                className="px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Logged out view
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-4 md:px-6 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {mode === "signin" ? "Sign in to ReArm" : "Create your ReArm account"}
        </h1>
        <p className="text-white/70 mt-1 text-sm">
          Use a demo flow or skip auth in development.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="text-white/70 text-sm">Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Appleseed"
                className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none focus:border-white/40"
              />
            </label>
          )}

          <label className="block">
            <span className="text-white/70 text-sm">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none focus:border-white/40"
            />
          </label>

          <label className="block">
            <span className="text-white/70 text-sm">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none focus:border-white/40"
            />
          </label>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={
              busy || !email || !password || (mode === "signup" && !name)
            }
            className={`w-full mt-2 rounded-xl px-4 py-2 transition ${
              busy || !email || !password || (mode === "signup" && !name)
                ? "bg-white/10 text-white/40"
                : "bg-white text-black hover:opacity-90"
            }`}
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="h-px bg-white/10" />
          <div className="absolute inset-0 -top-3 text-center">
            <span className="px-2 text-xs text-white/50 bg-black">or</span>
          </div>
        </div>

        <div className="grid gap-2">
          <button
            onClick={async () => {
              setBusy(true);
              try {
                await signInGoogle();
              } finally {
                setBusy(false);
              }
            }}
            className="w-full rounded-xl px-4 py-2 border border-white/20 text-white/90 hover:bg-white/5"
          >
            Continue with Google (mock)
          </button>

          <button
            onClick={() => devSkipLogin()}
            className="w-full rounded-xl px-4 py-2 border border-white/20 text-white/90 hover:bg-white/5"
            title="Development shortcut – bypass authentication"
          >
            Skip login (dev)
          </button>
        </div>

        <div className="text-center text-sm text-white/60 mt-4">
          {mode === "signin" ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="underline hover:text-white"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("signin")}
                className="underline hover:text-white"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default AccountPage;
