import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { initializeApp as initializeAdminApp, cert, getApps } from "firebase-admin/app";
import express from "express";
import {
  initializeFirebase,
  isAllowedCorsOrigin,
} from "@raskha/core";

import { createAttendanceRoutes } from "./routes/attendanceRoutes";
import { createAuthRoutes } from "./routes/authRoutes";

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

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
  throw new Error(
    "Missing FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY for Guard App Admin SDK."
  );
}

if (getApps().length === 0) {
  initializeAdminApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const firebase = initializeFirebase({
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.FIREBASE_APP_ID!,
});

const corsExtra = process.env.CORS_ALLOWED_ORIGINS;

const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isAllowedCorsOrigin(origin, corsExtra)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else if (!origin) {
    // Native mobile apps often omit Origin
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

app.use(express.json({ limit: "8mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "raskha-guard-app-api",
    demoMode: process.env.ATTENDANCE_DEMO_MODE !== "false",
    firebase: typeof firebase.app === "object",
    admin: getApps().length > 0,
  });
});

app.use("/api/auth", createAuthRoutes());
app.use("/api/attendance", createAttendanceRoutes());

const PORT = Number(process.env.GUARD_APP_API_PORT ?? process.env.PORT ?? 3005);
app.listen(PORT, () => {
  console.log(`Raskha Guard App Backend listening on :${PORT}`);
});
