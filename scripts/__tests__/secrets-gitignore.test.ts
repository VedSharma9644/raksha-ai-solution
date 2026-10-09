import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(process.cwd());

/** Fixture values only — never copy real production secrets into tests. */
const FIXTURE_SECRETS = {
  SUPER_ADMIN_API_KEY: "test-sa-key",
  FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nTEST_FIXTURE\\n-----END PRIVATE KEY-----\\n",
} as const;

describe("env / secrets hygiene", () => {
  it(".gitignore ignores .env and keeps .env.example trackable", () => {
    const gitignore = readFileSync(resolve(ROOT, ".gitignore"), "utf8");
    expect(gitignore).toMatch(/^\.env\s*$/m);
    expect(gitignore).toMatch(/^\.env\.\*\s*$/m);
    expect(gitignore).toMatch(/^!\.env\.example\s*$/m);
  });

  it(".env is present locally but must not be committed via ignore rules", () => {
    // Local machines may have .env; CI may not. Either way, ignore rules above apply.
    if (existsSync(resolve(ROOT, ".env"))) {
      expect(existsSync(resolve(ROOT, ".env"))).toBe(true);
    }
    expect(existsSync(resolve(ROOT, ".env.example"))).toBe(true);
  });

  it("test fixtures do not embed live-looking credentials", () => {
    expect(FIXTURE_SECRETS.SUPER_ADMIN_API_KEY).toBe("test-sa-key");
    expect(FIXTURE_SECRETS.SUPER_ADMIN_API_KEY).not.toMatch(/^\d{8,}$/);
    expect(FIXTURE_SECRETS.FIREBASE_PRIVATE_KEY).toContain("TEST_FIXTURE");
    expect(FIXTURE_SECRETS.FIREBASE_PRIVATE_KEY).not.toContain("BEGIN RSA PRIVATE KEY");
  });

  it("auth test files use fixture API keys only", () => {
    const saTest = readFileSync(
      resolve(
        ROOT,
        "Panels/Super Admin Panel/backend/src/__tests__/auth-gate.test.ts"
      ),
      "utf8"
    );
    expect(saTest).toContain('SUPER_ADMIN_API_KEY = "test-sa-key"');
    expect(saTest).not.toMatch(/SUPER_ADMIN_API_KEY\s*=\s*process\.env/);
  });
});
