import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const MISSING_FIREBASE_WEB_ENV =
  "Firebase web env is missing. In RE-frontend, create or edit .env.local and set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and NEXT_PUBLIC_FIREBASE_APP_ID (from your Firebase project settings → Web app). Restart `npm run dev` after saving.";

function readWebConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();
  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };
}

/** Returns null if required NEXT_PUBLIC_FIREBASE_* vars are not available (no throw). */
export function tryGetFirebaseApp(): FirebaseApp | null {
  if (getApps().length) return getApps()[0]!;
  const config = readWebConfig();
  if (!config) return null;
  return initializeApp(config);
}

export function getFirebaseApp(): FirebaseApp {
  const app = tryGetFirebaseApp();
  if (!app) {
    throw new Error(MISSING_FIREBASE_WEB_ENV);
  }
  return app;
}

export function tryGetFirebaseAuth(): Auth | null {
  const app = tryGetFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseAuth(): Auth {
  const auth = tryGetFirebaseAuth();
  if (!auth) {
    throw new Error(MISSING_FIREBASE_WEB_ENV);
  }
  return auth;
}

export function tryGetFirebaseDb(): Firestore | null {
  const app = tryGetFirebaseApp();
  return app ? getFirestore(app) : null;
}

export function getFirebaseDb(): Firestore {
  const db = tryGetFirebaseDb();
  if (!db) {
    throw new Error(MISSING_FIREBASE_WEB_ENV);
  }
  return db;
}

export { MISSING_FIREBASE_WEB_ENV };
