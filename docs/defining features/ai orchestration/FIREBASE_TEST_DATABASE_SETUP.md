# Firebase Test Database Setup

This document explains how to set up a separate test database in Firebase for the AI Orchestra Gen 2 testing system.

## Purpose

The test database ensures that:
- AI ability tests never affect production data
- Tests can be run safely without risk
- Test data is completely isolated
- Cleanup is automatic and thorough

## Database Structure

```
Firebase Project: compendium-triage
├── compendium-production (default database)
│   ├── offices (your real data)
│   ├── projects (your real data)
│   ├── regulations (your real data)
│   └── meditations (your real data)
│
└── compendium-test (test database)
    ├── offices (test data only)
    ├── projects (test data only)
    ├── regulations (test data only)
    └── meditations (test data only)
```

## Setup Instructions

### Step 1: Create Test Database

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `compendium-triage`
3. Navigate to **Firestore Database**
4. Click on the dropdown next to your database name
5. Click **Create database**
6. Database ID: `compendium-test`
7. Location: **Same as production** (for consistency)
8. Start in **Production mode** (we'll set rules next)
9. Click **Create**

### Step 2: Configure Security Rules

Set up security rules for the test database to allow test operations:

1. In Firestore Database, select `compendium-test` database
2. Go to **Rules** tab
3. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Test database rules - allow all operations for testing
    // WARNING: Only use this for test database, NEVER production!
    
    match /{document=**} {
      // Allow read/write for authenticated users (your test environment)
      allow read, write: if request.auth != null;
      
      // Or if running tests locally without auth, allow all
      // (comment out the line above and uncomment below)
      // allow read, write: if true;
    }
  }
}
```

4. Click **Publish**

### Step 3: Create Test Collections

The test system will automatically create collections as needed, but you can pre-create them:

1. In `compendium-test` database, click **Start collection**
2. Create these collections:
   - `offices`
   - `projects`
   - `regulations`
   - `meditations`
   - `workforce`
   - `relationships`

3. Add a dummy document to each (it will be deleted during tests):
   - Document ID: `init`
   - Field: `initialized` (boolean) = `true`

### Step 4: Configure App to Use Test Database

The app automatically switches to the test database when running tests. Configuration is in:

`renderer/src/services/firebase/config.ts` (or wherever Firebase is initialized)

Add environment variable support:

```typescript
const db = import.meta.env.VITE_FIRESTORE_DATABASE === 'test' 
  ? getFirestore(app, 'compendium-test')
  : getFirestore(app); // defaults to compendium-production
```

### Step 5: Environment Configuration

Add to your `.env` file:

```bash
# Default (production)
VITE_FIRESTORE_DATABASE=production

# For testing (set programmatically by test system)
# VITE_FIRESTORE_DATABASE=test
```

The test system will automatically set `VITE_FIRESTORE_DATABASE=test` before running tests.

## Verification

Verify your setup:

1. Check that both databases exist:
   - `compendium-production` (default)
   - `compendium-test` (new)

2. Verify `compendium-test` has collections:
   - offices
   - projects
   - regulations
   - meditations

3. Check security rules are set for `compendium-test`

4. Confirm your app can connect to both databases

## Test Database Usage

### Automatic Switching

The test system automatically:
- Switches to `compendium-test` before tests
- Creates test data
- Runs AI ability tests
- Cleans up all test data
- Switches back to `compendium-production`

### Manual Switching (for debugging)

To manually use the test database:

```typescript
import { switchToTestDatabase, switchToProductionDatabase } from './services/firebase/config';

// Switch to test
await switchToTestDatabase();

// Do operations...

// Switch back
await switchToProductionDatabase();
```

## Safety Features

### Hard-Coded Protections

```typescript
// Test system enforces database isolation
if (isTestMode && currentDatabase !== 'compendium-test') {
  throw new Error('SAFETY: Test mode must use test database');
}

if (!isTestMode && currentDatabase === 'compendium-test') {
  throw new Error('SAFETY: Production mode cannot use test database');
}
```

### Production Database Protection

```typescript
// Prevent accidental writes to production during tests
if (process.env.VITE_FIRESTORE_DATABASE === 'test' && database === 'production') {
  throw new Error('SAFETY: Tests cannot write to production database');
}
```

## Cleanup

### Automatic Cleanup

Tests automatically clean up:
- Before each test run (clears existing test data)
- After each test scenario
- After full test run completion

### Manual Cleanup

If needed, manually clean the test database:

```bash
# Run cleanup script
npm run cleanup:test-db
```

Or in Firebase Console:
1. Go to `compendium-test` database
2. Delete all collections
3. Collections will be recreated as needed

## Monitoring

### Test Database Size

Monitor test database size to ensure cleanup is working:

1. Firebase Console > Firestore Database
2. Select `compendium-test`
3. Check **Usage** tab
4. Size should be near 0 when no tests running

### Test Data Persistence

Check for leftover test data:

```bash
npm run check:test-db
```

Expected output:
```
compendium-test database status:
- offices: 0 documents
- projects: 0 documents
- regulations: 0 documents
- meditations: 0 documents

Status: CLEAN ✓
```

## Troubleshooting

### Issue: Cannot create test database

**Solution:**
- Ensure you have Owner/Editor role in Firebase project
- Check Firebase plan (Blaze plan required for multiple databases)
- Verify region/location is correct

### Issue: Tests fail with "Permission denied"

**Solution:**
- Check security rules for `compendium-test`
- Verify authentication is working
- Try allowing all operations temporarily (for testing only)

### Issue: Test data not cleaning up

**Solution:**
- Check test environment teardown is running
- Manually delete collections in Firebase Console
- Verify cleanup code is being called

### Issue: Production data affected

**Solution:**
- IMMEDIATE: Check which database was accessed
- Verify environment variable is set correctly
- Review safety checks in code
- Restore from backup if needed

## Best Practices

1. **Never modify production database during tests**
2. **Always verify test database is selected before tests**
3. **Run cleanup after failed test runs**
4. **Monitor test database size regularly**
5. **Use separate Firebase service account for tests** (recommended)
6. **Keep test database security rules strict** (auth required)
7. **Document any manual test database operations**
8. **Review test logs for database access patterns**

## Summary

```
Production Database: compendium-production
  - Real data
  - Protected
  - Never touched by tests

Test Database: compendium-test
  - Test data only
  - Isolated
  - Automatically cleaned
  - Safe for testing
```

Your production data is completely safe!

