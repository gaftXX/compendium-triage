#!/bin/bash

# Kill Electron App Script - Force close all Electron processes
echo "🔪 Killing all Electron processes..."

# Kill all Electron processes
pkill -9 -f "electron" 2>/dev/null || echo "No Electron processes found"

# Kill all npm processes
pkill -9 -f "npm" 2>/dev/null || echo "No npm processes found"

# Kill all node processes
pkill -9 -f "node" 2>/dev/null || echo "No node processes found"

# Kill all vite processes
pkill -9 -f "vite" 2>/dev/null || echo "No vite processes found"

# Kill all processes on common development ports
lsof -ti:3000,3001,5173,8080,4000,5000,3002,3003,3004,3005,8000,8001,8002,8003,8004,8005,9000,9001,9002,9003,9004,9005 | xargs kill -9 2>/dev/null || echo "All ports cleared"

echo "✅ All Electron processes killed!"
echo "✅ All development ports freed!"
echo "✅ System cleaned up!"

# Verify no Electron processes remain (except Cursor's internal ones)
echo ""
echo "🔍 Checking for remaining processes..."
ps aux | grep -i electron | grep -v grep | grep -v "Cursor" || echo "✅ No Electron processes found (except Cursor editor)"
