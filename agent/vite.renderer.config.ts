import { defineConfig, type UserConfig } from "vite";

export default defineConfig(async (): Promise<UserConfig> => {
  const react = (await import("@vitejs/plugin-react")).default;

  const config: UserConfig = {
    plugins: [
      react(),
      {
        name: "strip-use-client",
        enforce: "pre",
        transform(code, id) {
          if (id.includes("node_modules")) {
            return code.replace(/["']use client["'];?/g, "");
          }
        },
      },
    ],
    optimizeDeps: {
      include: [
        "framer-motion",
        "sonner",
        "react-router",
        "@radix-ui/react-accordion",
        "@radix-ui/react-dialog",
        "@radix-ui/react-toast",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-dropdown-menu",
      ],
    },
    ssr: {
      noExternal: [
        "framer-motion",
        "sonner",
        "react-router",
        /^@radix-ui\/.*/,
      ],
    },
  };

  return config;
});
