import { getFirestoreInstance } from './config';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export interface ConnectionTestResult {
  success: boolean;
  error?: string;
  latency?: number;
  timestamp: Date;
}

/**
 * Test Firebase connection by performing a simple read/write operation
 */
export async function testFirebaseConnection(): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  
  try {
    const db = getFirestoreInstance();
    const testDocRef = doc(db, 'connectionTest', 'test');
    
    // Write test data
    const testData = {
      message: 'Connection test',
      timestamp: new Date(),
      random: Math.random()
    };
    
    await setDoc(testDocRef, testData);
    
    // Read test data
    const docSnap = await getDoc(testDocRef);
    
    if (!docSnap.exists()) {
      throw new Error('Test document was not created');
    }
    
    // Clean up test document
    await deleteDoc(testDocRef);
    
    const latency = Date.now() - startTime;
    
    return {
      success: true,
      latency,
      timestamp: new Date()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };
  }
}

/**
 * Test Firebase connection with retry logic
 */
export async function testFirebaseConnectionWithRetry(
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<ConnectionTestResult> {
  let lastError: string | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await testFirebaseConnection();
    
    if (result.success) {
      return result;
    }
    
    lastError = result.error;
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return {
    success: false,
    error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`,
    timestamp: new Date()
  };
}
