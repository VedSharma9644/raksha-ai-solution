import { Router, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export function createHrStaffRoutes(): Router {
  const router = Router();

  // PUT /api/hr-staff/:id/password — update an HR user's Firebase Auth password
  router.put("/:id/password", async (req: Request, res: Response) => {
    try {
      const id = req.params["id"] as string;
      const { password } = req.body as { password?: string };

      if (!password || password.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters." });
        return;
      }

      // ── Fast path: HR user already has an Auth account ──
      try {
        await getAuth().updateUser(id, { password });
        res.json({ success: true });
        return;
      } catch (updateErr: unknown) {
        const e = updateErr as { code?: string };
        if (e.code !== "auth/user-not-found") throw updateErr;
      }

      // ── Slow path: legacy HR user has no Auth account — read email from Firestore ──
      const adminDb = getFirestore();
      const hrDoc = await adminDb.collection("hrStaff").doc(id).get();
      if (!hrDoc.exists) {
        res.status(404).json({ error: "HR user not found." });
        return;
      }

      const email = (hrDoc.data() as { email?: string })?.email;
      if (!email) {
        res.status(400).json({ error: "HR user has no email address on record." });
        return;
      }

      // ── Create the missing Auth account ──
      try {
        await getAuth().createUser({ uid: id, email, password });
        res.json({ success: true });
        return;
      } catch (createErr: unknown) {
        const ce = createErr as { code?: string };

        if (ce.code !== "auth/email-already-exists") throw createErr;

        // ── Email registered under a different UID (orphaned account) ──
        const existing = await getAuth().getUserByEmail(email);
        if (existing.uid === id) {
          // Same UID — just update the password
          await getAuth().updateUser(id, { password });
        } else {
          // Different UID — delete the orphan and recreate with the correct UID
          await getAuth().deleteUser(existing.uid);
          await getAuth().createUser({ uid: id, email, password });
        }
        res.json({ success: true });
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to update password." });
    }
  });

  return router;
}
