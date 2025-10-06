import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  // Use relative paths for all assets.
  base: './',
  plugins: [react()],
  build: {
    // This is where the React app will be built.
    outDir: 'dist/renderer',
    rollupOptions: {
      // The entry point is the main HTML file.
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
    emptyOutDir: true,
  },
  // Configuration for the development server.
  server: {
    port: 5173,
  },
});
