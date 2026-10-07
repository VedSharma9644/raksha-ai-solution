import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import * as esbuild from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveMonorepoRoot() {
  if (process.env.MONOREPO_ROOT) {
    return path.resolve(process.env.MONOREPO_ROOT);
  }

  // Local: Panels/Guard Panel/guard app backend/scripts -> repo root
  let candidate = path.resolve(__dirname, "../../../..");
  if (existsSync(path.join(candidate, "core"))) {
    return candidate;
  }

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
    "@raskha/attendance": path.join(monorepoRoot, "modules/Attendance/index.ts"),
    "@raskha/guard-management": path.join(
      monorepoRoot,
      "modules/Guard Management/index.ts"
    ),
    "@raskha/site-management": path.join(
      monorepoRoot,
      "modules/Site Management/index.ts"
    ),
  },
  packages: "external",
  banner: {
    js: "// Raskha Guard App backend bundle (workspace packages inlined)",
  },
});
