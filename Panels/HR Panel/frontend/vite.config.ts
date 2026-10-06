import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Read .env from the monorepo root (three levels up from Panels/HR Panel/frontend)
  envDir: path.resolve(projectRoot, "../../.."),
  // Expose FIREBASE_* vars to the browser without requiring the VITE_ prefix
  envPrefix: ["VITE_", "FIREBASE_"],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
      "@raskha/core": path.resolve(projectRoot, "../../../core/index.ts"),
      "@raskha/hr-management": path.resolve(
        projectRoot,
        "../../../modules/HR Management/index.ts"
      ),
      "@raskha/guard-management": path.resolve(
        projectRoot,
        "../../../modules/Guard Management/index.ts"
      ),
      "@raskha/form-builder": path.resolve(
        projectRoot,
        "../../../modules/Form Builder/index.ts"
      ),
      "@raskha/shared": path.resolve(projectRoot, "../../../shared/index.ts"),
    },
  },
});
