import { Router, type Response } from "express";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { requireAgencyCaller, type AgencyAuthRequest } from "../middleware/requireAgencyCaller";

const SITES_COLLECTION = "sites";

export function createSiteRoutes(): Router {
  const router = Router();

  // POST /api/sites — create a new site
  router.post("/", requireAgencyCaller, async (req: AgencyAuthRequest, res: Response) => {
    try {
      const adminDb = getFirestore();
      const body = req.body as Record<string, unknown>;

      if (!body.agencyId || !body.siteName) {
        res.status(400).json({ error: "agencyId and siteName are required." });
        return;
      }

      const { agencyId: _a, id: _id, createdAt: _c, updatedAt: _u, ...rest } = body;

      const docRef = await adminDb.collection(SITES_COLLECTION).add({
        ...rest,
        agencyId: body.agencyId,
        status: "active",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      res.status(201).json({ id: docRef.id });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to create site." });
    }
  });

  // PUT /api/sites/:id — update an existing site (Admin SDK — bypasses Firestore rules)
  router.put("/:id", requireAgencyCaller, async (req: AgencyAuthRequest, res: Response) => {
    try {
      const adminDb = getFirestore();
      const { id } = req.params as { id: string };
      const body = req.body as Record<string, unknown>;

      // Strip immutable fields
      const { agencyId: _a, id: _id, createdAt: _c, ...updates } = body;

      await adminDb.collection(SITES_COLLECTION).doc(id).update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp(),
      });

      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to update site." });
    }
  });

  // DELETE /api/sites/:id — agency admin only
  router.delete("/:id", requireAgencyCaller, async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (req.callerRole !== "agency") {
        res.status(403).json({ error: "Only the agency admin can delete a site." });
        return;
      }

      const adminDb = getFirestore();
      const { id } = req.params as { id: string };
      const snap = await adminDb.collection(SITES_COLLECTION).doc(id).get();
      if (!snap.exists) {
        res.status(404).json({ error: "Site not found." });
        return;
      }

      const data = snap.data() as { agencyId?: string };
      if (data.agencyId !== req.agencyId) {
        res.status(403).json({ error: "Access denied." });
        return;
      }

      const assigned = await adminDb
        .collection("guards")
        .where("assignedSiteId", "==", id)
        .get();

      const docs = assigned.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const batch = adminDb.batch();
        for (const guardDoc of docs.slice(i, i + 400)) {
          batch.update(guardDoc.ref, {
            assignedSiteId: "",
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        await batch.commit();
      }

      await adminDb.collection(SITES_COLLECTION).doc(id).delete();
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to delete site." });
    }
  });

  return router;
}
