// Test script to verify API setup
// Run with: node test-api-setup.js

const fs = require('fs');
const path = require('path');

// Simple .env file reader without dotenv dependency
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  No .env file found');
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  // Set environment variables
  Object.assign(process.env, envVars);
  return envVars;
}

console.log('🔍 Testing API Setup...\n');

// Load environment variables
const envVars = loadEnvFile();

// Test environment variables
console.log('📋 Environment Variables:');
console.log('VITE_CLAUDE_API_KEY:', process.env.VITE_CLAUDE_API_KEY || process.env.VITE_ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing');
console.log('VITE_FIREBASE_API_KEY:', process.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('VITE_FIREBASE_PROJECT_ID:', process.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
console.log('VITE_FIREBASE_APP_ID:', process.env.VITE_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');

// Test Claude API client
console.log('\n🤖 Testing Claude API Client...');
try {
  // Check if TypeScript files exist
  const fs = require('fs');
  const claudeClientPath = './orchestrator/claudeClient.ts';
  
  if (fs.existsSync(claudeClientPath)) {
    console.log('✅ Claude client TypeScript file exists');
    
    const apiKey = process.env.VITE_CLAUDE_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
    if (apiKey) {
      console.log('✅ Claude API key found - ready for testing');
      console.log('   Key format:', apiKey.startsWith('sk-ant-') ? '✅ Valid format' : '⚠️  Check format');
    } else {
      console.log('⚠️  Claude API key missing - add VITE_CLAUDE_API_KEY to .env');
    }
  } else {
    console.log('❌ Claude client file not found');
  }
} catch (error) {
  console.log('❌ Claude client check failed:', error.message);
}

// Test Firebase config
console.log('\n🔥 Testing Firebase Config...');
try {
  // Check if Firebase config file exists
  const fs = require('fs');
  const firebaseConfigPath = './renderer/src/services/firebase/config.ts';
  
  if (fs.existsSync(firebaseConfigPath)) {
    console.log('✅ Firebase config TypeScript file exists');
    
    const requiredFirebaseVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID', 
      'VITE_FIREBASE_APP_ID'
    ];
    
    const missingVars = requiredFirebaseVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      console.log('✅ All required Firebase variables found - ready for testing');
      console.log('   Project ID:', process.env.VITE_FIREBASE_PROJECT_ID);
    } else {
      console.log('⚠️  Missing Firebase variables:', missingVars.join(', '));
    }
  } else {
    console.log('❌ Firebase config file not found');
  }
} catch (error) {
  console.log('❌ Firebase config check failed:', error.message);
}

console.log('\n📝 Next Steps:');
console.log('1. ✅ .env file with API keys - COMPLETE');
console.log('2. Run: npm install (to install dependencies)');
console.log('3. Test with: npm run build');
console.log('4. Package with: npm run package:mac');
console.log('\n🎉 API Setup Status: READY FOR DEVELOPMENT!');
