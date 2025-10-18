// Jest setup file for testing environment
import '@testing-library/jest-dom';

// Mock Electron APIs for testing
Object.defineProperty(window, 'electronAPI', {
  value: {
    window: {
      maximize: jest.fn(),
      restore: jest.fn(),
      minimize: jest.fn(),
      close: jest.fn()
    }
  },
  writable: true
});

// Mock Firebase for testing
jest.mock('./services/firebase', () => ({
  initializeFirebase: jest.fn(() => Promise.resolve()),
  FirestoreService: {
    getInstance: jest.fn(() => ({
      isFirebaseAvailable: jest.fn(() => true),
      createOffice: jest.fn(() => Promise.resolve({ success: true, data: {} })),
      createProject: jest.fn(() => Promise.resolve({ success: true, data: {} })),
      createRegulation: jest.fn(() => Promise.resolve({ success: true, data: {} }))
    }))
  }
}));

// Mock Claude AI service for testing
jest.mock('./services/noteProcessing/claudeAIService', () => ({
  ClaudeAIService: {
    getInstance: jest.fn(() => ({
      analyzeText: jest.fn(() => Promise.resolve({
        categorization: {
          category: 'office',
          confidence: 0.9,
          reasoning: 'Test reasoning'
        },
        extraction: {
          extractedData: { name: 'Test Office' },
          confidence: 0.9,
          missingFields: [],
          reasoning: 'Test extraction'
        },
        overallConfidence: 0.9
      }))
    }))
  }
}));

// Suppress console warnings in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});
