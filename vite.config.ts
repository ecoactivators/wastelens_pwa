import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

// Check if we're in Bolt preview environment
const isBoltPreview = process.env.BOLT_PREVIEW === 'true';

export default defineConfig({
  plugins: [
    react(),
    // Only use mkcert when not in Bolt preview
    ...(!isBoltPreview ? [mkcert()] : []),
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
    // Only enable HTTPS when not in Bolt preview
    https: !isBoltPreview,
  },
});