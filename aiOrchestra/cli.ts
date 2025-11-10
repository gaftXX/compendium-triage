#!/usr/bin/env ts-node

// AI Orchestra CLI - Launch Dashboard

import { Dashboard } from './dashboard';

const API_KEY = process.env.VITE_ANTHROPIC_API_KEY || '';

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                       AI ORCHESTRA DASHBOARD CLI                          ║
╚═══════════════════════════════════════════════════════════════════════════╝

Starting dashboard...
`);

if (!API_KEY) {
  console.log('⚠️  Warning: No Claude API key found in environment');
  console.log('   Set VITE_ANTHROPIC_API_KEY to enable testing features\n');
}

const dashboard = Dashboard.getInstance();

if (API_KEY) {
  dashboard.setApiKey(API_KEY);
  console.log('✓ API key loaded - testing features enabled\n');
}

dashboard.start();

// Graceful shutdown
process.on('SIGINT', () => {
  dashboard.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  dashboard.stop();
  process.exit(0);
});

