import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

export interface FirebaseInit {
  app: FirebaseApp;
  db: Firestore;
}

function getFirebaseConfig(): Record<string, string | undefined> {
  try {
    // @ts-ignore - import.meta.env exists in Vite renderer builds
    const env = (import.meta as any).env || {};
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    };
  } catch (_) {
    return {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
    } as any;
  }
}

export function initializeFirebase(): FirebaseInit {
  const cfg = getFirebaseConfig();
  if (!cfg.apiKey || !cfg.projectId || !cfg.appId) {
    throw new Error('Missing Firebase configuration. Set VITE_FIREBASE_* env variables.');
  }

  const app = initializeApp(cfg as any);
  const db = getFirestore(app);
  return { app, db };
}


