import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  root: path.join(__dirname, 'renderer'),
  
  build: {
    outDir: path.join(__dirname, 'dist/renderer'),
    emptyOutDir: true,
  },
  
  
  server: {
    port: 3000,
  },
  
  resolve: {
    alias: {
      '@': path.join(__dirname, 'renderer/src'),
      '@/orchestrator': path.join(__dirname, '../orchestrator'),
      '@/cross': path.join(__dirname, '../cross'),
      '@/ui': path.join(__dirname, '../ui'),
      '@/shared': path.join(__dirname, '../shared'),
    },
  },
});
