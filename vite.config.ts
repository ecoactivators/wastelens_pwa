import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

// Check if we're in Claude Code/Bolt preview environment
const isPreviewEnvironment = process.env.CLAUDECODE === '1';

export default defineConfig({
  plugins: [
    react(),
    // Only use mkcert when not in preview environment
    ...(!isPreviewEnvironment ? [mkcert()] : []),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    // Only enable HTTPS when not in preview environment
    https: !isPreviewEnvironment,
  },
});