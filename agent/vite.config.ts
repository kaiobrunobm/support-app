import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
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
      "@radix-ui/react-*",
      "sonner",
      "react-router"
    ],
  },
  ssr: {
    noExternal: [
      "framer-motion",
      "@radix-ui/react-*",
      "sonner",
      "react-router"
    ],
  },
});
