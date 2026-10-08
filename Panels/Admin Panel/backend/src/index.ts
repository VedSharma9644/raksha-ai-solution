import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { initializeApp as initializeAdminApp, cert } from "firebase-admin/app";
import express from "express";
import {
  initializeFirebase,
  isAllowedCorsOrigin,
} from "@raskha/core";
import { createAttendanceRoutes } from "./routes/attendanceRoutes";
import { createGuardRoutes } from "./routes/guardRoutes";
import { createHrStaffRoutes } from "./routes/hrStaffRoutes";
import { createFormSchemaRoutes } from "./routes/formSchemaRoutes";
import { createLeaveRoutes } from "./routes/leaveRoutes";
import { createNotificationRoutes } from "./routes/notificationRoutes";
import { createReliefRoutes } from "./routes/reliefRoutes";
import { createSchedulingRoutes } from "./routes/schedulingRoutes";

// Local monorepo .env; Cloud Run injects env vars instead
const rootEnv = resolve(process.cwd(), "../../../.env");
if (existsSync(rootEnv)) {
  config({ path: rootEnv });
} else {
  config();
}

const required = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

// ── Firebase Admin SDK (for privileged operations like password update) ──────
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

initializeAdminApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});

// ── Firebase Client SDK (for Firestore / regular reads & writes) ─────────────
const firebase = initializeFirebase({
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.FIREBASE_APP_ID!,
});

const db = firebase.database.instance;
const corsExtra = process.env.CORS_ALLOWED_ORIGINS;

// ── Express app ──────────────────────────────────────────────────────────────
const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedCorsOrigin(origin, corsExtra)) {
    res.setHeader("Access-Control-Allow-Origin", origin!);
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "raskha-admin-api",
    firebase: typeof firebase.app === "object",
  });
});

app.use("/api/guards", createGuardRoutes(db));
app.use("/api/hr-staff", createHrStaffRoutes());
app.use("/api/form-schemas", createFormSchemaRoutes());
app.use("/api/attendance", createAttendanceRoutes());
app.use("/api/leave", createLeaveRoutes());
app.use("/api/relief", createReliefRoutes());
app.use("/api/notifications", createNotificationRoutes());
app.use("/api/scheduling", createSchedulingRoutes());

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`Raskha Admin Backend listening on :${PORT}`);
  console.log("Firebase Admin SDK initialised ✓");
});
