/**
 * Quick Firestore inspector — checks scheduling data for "New Site"
 * Run: npx tsx scripts/checkScheduling.ts
 */
import { resolve } from "node:path";
import { config } from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Load monorepo .env (same path the backend uses)
config({ path: resolve(process.cwd(), ".env") });

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});

const db = getFirestore();

async function main() {
  console.log("\n──────────────────────────────────────────────");
  console.log(" Checking scheduling data for 'New Site'");
  console.log("──────────────────────────────────────────────\n");

  // 1. Find site(s) named "New Site"
  const sitesSnap = await db
    .collection("sites")
    .where("siteName", "==", "New Site")
    .get();

  if (sitesSnap.empty) {
    console.log("❌  No site named 'New Site' found in Firestore.");
    return;
  }

  for (const siteDoc of sitesSnap.docs) {
    const site = siteDoc.data();
    console.log(`✅  Site found: ${siteDoc.id}`);
    console.log(`    Name      : ${site.siteName}`);
    console.log(`    Agency    : ${site.agencyId}`);
    console.log(`    Status    : ${site.status}`);
    console.log(`    Client    : ${site.clientName ?? "—"}`);

    const shifts = (site.shiftConfig?.shifts ?? []) as Array<{
      id: string; label: string; startTime: string; endTime: string;
      shiftType: string; requiredGuards: number;
    }>;

    if (shifts.length === 0) {
      console.log("\n    ⚠️  No shifts configured on this site.\n");
    } else {
      console.log(`\n    Shifts configured (${shifts.length}):`);
      for (const s of shifts) {
        console.log(`      • [${s.id}] ${s.label} (${s.shiftType}) ${s.startTime}–${s.endTime} — requires ${s.requiredGuards} guard(s)`);
      }
    }

    // 2. Fetch shift assignments for this site
    const assignSnap = await db
      .collection("shiftAssignments")
      .where("siteId", "==", siteDoc.id)
      .get();

    console.log(`\n    Shift assignments (${assignSnap.size} total):`);
    if (assignSnap.empty) {
      console.log("      (none)");
    } else {
      for (const a of assignSnap.docs) {
        const d = a.data();
        // Find the matching shift definition
        const shiftDef = shifts.find((s) => s.id === d.shiftId);
        const shiftLabel = shiftDef?.label ?? d.shiftLabel ?? d.shiftId;
        const required   = shiftDef?.requiredGuards ?? "?";

        // Count total assignments for same shiftId
        const countForShift = assignSnap.docs.filter(
          (x) => x.data().shiftId === d.shiftId
        ).length;

        console.log(
          `      [${a.id}]  Guard: ${d.guardName} (${d.guardId})`
          + `\n               Shift: ${shiftLabel} (${d.shiftId})`
          + `\n               Days : ${(d.recurringDays as string[]).join(", ")}`
          + `\n               From : ${d.effectiveFrom}  →  ${d.effectiveTo ?? "open-ended"}`
          + `\n               Cap  : ${countForShift}/${required} assigned to this shift`
          + "\n"
        );
      }

      // 3. Highlight over-capacity shifts
      const shiftCounts: Record<string, number> = {};
      for (const a of assignSnap.docs) {
        const sid = a.data().shiftId as string;
        shiftCounts[sid] = (shiftCounts[sid] ?? 0) + 1;
      }
      const problems: string[] = [];
      for (const s of shifts) {
        const count = shiftCounts[s.id] ?? 0;
        if (count > s.requiredGuards) {
          problems.push(`  ⛔ Shift "${s.label}" is OVER capacity: ${count}/${s.requiredGuards}`);
        } else if (count === s.requiredGuards) {
          problems.push(`  ✅ Shift "${s.label}" is FULL: ${count}/${s.requiredGuards}`);
        } else {
          problems.push(`  🟡 Shift "${s.label}" has room: ${count}/${s.requiredGuards}`);
        }
      }
      console.log("    Capacity summary:");
      problems.forEach((p) => console.log("   " + p));
    }
    console.log("\n──────────────────────────────────────────────\n");
  }
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
