import type { Firestore } from "firebase/firestore";
import { Router, type Request, type Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import {
  addGuard,
  getGuardById,
  listGuardsByAgency,
  updateGuard,
  deleteGuard,
} from "@raskha/guard-management";
import { requireAgencyCaller, type AgencyAuthRequest } from "../middleware/requireAgencyCaller";

export function createGuardRoutes(db: Firestore): Router {
  const router = Router();

  // POST /api/guards — add a new guard
  router.post("/", async (req: Request, res: Response) => {
    try {
      const { agencyId, fullName, employeeCode, phone, email, assignedSiteId, notes } =
        req.body;

      if (!agencyId || !fullName || !employeeCode || !phone || !email) {
        res.status(400).json({ error: "Missing required fields." });
        return;
      }

      const guard = await addGuard(db, {
        agencyId,
        fullName,
        fatherName: req.body.fatherName ?? "",
        gender: (req.body.gender as "male" | "female" | "other") ?? "male",
        employeeCode,
        phone,
        email,
        address: req.body.address ?? "",
        caste: req.body.caste ?? "",
        height: req.body.height ?? "",
        aadhaarNumber: req.body.aadhaarNumber ?? "",
        panNumber: req.body.panNumber ?? "",
        post: req.body.post ?? "",
        joiningDate: req.body.joiningDate ?? "",
        salary: req.body.salary ?? "",
        experience: req.body.experience ?? "",
        education: req.body.education ?? "",
        assignedSiteId: assignedSiteId ?? "",
        guardType: (req.body.guardType as "ex-serviceman" | "civilian") ?? "civilian",
        interestedCity: req.body.interestedCity ?? "",
        shiftFrom: req.body.shiftFrom ?? "",
        shiftTo: req.body.shiftTo ?? "",
        characterCertificateUrl: req.body.characterCertificateUrl ?? "",
        policeVerificationUrl: req.body.policeVerificationUrl ?? "",
        profilePictureUrl: req.body.profilePictureUrl ?? "",
        bankAccount: req.body.bankAccount ?? "",
        pfNumber: req.body.pfNumber ?? "",
        notes: notes ?? "",
      });

      res.status(201).json(guard);
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to add guard." });
    }
  });

  // GET /api/guards?agencyId=xxx — list all guards for an agency
  router.get("/", async (req: Request, res: Response) => {
    try {
      const { agencyId } = req.query;

      if (!agencyId || typeof agencyId !== "string") {
        res.status(400).json({ error: "agencyId query param is required." });
        return;
      }

      const guards = await listGuardsByAgency(db, agencyId);
      res.json(guards);
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to fetch guards." });
    }
  });

  // GET /api/guards/:id — get one guard
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const guard = await getGuardById(db, req.params.id);

      if (!guard) {
        res.status(404).json({ error: "Guard not found." });
        return;
      }

      res.json(guard);
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to fetch guard." });
    }
  });

  // PUT /api/guards/:id/password — update a guard's Firebase Auth password
  // Also keeps the email in Firebase Auth in sync with Firestore.
  // If the guard has no Auth account yet (legacy Firestore-only record),
  // auto-creates one. Handles email conflicts with a clear error.
  router.put("/:id/password", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { password } = req.body as { password?: string };

      if (!password || password.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters." });
        return;
      }

      // Always read the guard's latest email from Firestore (Admin SDK — bypasses rules)
      const adminDb = getFirestore();
      const guardDoc = await adminDb.collection("guards").doc(id).get();
      if (!guardDoc.exists) {
        res.status(404).json({ error: "Guard not found." });
        return;
      }
      const email = (guardDoc.data() as { email?: string })?.email;
      if (!email) {
        res.status(400).json({ error: "Guard has no email address on record." });
        return;
      }

      try {
        // Fast path: guard has an Auth account — update password AND keep email in sync
        await getAuth().updateUser(id, { password, email });
      } catch (authErr: unknown) {
        const e = authErr as { code?: string };
        if (e.code !== "auth/user-not-found") throw authErr;

        // Slow path: no Auth account yet — create one now
        try {
          await getAuth().createUser({ uid: id, email, password });
        } catch (createErr: unknown) {
          const ce = createErr as { code?: string };
          if (ce.code === "auth/email-already-exists") {
            // Another Auth account already holds this email.
            // If its UID doesn't match the guard's Firestore ID it's an orphaned
            // account — delete it and create the correct one.
            const existing = await getAuth().getUserByEmail(email);
            if (existing.uid === id) {
              // Edge case: UID matches — just update password
              await getAuth().updateUser(id, { password });
            } else {
              // Orphaned account: remove it and create the correct one
              await getAuth().deleteUser(existing.uid);
              await getAuth().createUser({ uid: id, email, password });
            }
          } else {
            throw createErr;
          }
        }
      }

      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to update password." });
    }
  });

  // PUT /api/guards/:id — update a guard (Admin SDK — bypasses Firestore rules)
  router.put("/:id", requireAgencyCaller, async (req: AgencyAuthRequest, res: Response) => {
    try {
      const adminDb = getFirestore();
      const { id } = req.params;
      const updates = req.body as Record<string, unknown>;

      // Prevent overwriting immutable fields
      const { agencyId: _a, createdAt: _c, ...safeUpdates } = updates;

      await adminDb.collection("guards").doc(id).update({
        ...safeUpdates,
        updatedAt: new Date(),
      });

      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to update guard." });
    }
  });

  // DELETE /api/guards/:id — delete a guard
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      await deleteGuard(db, req.params.id);
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to delete guard." });
    }
  });

  return router;
}
