import { defineConfig } from 'vite';

export default defineConfig(async () => {

  const { viteStaticCopy } = await import('vite-plugin-static-copy');

  return {
    define: {
      'process.env.API_URL': JSON.stringify(process.env.VITE_API_URL)
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: 'public/*',
            dest: 'public'
          }
        ]
      }),
    ]
  };
});
