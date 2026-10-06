import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Load .env from the monorepo root (3 levels up from Panels/Super Admin Panel/frontend)
  envDir: path.resolve(projectRoot, "../../.."),
  // Expose FIREBASE_* env vars (without VITE_ prefix) to the browser
  envPrefix: ["VITE_", "FIREBASE_"],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
      // Resolve @raskha/* packages directly from TypeScript source
      "@raskha/core": path.resolve(projectRoot, "../../../core/index.ts"),
      "@raskha/form-builder": path.resolve(projectRoot, "../../../modules/Form Builder/index.ts"),
      "@raskha/shared": path.resolve(projectRoot, "../../../shared/index.ts"),
    },
  },
});
