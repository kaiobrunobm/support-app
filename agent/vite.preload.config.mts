import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    outDir: 'dist/preload',
    lib: {
      entry: 'src/preload.ts',
      formats: ['cjs'],
      fileName: () => '[name].js',
    },
    rollupOptions: {
      external: ['electron'],
    },
    emptyOutDir: true,
  },
});
