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
  // Never prebundle Node-only Admin SDK into the browser (causes `process is not defined`).
  optimizeDeps: {
    exclude: ["firebase-admin", "@raskha/attendance"],
  },
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
      // Client-safe entry only (no firebase-admin / Node APIs in the browser)
      "@raskha/payroll": path.resolve(
        projectRoot,
        "../../../modules/Payroll/client.ts"
      ),
      "@raskha/inventory-management": path.resolve(
        projectRoot,
        "../../../modules/Inventory Management/index.ts"
      ),
      "@raskha/site-management": path.resolve(
        projectRoot,
        "../../../modules/Site Management/index.ts"
      ),
      "@raskha/scheduling": path.resolve(
        projectRoot,
        "../../../modules/Scheduling/index.ts"
      ),
      "@raskha/shared": path.resolve(projectRoot, "../../../shared/index.ts"),
      "@raskha/web-ops": path.resolve(
        projectRoot,
        "../../../modules/Web Ops/index.ts"
      ),
      "@raskha/branch-management": path.resolve(
        projectRoot,
        "../../../modules/Branch Management/index.ts"
      ),
      "@raskha/branch-stock": path.resolve(
        projectRoot,
        "../../../modules/Branch Stock/index.ts"
      ),
    },
  },
});
