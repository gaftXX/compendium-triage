module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/renderer/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/renderer/src/$1',
    '^@/orchestrator/(.*)$': '<rootDir>/orchestrator/$1',
    '^@/cross/(.*)$': '<rootDir>/cross/$1',
    '^@/ui/(.*)$': '<rootDir>/ui/$1',
    '^@/shared/(.*)$': '<rootDir>/shared/$1'
  },
  testMatch: [
    '<rootDir>/renderer/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/renderer/src/**/*.{test,spec}.{ts,tsx}'
  ],
  collectCoverageFrom: [
    'renderer/src/**/*.{ts,tsx}',
    '!renderer/src/**/*.d.ts',
    '!renderer/src/**/index.ts',
    '!renderer/src/main.tsx',
    '!renderer/src/noteSystemMain.tsx'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ]
};
