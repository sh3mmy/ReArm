// src/lib/authuser.ts
// Mock auth service (drop-in now, swap for Firebase/Auth0 later)

export type AuthUser = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
};

// ---- Email Sign In (mock) ----
export async function signInWithEmail(
  email: string,
  _password: string
): Promise<AuthUser> {
  return {
    uid: "local-" + email,
    displayName: email.split("@")[0],
    email,
    photoURL: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
      email
    )}`,
  };
}

// ---- Email Sign Up (mock) ----
export async function signUpWithEmail(
  name: string,
  email: string,
  _password: string
): Promise<AuthUser> {
  return {
    uid: "local-" + email,
    displayName: name || email.split("@")[0],
    email,
    photoURL: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
      name || email
    )}`,
  };
}

// ---- Google Sign In (mock) ----
export async function signInWithGoogle(): Promise<AuthUser> {
  return {
    uid: "google-mock",
    displayName: "ReArm Pilot",
    email: "pilot@example.com",
    photoURL: "https://api.dicebear.com/8.x/shapes/svg?seed=ReArm",
  };
}

// ---- Dev Skip (no auth) ----
export function devSkipUser(): AuthUser {
  return {
    uid: "dev-skip",
    displayName: "Dev User",
    email: "dev@rearm.local",
    photoURL: "https://api.dicebear.com/8.x/identicon/svg?seed=DevUser",
  };
}
