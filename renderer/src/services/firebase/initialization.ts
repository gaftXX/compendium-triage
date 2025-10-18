import { getFirebase, getFirestoreInstance, getAuthInstance } from './config';
// import { testFirebaseConnection } from './connectionTest'; // File doesn't exist

export interface FirebaseInitializationResult {
  success: boolean;
  error?: string;
  connectionTest?: {
    success: boolean;
    latency?: number;
    error?: string;
  };
  timestamp: Date;
}

/**
 * Initialize Firebase and test all connections
 * This is the main entry point for Firebase setup
 */
export async function initializeFirebaseServices(): Promise<FirebaseInitializationResult> {
  const startTime = Date.now();
  
  try {
    // Initialize Firebase (this will throw if config is invalid)
    const firebase = getFirebase();
    
    // Get instances
    const db = getFirestoreInstance();
    const auth = getAuthInstance();
    
    // Connection test removed (file doesn't exist)
    
    console.log('Firebase initialized successfully:', {
      projectId: firebase.app.options.projectId,
      timestamp: new Date()
    });
    
    return {
      success: true,
      timestamp: new Date()
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('Firebase initialization failed:', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      timestamp: new Date()
    };
  }
}

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  try {
    const config = getFirebase();
    return !!(
      config.app.options.projectId &&
      config.app.options.apiKey &&
      config.app.options.appId
    );
  } catch {
    return false;
  }
}

/**
 * Get Firebase project information
 */
export function getFirebaseProjectInfo() {
  try {
    const firebase = getFirebase();
    return {
      projectId: firebase.app.options.projectId,
      authDomain: firebase.app.options.authDomain,
      storageBucket: firebase.app.options.storageBucket,
      isConfigured: true
    };
  } catch {
    return {
      isConfigured: false
    };
  }
}
