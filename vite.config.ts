import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  
  root: path.join(__dirname, 'renderer'),
  
  // Load environment variables from project root
  envDir: path.join(__dirname),
  
  define: {
    'process.env': {}
  },
  
  build: {
    outDir: path.join(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: path.join(__dirname, 'renderer/index.html'),
        noteSystem: path.join(__dirname, 'renderer/noteSystem.html')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore'],
          claude: ['@anthropic-ai/sdk']
        }
      }
    }
  },
  
  
  server: {
    port: 3000,
    cors: true,
    hmr: {
      overlay: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    },
  },
  
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
      '@/orchestrator': path.join(__dirname, '../orchestrator'),
      '@/cross': path.join(__dirname, '../cross'),
      '@/ui': path.join(__dirname, '../ui'),
      '@/shared': path.join(__dirname, '../shared'),
    },
  },
});
