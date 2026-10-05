import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), "../../../.env") });

import express from "express";
import { initializeFirebase } from "@raskha/core";
import { createGuardRoutes } from "./routes/guardRoutes";

const firebase = initializeFirebase({
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.FIREBASE_APP_ID!,
});

const db = firebase.database.instance;

const app = express();
app.use(express.json());

// Mount routes
app.use("/api/guards", createGuardRoutes(db));

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Raskha Admin Backend running on http://localhost:${PORT}`);
  console.log("Firebase Core loaded:", typeof firebase.app === "object");
});
