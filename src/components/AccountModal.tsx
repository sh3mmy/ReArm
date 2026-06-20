import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { X, ArrowRight } from "lucide-react";

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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" style={{ zIndex: 1000 }} />

      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-neutral-950 border-l border-white/[0.08] p-6 overflow-y-auto"
        style={{ zIndex: 1001 }}
        role="dialog"
        aria-modal="true"
        aria-label="Account"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="text-white text-lg font-medium tracking-tight">
            {user ? "My Account" : mode === "signin" ? "Sign In" : "Create Account"}
          </div>
          <button
            className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {!user ? (
          <>
            <form onSubmit={submit} className="space-y-5">
              {mode === "signup" && (
                <label className="block">
                  <span className="text-label text-neutral-500 mb-2 block">Full name</span>
                  <input
                    className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white placeholder-neutral-600 outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all duration-300 text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Appleseed"
                  />
                </label>
              )}

              <label className="block">
                <span className="text-label text-neutral-500 mb-2 block">Email</span>
                <input
                  type="email"
                  className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white placeholder-neutral-600 outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all duration-300 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
              </label>

              <label className="block">
                <span className="text-label text-neutral-500 mb-2 block">Password</span>
                <input
                  type="password"
                  className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white placeholder-neutral-600 outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all duration-300 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={busy || !email || !password || (mode === "signup" && !name)}
                className={`w-full rounded-full px-6 py-3 font-medium text-sm transition-all duration-300 ${
                  busy || !email || !password || (mode === "signup" && !name)
                    ? "bg-white/[0.05] text-neutral-600 border border-white/[0.06]"
                    : "bg-white text-neutral-950 hover:bg-neutral-100"
                }`}
              >
                {mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="h-px bg-white/[0.06]" />
              <div className="absolute inset-0 -top-3 text-center">
                <span className="px-3 text-xs text-neutral-600 bg-neutral-950">or</span>
              </div>
            </div>

            <div className="space-y-3">
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
                className="w-full rounded-full px-6 py-3 border border-white/[0.08] text-neutral-300 hover:text-white hover:border-white/20 transition-all duration-300 text-sm font-medium"
              >
                Continue with Google
              </button>

              <button
                onClick={() => {
                  devSkipLogin();
                  onClose();
                }}
                className="w-full rounded-full px-6 py-3 border border-white/[0.08] text-neutral-300 hover:text-white hover:border-white/20 transition-all duration-300 text-sm font-medium"
                title="Development shortcut – bypass authentication"
              >
                Skip login (dev)
              </button>
            </div>

            <div className="text-center text-sm text-neutral-500 mt-6">
              {mode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => setMode("signup")} className="text-white hover:underline font-medium">
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => setMode("signin")} className="text-white hover:underline font-medium">
                    Sign in
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={user.photoURL || "https://api.dicebear.com/8.x/identicon/svg?seed=ReArm"}
                alt=""
                className="w-12 h-12 rounded-full border border-white/[0.08]"
              />
              <div>
                <div className="text-white font-medium">{user.displayName}</div>
                <div className="text-neutral-500 text-sm">{user.email}</div>
              </div>
            </div>

            <button
              onClick={goProfile}
              className="w-full rounded-full px-6 py-3 border border-white/[0.08] text-white hover:border-white/20 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 group"
            >
              Open Profile
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full rounded-full px-6 py-3 border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300 text-sm font-medium"
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
