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
    // Try to access Vite environment variables (browser/renderer context)
    let env: any = {};
    try {
      // @ts-ignore - import.meta.env exists in Vite renderer builds
      env = (import.meta as any).env || {};
    } catch {
      // Not in a Vite context (e.g., Node.js CLI), use process.env fallback
      env = process.env;
    }
    console.log('Debugging Firebase config loading...');
    console.log('Environment available:', !!env);
    console.log('Full environment object:', env);
    console.log('Environment variables found:', {
      apiKey: env.VITE_FIREBASE_API_KEY ? 'Found' : 'Missing',
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ? 'Found' : 'Missing',
      projectId: env.VITE_FIREBASE_PROJECT_ID ? 'Found' : 'Missing',
      appId: env.VITE_FIREBASE_APP_ID ? 'Found' : 'Missing'
    });
    
    // Get values from environment variables
    const config = {
      apiKey: env.VITE_FIREBASE_API_KEY || '',
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || '',
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
    };
    
    console.log('Using Firebase config:', {
      apiKey: config.apiKey ? `Found (${config.apiKey.substring(0, 10)}...)` : 'Missing',
      authDomain: config.authDomain || 'Missing',
      projectId: config.projectId || 'Missing',
      appId: config.appId || 'Missing'
    });
    
    return config;
  } catch (error) {
    console.error('Failed to load Firebase config:', error);
    console.error('Make sure environment variables are properly set in .env file');
    return {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      measurementId: undefined,
    };
  }
}

function validateFirebaseConfig(config: FirebaseConfig): boolean {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = required.filter(key => !config[key as keyof FirebaseConfig]);
  
  console.log('Validating Firebase config:', {
    apiKey: config.apiKey ? `Found (${config.apiKey.substring(0, 10)}...)` : 'Missing',
    authDomain: config.authDomain || 'Missing',
    projectId: config.projectId || 'Missing',
    appId: config.appId || 'Missing',
    storageBucket: config.storageBucket || 'Missing',
    messagingSenderId: config.messagingSenderId || 'Missing'
  });
  
  if (missing.length > 0) {
    console.warn(
      `Missing Firebase configuration: ${missing.join(', ')}. ` +
      'Set VITE_FIREBASE_* environment variables. App will use mock data.'
    );
    return false;
  }
  
  console.log('Firebase configuration is valid');
  return true;
}

export function initializeFirebase(): FirebaseInit | null {
  console.log('Initializing Firebase...');
  const config = getFirebaseConfig();
  const isValid = validateFirebaseConfig(config);
  
  if (!isValid) {
    console.log('Firebase initialization failed - invalid config');
    return null;
  }

  // Initialize Firebase app
  const app = initializeApp(config);
  
  // Initialize Firestore
  const db = getFirestore(app);
  
  // Initialize Auth
  const auth = getAuth(app);

  // Connect to emulators in development
  try {
    // Check if we should use emulators (works in both Vite and Node.js contexts)
    let useEmulator = false;
    let isDevelopment = false;
    try {
      // @ts-ignore
      isDevelopment = (import.meta as any).env?.MODE === 'development';
      // @ts-ignore
      useEmulator = (import.meta as any).env?.VITE_USE_FIREBASE_EMULATOR === 'true';
    } catch {
      isDevelopment = process.env.NODE_ENV === 'development';
      useEmulator = process.env.VITE_USE_FIREBASE_EMULATOR === 'true';
    }
    
    if (isDevelopment && useEmulator) {
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
  } catch (error) {
    console.warn('Error checking emulator configuration:', error);
  }

  console.log('Firebase initialization successful');
  return { app, db, auth };
}

// Global Firebase instance
let firebaseInstance: FirebaseInit | null = null;

export function getFirebase(): FirebaseInit | null {
  if (!firebaseInstance) {
    firebaseInstance = initializeFirebase();
  }
  return firebaseInstance;
}

export function getFirestoreInstance(): Firestore {
  const firebase = getFirebase();
  if (!firebase) {
    throw new Error('Firebase not initialized');
  }
  return firebase.db;
}

export function getAuthInstance(): Auth {
  const firebase = getFirebase();
  if (!firebase) {
    throw new Error('Firebase not initialized');
  }
  return firebase.auth;
}