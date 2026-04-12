import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Dev: /api → backend (CORS-free). Prod: set VITE_API_BASE to API origin; backend CORS must allow admin origin.
 *
 * Project path contains "#" (e.g. DoAnC#): use base "/" in dev so Vite resolves /src/* correctly.
 * Keep base "./" for build so dist opens from subpaths / static hosts without rewrite.
 */
export default defineConfig(({ command }) => ({
  root: __dirname,
  plugins: [react()],
  base: command === 'serve' ? '/' : './',
  server: {
    port: 5174,
    fs: {
      allow: [__dirname],
    },
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}));
