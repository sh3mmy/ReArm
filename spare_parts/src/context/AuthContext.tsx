// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

type AuthContextValue = {
  user: User | null;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (name: string, email: string, password: string) => Promise<void>;
  signInMockGoogle: () => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'rearm_user';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // load existing session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [user]);

  // MOCK email login/signup (replace with real API/Firebase later)
  const signInEmail = async (email: string, _password: string) => {
    setUser({
      id: 'local-' + email,
      name: email.split('@')[0],
      email,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(email)}`
    });
  };
  const signUpEmail = async (name: string, email: string, _password: string) => {
    setUser({
      id: 'local-' + email,
      name: name || email.split('@')[0],
      email,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name || email)}`
    });
  };
  const signInMockGoogle = async () => {
    setUser({
      id: 'google-mock',
      name: 'ReArm Pilot',
      email: 'pilot@example.com',
      avatarUrl: 'https://api.dicebear.com/8.x/shapes/svg?seed=ReArm'
    });
  };
  const signOut = () => setUser(null);

  const value = useMemo(() => ({ user, signInEmail, signUpEmail, signInMockGoogle, signOut }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
