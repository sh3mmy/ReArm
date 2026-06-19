// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthUser } from "../lib/authuser";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  devSkipUser,
} from "../lib/authuser";

type AuthContextValue = {
  user: AuthUser | null;
  // actions
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (name: string, email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  devSkipLogin: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "rearm_auth_user";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Rehydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage whenever user changes
  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [user]);

  // --- Actions (wrap your mock service) ---
  const signInEmail = async (email: string, password: string) => {
    const u = await signInWithEmail(email, password);
    setUser(u);
  };

  const signUpEmail = async (name: string, email: string, password: string) => {
    const u = await signUpWithEmail(name, email, password);
    setUser(u);
  };

  const signInGoogle = async () => {
    const u = await signInWithGoogle();
    setUser(u);
  };

  const devSkipLogin = () => {
    const u = devSkipUser();
    setUser(u);
  };

  const signOut = () => setUser(null);

  const value = useMemo(
    () => ({
      user,
      signInEmail,
      signUpEmail,
      signInGoogle,
      devSkipLogin,
      signOut,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
