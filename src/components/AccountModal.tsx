// src/components/AccountModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

const AccountModal: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const {
    user,
    signInEmail,
    signUpEmail,
    signInGoogle,
    devSkipLogin,
    signOut,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("pointerdown", onDown, true);
    return () => window.removeEventListener("pointerdown", onDown, true);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
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
      onClose();
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const goProfile = () => {
    onClose();
    navigate("/profile");
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" style={{ zIndex: 1000 }} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-gradient-to-b from-black to-zinc-900 border-l border-white/10 p-6 overflow-y-auto"
        style={{ zIndex: 1001 }}
        role="dialog"
        aria-modal="true"
        aria-label="Account"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-white/90 text-lg">
            {user ? "My Account" : mode === "signin" ? "Sign in to your account" : "Create your account"}
          </div>
          <button className="text-white/70 hover:text-white" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {!user ? (
          <>
            {/* Auth form */}
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <label className="block">
                  <span className="text-white/70 text-sm">Full name</span>
                  <input
                    className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none focus:border-white/40"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Appleseed"
                  />
                </label>
              )}

              <label className="block">
                <span className="text-white/70 text-sm">Email</span>
                <input
                  type="email"
                  className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none focus:border-white/40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
              </label>

              <label className="block">
                <span className="text-white/70 text-sm">Password</span>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none focus:border-white/40"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={busy || !email || !password || (mode === "signup" && !name)}
                className={`w-full mt-2 rounded-xl px-4 py-2 transition ${
                  busy || !email || !password || (mode === "signup" && !name)
                    ? "bg-white/10 text-white/40"
                    : "bg-white text-black hover:opacity-90"
                }`}
              >
                {mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="h-px bg-white/10" />
              <div className="absolute inset-0 -top-3 text-center">
                <span className="px-2 text-xs text-white/50 bg-zinc-900/50">or</span>
              </div>
            </div>

            {/* Providers + Dev */}
            <div className="grid gap-2">
              <button
                onClick={async () => {
                  setBusy(true);
                  try {
                    await signInGoogle();
                    onClose();
                  } finally {
                    setBusy(false);
                  }
                }}
                className="w-full rounded-xl px-4 py-2 border border-white/20 text-white/90 hover:bg-white/5"
              >
                Continue with Google (mock)
              </button>

              <button
                onClick={() => {
                  devSkipLogin();
                  onClose();
                }}
                className="w-full rounded-xl px-4 py-2 border border-white/20 text-white/90 hover:bg-white/5"
                title="Development shortcut – bypass authentication"
              >
                Skip login (dev)
              </button>
            </div>

            {/* Switch */}
            <div className="text-center text-sm text-white/60 mt-4">
              {mode === "signin" ? (
                <>
                  Don’t have an account?{" "}
                  <button onClick={() => setMode("signup")} className="underline hover:text-white">
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => setMode("signin")} className="underline hover:text-white">
                    Sign in
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          // Signed-in view
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img
                src={user.photoURL || "https://api.dicebear.com/8.x/identicon/svg?seed=ReArm"}
                alt=""
                className="w-10 h-10 rounded-full border border-white/20"
              />
              <div>
                <div className="text-white">{user.displayName}</div>
                <div className="text-white/70 text-sm">{user.email}</div>
              </div>
            </div>

            <button
              onClick={goProfile}
              className="w-full rounded-xl px-4 py-2 border border-white/20 text-white/90 hover:bg-white/5"
            >
              Open Profile
            </button>

            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full rounded-xl px-4 py-2 border border-white/20 text-white/90 hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AccountModal;
