import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, type Auth, connectAuthEmulator } from 'firebase/auth';

export interface FirebaseInit {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

function getFirebaseConfig(): FirebaseConfig {
  try {
    // @ts-ignore - import.meta.env exists in Vite renderer builds
    const env = (import.meta as any).env || {};
    return {
      apiKey: env.VITE_FIREBASE_API_KEY || '',
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || '',
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
    };
  } catch (_) {
    return {
      apiKey: process.env.VITE_FIREBASE_API_KEY || '',
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.VITE_FIREBASE_APP_ID || '',
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
  }
}

function validateFirebaseConfig(config: FirebaseConfig): void {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = required.filter(key => !config[key as keyof FirebaseConfig]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase configuration: ${missing.join(', ')}. ` +
      'Set VITE_FIREBASE_* environment variables.'
    );
  }
}

export function initializeFirebase(): FirebaseInit {
  const config = getFirebaseConfig();
  validateFirebaseConfig(config);

  // Initialize Firebase app
  const app = initializeApp(config);
  
  // Initialize Firestore
  const db = getFirestore(app);
  
  // Initialize Auth
  const auth = getAuth(app);

  // Connect to emulators in development
  if (process.env.NODE_ENV === 'development' && process.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    try {
      // Only connect if not already connected
      if (!(db as any)._delegate._databaseId.projectId.includes('demo-')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('Connected to Firebase emulators');
      }
    } catch (error) {
      console.warn('Failed to connect to Firebase emulators:', error);
    }
  }

  return { app, db, auth };
}

// Global Firebase instance
let firebaseInstance: FirebaseInit | null = null;

export function getFirebase(): FirebaseInit {
  if (!firebaseInstance) {
    firebaseInstance = initializeFirebase();
  }
  return firebaseInstance;
}

export function getFirestoreInstance(): Firestore {
  return getFirebase().db;
}

export function getAuthInstance(): Auth {
  return getFirebase().auth;
}