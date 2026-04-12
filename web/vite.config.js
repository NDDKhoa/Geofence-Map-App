import { defineConfig } from 'vite';

/**
 * Dev: browser calls /api/... → proxied to backend (avoids CORS).
 * Prod: set VITE_API_BASE_URL to your public API origin (backend must allow CORS for your web origin).
 */
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
