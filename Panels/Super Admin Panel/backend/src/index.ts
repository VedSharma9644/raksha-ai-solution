import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { initializeApp as initializeAdminApp, cert, getApps } from "firebase-admin/app";
import express from "express";
import { isAllowedCorsOrigin } from "./cors.js";
import { requireSuperAdmin } from "./middleware/requireSuperAdmin.js";
import { createAgencyRoutes } from "./routes/agencyRoutes.js";
import { createModuleRoutes } from "./routes/moduleRoutes.js";
import { verifyAgencyLogin } from "./routes/verifyLogin.js";

const rootEnv = resolve(process.cwd(), "../../../.env");
if (existsSync(rootEnv)) {
  config({ path: rootEnv });
} else {
  config();
}

const required = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");

if (getApps().length === 0) {
  initializeAdminApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const corsExtra = process.env.CORS_ALLOWED_ORIGINS;
const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedCorsOrigin(origin, corsExtra)) {
    res.setHeader("Access-Control-Allow-Origin", origin!);
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-api-key"
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
    service: "raskha-super-admin-api",
    adminSdk: true,
  });
});

/** Public to signed-in agencies (Firebase Bearer). Must stay above requireSuperAdmin. */
app.post("/api/agencies/verify-login", verifyAgencyLogin);

app.use("/api/agencies", requireSuperAdmin, createAgencyRoutes());
app.use("/api/modules", requireSuperAdmin, createModuleRoutes());

const PORT = Number(process.env.PORT ?? 3003);
app.listen(PORT, () => {
  console.log(`Raskha Super Admin Backend listening on :${PORT}`);
});
