#!/bin/bash

# Force kill all Electron processes and free ports
echo "FORCE KILLING ALL ELECTRON PROCESSES..."

# Kill everything aggressively
pkill -9 -f "electron" 2>/dev/null
pkill -9 -f "npm" 2>/dev/null  
pkill -9 -f "node" 2>/dev/null
pkill -9 -f "vite" 2>/dev/null

# Kill all development ports
lsof -ti:3000,3001,5173,8080,4000,5000,3002,3003,3004,3005,8000,8001,8002,8003,8004,8005,9000,9001,9002,9003,9004,9005 | xargs kill -9 2>/dev/null

echo "FORCE KILLED ALL PROCESSES!"
echo "ALL PORTS FREED!"
echo "ELECTRON APP SHOULD BE DEAD!"

# Show remaining processes
echo ""
echo "Remaining processes:"
ps aux | grep -E "(electron|npm|node|vite)" | grep -v grep | grep -v "Cursor" || echo "NO PROCESSES FOUND!"
