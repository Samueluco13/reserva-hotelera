import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Evita que el dev server sirva módulos cacheados tras cambios
    // estructurales (renombrados .ts→.js, etc.).
    force: true,
  },
});