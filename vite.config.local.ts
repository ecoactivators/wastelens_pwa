import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
    plugins: [react(), mkcert()],
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
        https: true,
        host: '0.0.0.0',
    },
});