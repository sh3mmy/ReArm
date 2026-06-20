import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AuthUser = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (name: string, email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  devSkipLogin: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "rearm_auth_user";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [user]);

  const signInEmail = async (email: string, _password: string) => {
    const u: AuthUser = {
      uid: "local-" + email,
      displayName: email.split("@")[0],
      email,
      photoURL: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(email)}`,
    };
    setUser(u);
  };

  const signUpEmail = async (name: string, email: string, _password: string) => {
    const u: AuthUser = {
      uid: "local-" + email,
      displayName: name || email.split("@")[0],
      email,
      photoURL: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
    };
    setUser(u);
  };

  const signInGoogle = async () => {
    const u: AuthUser = {
      uid: "google-mock",
      displayName: "ReArm Pilot",
      email: "pilot@example.com",
      photoURL: "https://api.dicebear.com/8.x/shapes/svg?seed=ReArm",
    };
    setUser(u);
  };

  const devSkipLogin = () => {
    const u: AuthUser = {
      uid: "dev-skip",
      displayName: "Dev User",
      email: "dev@rearm.local",
      photoURL: "https://api.dicebear.com/8.x/identicon/svg?seed=DevUser",
    };
    setUser(u);
  };

  const signOut = () => setUser(null);

  const value = useMemo(() => ({ user, signInEmail, signUpEmail, signInGoogle, devSkipLogin, signOut }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
