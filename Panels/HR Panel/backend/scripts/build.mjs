import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import * as esbuild from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveMonorepoRoot() {
  if (process.env.MONOREPO_ROOT) {
    return path.resolve(process.env.MONOREPO_ROOT);
  }

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
    "@raskha/shared": path.join(monorepoRoot, "shared/index.js"),
    "@raskha/guard-management": path.join(
      monorepoRoot,
      "modules/Guard Management/index.ts"
    ),
    "@raskha/hr-management": path.join(
      monorepoRoot,
      "modules/HR Management/index.ts"
    ),
    "@raskha/attendance": path.join(monorepoRoot, "modules/Attendance/index.js"),
  },
  packages: "external",
  banner: {
    js: "// Raskha panel backend bundle (workspace packages inlined)",
  },
});
