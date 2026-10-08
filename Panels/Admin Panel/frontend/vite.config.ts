import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Load .env from the monorepo root (3 levels up from Panels/Admin Panel/frontend)
  envDir: path.resolve(projectRoot, "../../.."),
  // Expose FIREBASE_* env vars (without VITE_ prefix) to the browser
  envPrefix: ["VITE_", "FIREBASE_"],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
      // Resolve @raskha/core directly from TypeScript source
      "@raskha/core": path.resolve(projectRoot, "../../../core/index.ts"),
      // Resolve @raskha/guard-management from TypeScript source
      "@raskha/guard-management": path.resolve(projectRoot, "../../../modules/Guard Management/index.ts"),
      // Resolve @raskha/hr-management from TypeScript source
      "@raskha/hr-management": path.resolve(projectRoot, "../../../modules/HR Management/index.ts"),
      // Resolve @raskha/site-management from TypeScript source
      "@raskha/site-management": path.resolve(projectRoot, "../../../modules/Site Management/index.ts"),
      // Resolve @raskha/form-builder from TypeScript source
      "@raskha/form-builder": path.resolve(projectRoot, "../../../modules/Form Builder/index.ts"),
      // Resolve @raskha/inventory-management from TypeScript source
      "@raskha/inventory-management": path.resolve(projectRoot, "../../../modules/Inventory Management/index.ts"),
      // Resolve @raskha/scheduling from TypeScript source
      "@raskha/scheduling": path.resolve(projectRoot, "../../../modules/Scheduling/index.ts"),
      // Resolve @raskha/client-management from TypeScript source
      "@raskha/client-management": path.resolve(projectRoot, "../../../modules/Client Management/index.ts"),
      "@raskha/shared": path.resolve(projectRoot, "../../../shared/index.ts"),
    },
  },
});
