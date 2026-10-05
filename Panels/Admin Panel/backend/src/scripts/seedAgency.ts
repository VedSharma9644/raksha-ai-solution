import { config } from "dotenv";
import { resolve } from "path";

// Load .env from the project root (3 levels up from Panels/Admin Panel/backend)
config({ path: resolve(process.cwd(), "../../../.env") });

import {
  initializeFirebase,
  createAgencyAccount,
  getAgencyById,
  signInAgency,
} from "@raskha/core";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { AGENCIES_COLLECTION } from "@raskha/core";

// ─── Default agency credentials for testing ──────────────────────────────────
const DEFAULT_AGENCY = {
  name: "Raksha Security Agency",
  email: "admin@raksha.com",
  password: "Raksha@1234",
  phone: "+91 98765 43210",
  address: "123 Security Bhavan, Mumbai, Maharashtra, India",
  plan: "standard" as const,
  logo: "",
  ownerName: "Raksha Admin",
};

async function seed() {
  const firebase = initializeFirebase({
    apiKey: process.env.FIREBASE_API_KEY!,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.FIREBASE_PROJECT_ID!,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.FIREBASE_APP_ID!,
  });

  const db = firebase.database.instance;
  const auth = firebase.auth;

  console.log("🌱 Starting seed: Default Agency Account");
  console.log(`   Email    : ${DEFAULT_AGENCY.email}`);
  console.log(`   Password : ${DEFAULT_AGENCY.password}`);
  console.log(`   Plan     : ${DEFAULT_AGENCY.plan}`);
  console.log("─────────────────────────────────────────");

  let uid: string | null = null;

  // Step 1: Create or retrieve the Firebase Auth user
  try {
    const agency = await createAgencyAccount(auth, db, DEFAULT_AGENCY);
    console.log("✅ Agency Auth + Firestore document created!");
    console.log(`   ID       : ${agency.id}`);
    console.log(`   Name     : ${agency.name}`);
    console.log(`   Status   : ${agency.status}`);
    process.exit(0);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };

    if (err.code === "auth/email-already-in-use") {
      console.log("⚠️  Auth user already exists — signing in to get UID...");

      // Sign in to get the existing user's UID
      const credential = await signInAgency(auth, {
        email: DEFAULT_AGENCY.email,
        password: DEFAULT_AGENCY.password,
      });
      uid = credential.user.uid;
      console.log(`   UID      : ${uid}`);
    } else {
      console.error("❌ Seed failed at Auth step:", err.message);
      process.exit(1);
    }
  }

  // Step 2: Check if Firestore document already exists
  if (uid) {
    const existing = await getAgencyById(db, uid);

    if (existing) {
      console.log("✅ Firestore document already exists. Nothing to do.");
      console.log(`   ID       : ${existing.id}`);
      console.log(`   Name     : ${existing.name}`);
    } else {
      // Auth user exists but Firestore doc is missing — create it now
      console.log("📝 Firestore document missing — creating it now...");

      const agencyData = {
        id: uid,
        name: DEFAULT_AGENCY.name,
        email: DEFAULT_AGENCY.email,
        phone: DEFAULT_AGENCY.phone,
        address: DEFAULT_AGENCY.address,
        plan: DEFAULT_AGENCY.plan,
        logo: DEFAULT_AGENCY.logo,
        ownerName: DEFAULT_AGENCY.ownerName,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, AGENCIES_COLLECTION, uid), agencyData);

      console.log("✅ Firestore document created successfully!");
      console.log(`   ID       : ${uid}`);
      console.log(`   Name     : ${DEFAULT_AGENCY.name}`);
    }
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Unexpected error:", err.message);
  process.exit(1);
});
