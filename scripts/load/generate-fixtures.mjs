/**
 * Generates load-test fixtures under scripts/load/:
 * - selfie.fixture.jpg / selfie.fixture.b64 (~200KB)
 * - guards.fixture.json (150 entries — demo credentials by default)
 *
 * Usage (from repo root):
 *   node scripts/load/generate-fixtures.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(__dirname, { recursive: true });

const SIZE = 200 * 1024;
const buf = Buffer.alloc(SIZE);
buf[0] = 0xff;
buf[1] = 0xd8;
buf[2] = 0xff;
buf[3] = 0xe0;
for (let i = 4; i < SIZE - 2; i++) {
  buf[i] = i % 251;
}
buf[SIZE - 2] = 0xff;
buf[SIZE - 1] = 0xd9;

writeFileSync(join(__dirname, "selfie.fixture.jpg"), buf);
writeFileSync(join(__dirname, "selfie.fixture.b64"), buf.toString("base64"));

const demoId = process.env.GUARD_DEMO_ID || "RKS-8842";
const demoPassword = process.env.GUARD_DEMO_PASSWORD || "demo1234";
const demoPhone = process.env.GUARD_DEMO_PHONE || "9876543210";
const count = Number(process.env.LOAD_GUARD_COUNT || 150);

const guards = Array.from({ length: count }, (_, i) => ({
  // Shared demo credentials: works when ATTENDANCE_DEMO_MODE=true on Guard API.
  // Replace identifier/password with unique seeded Load Test Agency guards for
  // concurrent punch-in (same guardId can only punch in once per day).
  vu: i + 1,
  identifier: demoId,
  password: demoPassword,
  phone: demoPhone,
  note:
    i === 0
      ? "Default demo credential. For unique punch-ins, seed 150 guards and replace this file."
      : undefined,
}));

writeFileSync(
  join(__dirname, "guards.fixture.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count,
      mode: "demo_shared",
      guards,
    },
    null,
    2
  )
);

console.log(`Wrote selfie.fixture.jpg (${SIZE} bytes)`);
console.log(`Wrote selfie.fixture.b64 (${buf.toString("base64").length} chars)`);
console.log(`Wrote guards.fixture.json (${count} entries, demo_shared)`);
