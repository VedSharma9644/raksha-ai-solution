import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import * as esbuild from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveMonorepoRoot() {
  if (process.env.MONOREPO_ROOT) {
    return path.resolve(process.env.MONOREPO_ROOT);
  }

  // Local: Panels/<Panel>/backend/scripts -> repo root (4 levels up)
  let candidate = path.resolve(__dirname, "../../../..");
  if (existsSync(path.join(candidate, "core"))) {
    return candidate;
  }

  // Docker flat layout: /app/backend/scripts -> /app
  candidate = path.resolve(__dirname, "../..");
  if (existsSync(path.join(candidate, "core"))) {
    return candidate;
  }

  throw new Error("Unable to locate monorepo root (expected a core/ folder)");
}

const monorepoRoot = resolveMonorepoRoot();

await esbuild.build({
  entryPoints: [path.join(__dirname, "../src/index.ts")],
  outfile: path.join(__dirname, "../dist/server.js"),
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  sourcemap: true,
  logLevel: "info",
  alias: {
    "@raskha/core": path.join(monorepoRoot, "core/index.ts"),
    "@raskha/shared": path.join(monorepoRoot, "shared/index.js"),
    "@raskha/guard-management": path.join(
      monorepoRoot,
      "modules/Guard Management/index.ts"
    ),
    "@raskha/hr-management": path.join(
      monorepoRoot,
      "modules/HR Management/index.ts"
    ),
    "@raskha/attendance": path.join(monorepoRoot, "modules/Attendance/index.ts"),
    "@raskha/inventory-management": path.join(
      monorepoRoot,
      "modules/Inventory Management/index.ts"
    ),
    "@raskha/leave": path.join(monorepoRoot, "modules/Leave Management/index.ts"),
    "@raskha/relief": path.join(
      monorepoRoot,
      "modules/Relief Management/index.ts"
    ),
    "@raskha/notifications": path.join(
      monorepoRoot,
      "modules/Notifications/index.ts"
    ),
    "@raskha/site-management": path.join(
      monorepoRoot,
      "modules/Site Management/index.ts"
    ),
  },
  packages: "external",
  banner: {
    js: "// Raskha panel backend bundle (workspace packages inlined)",
  },
});
