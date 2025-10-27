#!/bin/bash

# Development startup script for Compendium Triage
echo "🚀 Starting Compendium Triage Development Environment..."

# Kill any existing processes
echo "🔄 Cleaning up existing processes..."
pkill -f electron 2>/dev/null || true
pkill -f vite 2>/dev/null || true

# Build main process
echo "🔨 Building main process..."
npm run build:main

# Start development servers
echo "🎯 Starting development servers..."
npm run dev
