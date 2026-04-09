"use client";

import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import * as React from "react";
import { tryGetFirebaseApp } from "./client";

export type AuthState = {
  loading: boolean;
  user: User | null;
  /** Non-null when web Firebase env vars are missing from the client bundle */
  configurationError: string | null;
};

const AuthContext = React.createContext<AuthState>({
  loading: true,
  user: null,
  configurationError: null,
});

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    loading: true,
    user: null,
    configurationError: null,
  });

  React.useEffect(() => {
    const app = tryGetFirebaseApp();
    if (!app) {
      setState({
        loading: false,
        user: null,
        configurationError:
          "Missing Firebase web configuration. Set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and NEXT_PUBLIC_FIREBASE_APP_ID in RE-frontend/.env.local, then restart the dev server.",
      });
      return;
    }

    const auth = getAuth(app);
    return onAuthStateChanged(auth, (user) =>
      setState({ loading: false, user, configurationError: null }),
    );
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
