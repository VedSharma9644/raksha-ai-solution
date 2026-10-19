import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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
const assignmentId = "0BpJ9ao1mQNos0dRUJrr";
const guardId = "N9gZhluRuJgahJzN5S7JRhPbj7A3";
const siteId = "CgwXXUlHDCkoAPAhgPWr";

await db.collection("shiftAssignments").doc(assignmentId).update({
  shiftStartTime: "10:00",
  shiftEndTime: "22:00",
  shiftLabel: "Day",
  updatedAt: FieldValue.serverTimestamp(),
});
await db.collection("guards").doc(guardId).set(
  {
    assignedSiteId: siteId,
    shiftFrom: "10:00",
    shiftTo: "22:00",
    post: "Day",
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true }
);
console.log("synced assignment + guard profile to 10:00-22:00 Day");
