import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "Panels/*/backend/src/**/*.test.ts",
      "Panels/Guard Panel/guard app backend/src/**/*.test.ts",
      "core/**/*.test.ts",
      "modules/**/*.test.ts",
      "scripts/**/*.test.ts",
    ],
    environment: "node",
    globals: false,
    clearMocks: true,
    restoreMocks: true,
  },
});
