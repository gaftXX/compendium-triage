// Independent Note System Entry Point
// This file creates a standalone note system that operates completely independently
// from the main application and orchestrator

import React from 'react';
import ReactDOM from 'react-dom/client';
import { NoteSystemApp } from './components/noteSystem/NoteSystemApp';

// Independent Note System - Self-contained data ingestion
console.log('🚀 Starting Independent Note System...');
console.log('📝 System operates separately from main app and orchestrator');
console.log('🔗 Direct Firestore access - bypasses orchestrator');
console.log('🤖 Self-contained AI processing and categorization logic');
console.log('📊 Focused solely on converting text to structured data');

// Create the independent note system app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <NoteSystemApp />
  </React.StrictMode>
);

// Export for potential external usage
export { NoteSystemApp };
