import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  return {
    root: resolve(__dirname),
    plugins: [react()],
    base: mode === "production" ? "./" : "/",
    server: {
      port: 5173,
      strictPort: true
    },
    build: {
      outDir: resolve(process.cwd(), "dist/renderer"),
      emptyOutDir: true
    }
  };
});


