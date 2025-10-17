// Firebase Configuration
export {
  initializeFirebase,
  getFirebase,
  getFirestoreInstance,
  getAuthInstance,
  type FirebaseInit,
  type FirebaseConfig
} from './config';

// Connection Testing
export {
  testFirebaseConnection,
  testFirebaseConnectionWithRetry,
  type ConnectionTestResult
} from './connectionTest';

// Initialization
export {
  initializeFirebaseServices,
  isFirebaseConfigured,
  getFirebaseProjectInfo,
  type FirebaseInitializationResult
} from './initialization';

// Office ID System
export * from './officeIdSystem';
export * from './officeIdService';

// Collection Schemas and Templates
export * from './schemas';
export * from './documentTemplates';
export * from './collectionInitializer';

// Firestore Operations and Data Services
export * from './firestoreOperations';
export * from './queryBuilders';
export * from './dataService';

// Database Indexes and Security Rules
export * from './databaseIndexes';
export * from './securityRules';
export * from './deploymentService';

// Seed Data and Initial Population
export * from './seedDataService';
export * from './seedDataDemo';
