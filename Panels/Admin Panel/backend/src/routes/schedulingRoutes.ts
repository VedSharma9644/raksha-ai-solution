import { Router, type Response } from "express";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { requireAgencyCaller, type AgencyAuthRequest } from "../middleware/requireAgencyCaller";

// Inline the collection name — avoids importing firebase/firestore in Node.js context
const SHIFT_ASSIGNMENTS_COLLECTION = "shiftAssignments";

export function createSchedulingRoutes(): Router {
  const router = Router();

  router.use(requireAgencyCaller);

  // ── GET /api/scheduling?siteId=xxx — list shift assignments for a site ──────
  router.get("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const { siteId } = req.query;
      if (!siteId || typeof siteId !== "string") {
        res.status(400).json({ error: "siteId query param is required." });
        return;
      }

      const adminDb = getFirestore();
      const snap = await adminDb
        .collection(SHIFT_ASSIGNMENTS_COLLECTION)
        .where("siteId", "==", siteId)
        .where("agencyId", "==", agencyId)
        .get();

      const assignments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.json(assignments);
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to fetch shift assignments." });
    }
  });

  // ── POST /api/scheduling — create a new shift assignment ────────────────────
  router.post("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const {
        siteId, guardId, guardName,
        shiftId, shiftLabel, shiftStartTime, shiftEndTime,
        recurringDays, effectiveFrom, effectiveTo,
      } = req.body as Record<string, unknown>;

      if (!siteId || !guardId || !shiftId || !recurringDays || !effectiveFrom) {
        res.status(400).json({ error: "Missing required fields." });
        return;
      }

      const adminDb = getFirestore();

      // ── Enforce requiredGuards cap ─────────────────────────────────────────
      // 1. Fetch the site to get shiftConfig
      const siteDoc = await adminDb.collection("sites").doc(String(siteId)).get();
      if (!siteDoc.exists) {
        res.status(404).json({ error: "Site not found." }); return;
      }
      const siteData = siteDoc.data() as Record<string, unknown>;
      // Verify site belongs to this agency
      if (siteData.agencyId !== agencyId) {
        res.status(403).json({ error: "Forbidden." }); return;
      }
      // Find the shift definition
      const shiftConfig = siteData.shiftConfig as { shifts?: Array<{ id: string; requiredGuards: number }> } | null | undefined;
      const shiftDef = shiftConfig?.shifts?.find((s) => s.id === String(shiftId));
      if (!shiftDef) {
        res.status(400).json({ error: "Shift not found on this site." }); return;
      }
      // Count how many guards are already assigned to this shift
      const existingSnap = await adminDb
        .collection(SHIFT_ASSIGNMENTS_COLLECTION)
        .where("siteId", "==", String(siteId))
        .where("shiftId", "==", String(shiftId))
        .get();
      if (existingSnap.size >= shiftDef.requiredGuards) {
        res.status(409).json({
          error: `This shift is full — ${existingSnap.size}/${shiftDef.requiredGuards} guards already assigned.`,
        });
        return;
      }
      // ── End cap check ──────────────────────────────────────────────────────

      const data = {
        agencyId,
        siteId, guardId, guardName: guardName ?? "",
        shiftId, shiftLabel: shiftLabel ?? "",
        shiftStartTime: shiftStartTime ?? "", shiftEndTime: shiftEndTime ?? "",
        recurringDays,
        effectiveFrom,
        effectiveTo: effectiveTo ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const ref = await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).add(data);
      res.status(201).json({ id: ref.id, ...data });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to create shift assignment." });
    }
  });

  // ── PATCH /api/scheduling/:id — update a shift assignment ───────────────────
  router.patch("/:id", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const assignmentId = req.params["id"] as string;
      const adminDb = getFirestore();

      // Verify ownership
      const doc = await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).doc(assignmentId).get();
      if (!doc.exists || (doc.data() as { agencyId?: string })?.agencyId !== agencyId) {
        res.status(403).json({ error: "Not authorised to edit this assignment." });
        return;
      }

      const updates = { ...req.body, updatedAt: FieldValue.serverTimestamp() };
      await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).doc(assignmentId).update(updates);
      res.json({ success: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to update shift assignment." });
    }
  });

  // ── DELETE /api/scheduling/:id — delete a shift assignment ──────────────────
  router.delete("/:id", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const assignmentId = req.params["id"] as string;
      const adminDb = getFirestore();

      // Verify ownership
      const doc = await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).doc(assignmentId).get();
      if (!doc.exists || (doc.data() as { agencyId?: string })?.agencyId !== agencyId) {
        res.status(403).json({ error: "Not authorised to delete this assignment." });
        return;
      }

      await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).doc(assignmentId).delete();
      res.json({ success: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to delete shift assignment." });
    }
  });

  return router;
}
