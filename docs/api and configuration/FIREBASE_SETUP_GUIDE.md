# Firebase Setup Guide

## Environment Variables Required

Create a `.env` file in the project root with the following variables:

```bash
# Firebase Configuration
# Get these values from your Firebase project settings
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Development Settings
VITE_USE_FIREBASE_EMULATOR=false
NODE_ENV=development

# Claude API Configuration
VITE_CLAUDE_API_KEY=your_claude_api_key_here
```

## Firebase Project Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "Compendium Triage" (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll configure security rules later)
4. Select a location (choose closest to your users)

### 3. Get Configuration Values
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app (</> icon)
4. Register app with name "Compendium Triage"
5. Copy the configuration object values to your `.env` file

### 4. Configure Authentication (Optional for Phase 2)
1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Anonymous" authentication (for development)
5. Later phases will add proper authentication

## Testing Connection

The app includes a connection test utility that will:
1. Write a test document to Firestore
2. Read it back
3. Delete the test document
4. Report success/failure and latency

## Development vs Production

### Development Mode
- Uses Firebase emulators if `VITE_USE_FIREBASE_EMULATOR=true`
- More verbose logging
- Relaxed security rules

### Production Mode
- Connects to live Firebase project
- Strict security rules
- Optimized for performance

## Security Rules (Phase 6)

Initial security rules will be:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **"Missing Firebase configuration"**
   - Check that all VITE_FIREBASE_* variables are set in .env
   - Restart development server after adding .env

2. **"Permission denied"**
   - Check Firestore security rules
   - Ensure authentication is working

3. **"Network error"**
   - Check internet connection
   - Verify Firebase project is active
   - Check if using emulators correctly

### Connection Test

Use the built-in connection test:
```typescript
import { testFirebaseConnection } from './services/firebase/connectionTest';

const result = await testFirebaseConnection();
console.log('Connection test:', result);
```
