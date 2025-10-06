import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    outDir: 'dist/main',
    lib: {
      entry: 'src/main.ts',
      formats: ['cjs'],
      fileName: () => '[name].js',
    },
    rollupOptions: {
    external: [
        'electron',
        ...builtinModules.flatMap((p) => [p, `node:${p}`]),
      ],
    },
    emptyOutDir: true,
  },
});

