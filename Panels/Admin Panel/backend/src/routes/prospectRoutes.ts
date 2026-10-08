import { Router, type Response } from "express";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { requireAgencyCaller, type AgencyAuthRequest } from "../middleware/requireAgencyCaller";

// Inline collection constants — avoids importing firebase/firestore (browser SDK) in Node.js
const PROSPECT_CLIENTS_COLLECTION = "prospectClients";
const PROSPECT_NOTES_SUBCOLLECTION = "notes";

export function createProspectRoutes(): Router {
  const router = Router();

  router.use(requireAgencyCaller);

  // ── GET /api/prospects — list prospects for the agency (optional ?status=) ──
  router.get("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const adminDb = getFirestore();

      const { status } = req.query;

      // Build query — no orderBy so no composite index is required; sort in memory
      let q = adminDb
        .collection(PROSPECT_CLIENTS_COLLECTION)
        .where("agencyId", "==", agencyId) as FirebaseFirestore.Query;

      if (status && typeof status === "string") {
        q = q.where("status", "==", status);
      }

      const snap = await q.get();
      const prospects = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          // Sort newest first using createdAt (Firestore Timestamp has .seconds)
          const aTs = (a as Record<string, unknown>).createdAt as { seconds?: number } | null;
          const bTs = (b as Record<string, unknown>).createdAt as { seconds?: number } | null;
          return (bTs?.seconds ?? 0) - (aTs?.seconds ?? 0);
        });

      res.json(prospects);
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to fetch prospects." });
    }
  });

  // ── GET /api/prospects/:id — get single prospect ───────────────────────────
  router.get("/:id", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const adminDb = getFirestore();
      const snap = await adminDb.collection(PROSPECT_CLIENTS_COLLECTION).doc(req.params.id).get();
      if (!snap.exists) { res.status(404).json({ error: "Prospect not found." }); return; }

      const data = snap.data()!;
      if (data.agencyId !== agencyId) { res.status(403).json({ error: "Forbidden." }); return; }

      res.json({ id: snap.id, ...data });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to fetch prospect." });
    }
  });

  // ── POST /api/prospects — create prospect ──────────────────────────────────
  router.post("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const {
        orgName, city, expectedSiteType, expectedGuardCount,
        expectedMonthlyValue, leadSource,
        contactName, contactDesignation, primaryPhone, alternatePhone, email,
        status, followUpDate,
      } = req.body as Record<string, unknown>;

      if (!orgName || typeof orgName !== "string" || !orgName.trim()) {
        res.status(400).json({ error: "orgName is required." }); return;
      }
      if (!contactName || typeof contactName !== "string" || !contactName.trim()) {
        res.status(400).json({ error: "contactName is required." }); return;
      }
      if (!primaryPhone || typeof primaryPhone !== "string" || !primaryPhone.trim()) {
        res.status(400).json({ error: "primaryPhone is required." }); return;
      }

      const adminDb = getFirestore();
      const now = FieldValue.serverTimestamp();
      const data = {
        agencyId,
        orgName: String(orgName).trim(),
        city: String(city ?? "").trim(),
        expectedSiteType: String(expectedSiteType ?? "").trim(),
        expectedGuardCount: typeof expectedGuardCount === "number" ? expectedGuardCount : null,
        expectedMonthlyValue: String(expectedMonthlyValue ?? "").trim(),
        leadSource: String(leadSource ?? "other").trim(),
        contactName: String(contactName).trim(),
        contactDesignation: String(contactDesignation ?? "").trim(),
        primaryPhone: String(primaryPhone).trim(),
        alternatePhone: String(alternatePhone ?? "").trim(),
        email: String(email ?? "").trim(),
        status: String(status ?? "initial_contact"),
        followUpDate: followUpDate ? String(followUpDate) : null,
        createdAt: now,
        updatedAt: now,
      };

      const ref = await adminDb.collection(PROSPECT_CLIENTS_COLLECTION).add(data);
      res.status(201).json({ id: ref.id, ...data });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to create prospect." });
    }
  });

  // ── PATCH /api/prospects/:id — update prospect ─────────────────────────────
  router.patch("/:id", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const adminDb = getFirestore();
      const docRef = adminDb.collection(PROSPECT_CLIENTS_COLLECTION).doc(req.params.id);
      const existing = await docRef.get();
      if (!existing.exists) { res.status(404).json({ error: "Prospect not found." }); return; }
      if (existing.data()!.agencyId !== agencyId) { res.status(403).json({ error: "Forbidden." }); return; }

      const allowed = [
        "orgName", "city", "expectedSiteType", "expectedGuardCount",
        "expectedMonthlyValue", "leadSource",
        "contactName", "contactDesignation", "primaryPhone", "alternatePhone", "email",
        "status", "followUpDate",
      ];

      const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
      for (const key of allowed) {
        if (key in req.body) {
          updates[key] = req.body[key] ?? null;
        }
      }

      await docRef.update(updates);
      res.json({ id: req.params.id, ...existing.data(), ...updates });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to update prospect." });
    }
  });

  // ── DELETE /api/prospects/:id — delete prospect + all its notes ─────────────
  router.delete("/:id", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const adminDb = getFirestore();
      const docRef = adminDb.collection(PROSPECT_CLIENTS_COLLECTION).doc(req.params.id);
      const existing = await docRef.get();
      if (!existing.exists) { res.status(404).json({ error: "Prospect not found." }); return; }
      if (existing.data()!.agencyId !== agencyId) { res.status(403).json({ error: "Forbidden." }); return; }

      // Delete all notes in the subcollection first
      const notesSnap = await docRef.collection(PROSPECT_NOTES_SUBCOLLECTION).get();
      const batch = adminDb.batch();
      notesSnap.docs.forEach((d) => batch.delete(d.ref));
      batch.delete(docRef);
      await batch.commit();

      res.json({ deleted: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to delete prospect." });
    }
  });

  // ── GET /api/prospects/:id/notes — list notes (newest first) ──────────────
  router.get("/:id/notes", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const adminDb = getFirestore();
      // Verify ownership
      const parent = await adminDb.collection(PROSPECT_CLIENTS_COLLECTION).doc(req.params.id).get();
      if (!parent.exists) { res.status(404).json({ error: "Prospect not found." }); return; }
      if (parent.data()!.agencyId !== agencyId) { res.status(403).json({ error: "Forbidden." }); return; }

      const snap = await adminDb
        .collection(PROSPECT_CLIENTS_COLLECTION)
        .doc(req.params.id)
        .collection(PROSPECT_NOTES_SUBCOLLECTION)
        .get();

      const notes = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTs = (a as Record<string, unknown>).createdAt as { seconds?: number } | null;
          const bTs = (b as Record<string, unknown>).createdAt as { seconds?: number } | null;
          return (bTs?.seconds ?? 0) - (aTs?.seconds ?? 0);
        });
      res.json(notes);
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to fetch notes." });
    }
  });

  // ── POST /api/prospects/:id/notes — add note ──────────────────────────────
  router.post("/:id/notes", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const { content, authorName } = req.body as { content?: string; authorName?: string };
      if (!content || !content.trim()) {
        res.status(400).json({ error: "Note content is required." }); return;
      }

      const adminDb = getFirestore();
      const parentRef = adminDb.collection(PROSPECT_CLIENTS_COLLECTION).doc(req.params.id);
      const parent = await parentRef.get();
      if (!parent.exists) { res.status(404).json({ error: "Prospect not found." }); return; }
      if (parent.data()!.agencyId !== agencyId) { res.status(403).json({ error: "Forbidden." }); return; }

      const now = FieldValue.serverTimestamp();
      const noteData = {
        authorName: String(authorName ?? "Admin").trim(),
        content: content.trim(),
        createdAt: now,
      };

      const ref = await parentRef.collection(PROSPECT_NOTES_SUBCOLLECTION).add(noteData);
      res.status(201).json({ id: ref.id, ...noteData });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to add note." });
    }
  });

  // ── DELETE /api/prospects/:id/notes/:noteId — delete note ─────────────────
  router.delete("/:id/notes/:noteId", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const adminDb = getFirestore();
      const parent = await adminDb.collection(PROSPECT_CLIENTS_COLLECTION).doc(req.params.id).get();
      if (!parent.exists) { res.status(404).json({ error: "Prospect not found." }); return; }
      if (parent.data()!.agencyId !== agencyId) { res.status(403).json({ error: "Forbidden." }); return; }

      await adminDb
        .collection(PROSPECT_CLIENTS_COLLECTION)
        .doc(req.params.id)
        .collection(PROSPECT_NOTES_SUBCOLLECTION)
        .doc(req.params.noteId)
        .delete();

      res.json({ deleted: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to delete note." });
    }
  });

  return router;
}
