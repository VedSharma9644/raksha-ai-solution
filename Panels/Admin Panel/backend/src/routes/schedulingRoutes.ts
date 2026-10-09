import { Router, type Response } from "express";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { notifyRosterUpdate } from "@raskha/notifications";
import { requireAgencyCaller, type AgencyAuthRequest } from "../middleware/requireAgencyCaller";

// Inline the collection name — avoids importing firebase/firestore in Node.js context
const SHIFT_ASSIGNMENTS_COLLECTION = "shiftAssignments";

async function siteDisplayName(
  adminDb: ReturnType<typeof getFirestore>,
  siteId: string
): Promise<string> {
  try {
    const snap = await adminDb.collection("sites").doc(siteId).get();
    const name = (snap.data() as { siteName?: string } | undefined)?.siteName;
    return typeof name === "string" && name.trim() ? name.trim() : "Assigned Site";
  } catch {
    return "Assigned Site";
  }
}

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

      const siteDoc = await adminDb.collection("sites").doc(siteId).get();
      const siteData = siteDoc.data() as
        | {
            shiftConfig?: {
              shifts?: Array<{
                id: string;
                label?: string;
                startTime?: string;
                endTime?: string;
              }>;
            };
          }
        | undefined;
      const liveById = new Map(
        (siteData?.shiftConfig?.shifts ?? []).map((s) => [s.id, s])
      );

      const assignments = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        const live = liveById.get(String(data.shiftId ?? ""));
        if (!live) {
          return { id: d.id, ...data };
        }
        return {
          id: d.id,
          ...data,
          shiftLabel: live.label || data.shiftLabel,
          shiftStartTime: live.startTime || data.shiftStartTime,
          shiftEndTime: live.endTime || data.shiftEndTime,
        };
      });
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
      // Find the shift definition — live site times are source of truth
      const shiftConfig = siteData.shiftConfig as {
        shifts?: Array<{
          id: string;
          label?: string;
          startTime?: string;
          endTime?: string;
          requiredGuards: number;
        }>;
      } | null | undefined;
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
        shiftId,
        shiftLabel: shiftDef.label || String(shiftLabel ?? "Duty"),
        shiftStartTime: shiftDef.startTime || String(shiftStartTime ?? "08:00"),
        shiftEndTime: shiftDef.endTime || String(shiftEndTime ?? "20:00"),
        recurringDays,
        effectiveFrom,
        effectiveTo: effectiveTo ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const ref = await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).add(data);
      const siteName = String(
        (siteData.siteName as string | undefined) ?? "Assigned Site"
      );
      void notifyRosterUpdate({
        guardId: String(guardId),
        agencyId,
        action: "assigned",
        siteName,
        shiftLabel: String(data.shiftLabel),
        shiftStartTime: String(data.shiftStartTime),
        shiftEndTime: String(data.shiftEndTime),
      }).catch(() => undefined);

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

      const current = doc.data() as {
        siteId?: string;
        shiftId?: string;
        guardId?: string;
        shiftLabel?: string;
        shiftStartTime?: string;
        shiftEndTime?: string;
      };
      const body = req.body as Record<string, unknown>;
      const nextShiftId = String(body.shiftId ?? current.shiftId ?? "");
      const nextSiteId = String(current.siteId ?? "");

      // Re-read live site shift so PATCH cannot leave stale times/labels.
      let liveLabel: string | undefined;
      let liveStart: string | undefined;
      let liveEnd: string | undefined;
      if (nextSiteId && nextShiftId) {
        const siteDoc = await adminDb.collection("sites").doc(nextSiteId).get();
        const siteData = siteDoc.data() as
          | {
              shiftConfig?: {
                shifts?: Array<{
                  id: string;
                  label?: string;
                  startTime?: string;
                  endTime?: string;
                }>;
              };
            }
          | undefined;
        const live = siteData?.shiftConfig?.shifts?.find(
          (s) => s.id === nextShiftId
        );
        if (live) {
          liveLabel = live.label;
          liveStart = live.startTime;
          liveEnd = live.endTime;
        }
      }

      const updates = {
        ...body,
        ...(liveLabel ? { shiftLabel: liveLabel } : {}),
        ...(liveStart ? { shiftStartTime: liveStart } : {}),
        ...(liveEnd ? { shiftEndTime: liveEnd } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      };
      await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).doc(assignmentId).update(updates);

      const guardId = String(current.guardId ?? "");
      if (guardId) {
        const siteName = await siteDisplayName(adminDb, nextSiteId);
        void notifyRosterUpdate({
          guardId,
          agencyId,
          action: "updated",
          siteName,
          shiftLabel: String(
            liveLabel ?? body.shiftLabel ?? current.shiftLabel ?? "Duty"
          ),
          shiftStartTime: String(
            liveStart ?? body.shiftStartTime ?? current.shiftStartTime ?? ""
          ),
          shiftEndTime: String(
            liveEnd ?? body.shiftEndTime ?? current.shiftEndTime ?? ""
          ),
        }).catch(() => undefined);
      }

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

      const prior = doc.data() as {
        guardId?: string;
        siteId?: string;
        shiftLabel?: string;
        shiftStartTime?: string;
        shiftEndTime?: string;
      };
      await adminDb.collection(SHIFT_ASSIGNMENTS_COLLECTION).doc(assignmentId).delete();

      if (prior.guardId) {
        const siteName = await siteDisplayName(
          adminDb,
          String(prior.siteId ?? "")
        );
        void notifyRosterUpdate({
          guardId: String(prior.guardId),
          agencyId,
          action: "removed",
          siteName,
          shiftLabel: String(prior.shiftLabel ?? "Duty"),
          shiftStartTime: String(prior.shiftStartTime ?? ""),
          shiftEndTime: String(prior.shiftEndTime ?? ""),
        }).catch(() => undefined);
      }

      res.json({ success: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to delete shift assignment." });
    }
  });

  return router;
}
