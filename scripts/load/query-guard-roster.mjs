import { existsSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
config({ path: resolve(root, ".env") });

const pk = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: pk,
    }),
  });
}

const db = getFirestore();
const guardId = "N9gZhluRuJgahJzN5S7JRhPbj7A3";
const siteId = "CgwXXUlHDCkoAPAhgPWr";

const guardSnap = await db.collection("guards").doc(guardId).get();
const guard = guardSnap.data() || null;
const byGuard = await db
  .collection("shiftAssignments")
  .where("guardId", "==", guardId)
  .get();
const bySite = await db
  .collection("shiftAssignments")
  .where("siteId", "==", siteId)
  .get();
const siteSnap = await db.collection("sites").doc(siteId).get();
const site = siteSnap.data() || null;

const out = {
  queriedAt: new Date().toISOString(),
  firestoreGuardDoc: guard
    ? {
        fullName: guard.fullName,
        phone: guard.phone || guard.mobile || guard.phoneNumber,
        employeeCode: guard.employeeCode,
        assignedSiteId: guard.assignedSiteId,
        siteName: guard.siteName,
        postName: guard.postName,
        shiftFrom: guard.shiftFrom,
        shiftTo: guard.shiftTo,
        agencyId: guard.agencyId,
      }
    : null,
  site: site
    ? {
        siteName: site.siteName,
        address: site.address,
        city: site.city,
        hrName: site.hrName,
        hrContact: site.hrContact,
        shiftConfig: site.shiftConfig,
      }
    : null,
  assignmentsForGuard: byGuard.docs.map((d) => ({ id: d.id, ...d.data() })),
  assignmentsForSite: bySite.docs.map((d) => ({ id: d.id, ...d.data() })),
};

const outPath = resolve(root, "scripts/load/guard-compare-7742124908.json");
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(
  `wrote ${outPath}\nguardAssignments=${byGuard.size} siteAssignments=${bySite.size}`
);
