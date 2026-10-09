import { Router, type Response } from "express";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { requireAgencyCaller, type AgencyAuthRequest } from "../middleware/requireAgencyCaller";

// Inline collection constants — avoids importing firebase/firestore (browser SDK) in Node.js
const PROSPECT_GUARDS_COLLECTION = "prospectGuards";
const PROSPECT_GUARD_NOTES_SUBCOLLECTION = "notes";

export function createProspectGuardRoutes(): Router {
  const router = Router();

  router.use(requireAgencyCaller);

  // ── GET /api/prospect-guards — list by agency (optional ?status=) ────────────
  router.get("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const adminDb = getFirestore();

      let q = adminDb
        .collection(PROSPECT_GUARDS_COLLECTION)
        .where("agencyId", "==", agencyId) as FirebaseFirestore.Query;

      const { status } = req.query;
      if (status && typeof status === "string") {
        q = q.where("status", "==", status);
      }

      const snap = await q.get();
      const guards = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTs = (a as Record<string, unknown>).createdAt as { seconds?: number } | null;
          const bTs = (b as Record<string, unknown>).createdAt as { seconds?: number } | null;
          return (bTs?.seconds ?? 0) - (aTs?.seconds ?? 0);
        });

      res.json(guards);
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to fetch prospect guards." });
    }
  });

  // ── GET /api/prospect-guards/:id — single record ─────────────────────────────
  router.get("/:id", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const adminDb = getFirestore();
      const snap = await adminDb.collection(PROSPECT_GUARDS_COLLECTION).doc(req.params.id).get();
      if (!snap.exists) { res.status(404).json({ error: "Prospect guard not found." }); return; }

      const data = snap.data()!;
      if (data.agencyId !== agencyId) { res.status(403).json({ error: "Forbidden." }); return; }

      res.json({ id: snap.id, ...data });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to fetch prospect guard." });
    }
  });

  // ── POST /api/prospect-guards — create ────────────────────────────────────────
  router.post("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const {
        fullName, dateOfBirth, gender, city,
        phone, alternatePhone, email,
        aadhaarNumber, panNumber,
        yearsOfExperience, previousEmployer,
        height, weight, physicalFitness,
        interviewDate, interviewerName,
        applicationSource, status, followUpDate,
      } = req.body as Record<string, unknown>;

      if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
        res.status(400).json({ error: "fullName is required." }); return;
      }
      if (!phone || typeof phone !== "string" || !phone.trim()) {
        res.status(400).json({ error: "phone is required." }); return;
      }

      const adminDb = getFirestore();
      const now = FieldValue.serverTimestamp();
      const data = {
        agencyId,
        fullName: String(fullName).trim(),
        dateOfBirth: dateOfBirth ? String(dateOfBirth) : null,
        gender: String(gender ?? "").trim(),
        city: String(city ?? "").trim(),
        phone: String(phone).trim(),
        alternatePhone: String(alternatePhone ?? "").trim(),
        email: String(email ?? "").trim(),
        aadhaarNumber: String(aadhaarNumber ?? "").trim(),
        panNumber: String(panNumber ?? "").trim(),
        yearsOfExperience: typeof yearsOfExperience === "number" ? yearsOfExperience : null,
        previousEmployer: String(previousEmployer ?? "").trim(),
        height: String(height ?? "").trim(),
        weight: String(weight ?? "").trim(),
        physicalFitness: String(physicalFitness ?? "").trim(),
        interviewDate: interviewDate ? String(interviewDate) : null,
        interviewerName: String(interviewerName ?? "").trim(),
        applicationSource: String(applicationSource ?? "other").trim(),
        status: String(status ?? "applied"),
        followUpDate: followUpDate ? String(followUpDate) : null,
        createdAt: now,
        updatedAt: now,
      };

      const ref = await adminDb.collection(PROSPECT_GUARDS_COLLECTION).add(data);
      res.status(201).json({ id: ref.id, ...data });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to create prospect guard." });
    }
  });

  // ── PATCH /api/prospect-guards/:id — update ───────────────────────────────────
  router.patch("/:id", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const adminDb = getFirestore();
      const docRef = adminDb.collection(PROSPECT_GUARDS_COLLECTION).doc(req.params.id);
      const existing = await docRef.get();
      if (!existing.exists) { res.status(404).json({ error: "Prospect guard not found." }); return; }
      if (existing.data()!.agencyId !== agencyId) { res.status(403).json({ error: "Forbidden." }); return; }

      const allowed = [
        "fullName", "dateOfBirth", "gender", "city",
        "phone", "alternatePhone", "email",
        "aadhaarNumber", "panNumber",
        "yearsOfExperience", "previousEmployer",
        "height", "weight", "physicalFitness",
        "interviewDate", "interviewerName",
        "applicationSource", "status", "followUpDate",
      ];

      const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
      for (const key of allowed) {
        if (key in req.body) updates[key] = req.body[key] ?? null;
      }

      await docRef.update(updates);
      res.json({ id: req.params.id, ...existing.data(), ...updates });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to update prospect guard." });
    }
  });

  // ── DELETE /api/prospect-guards/:id — delete + notes subcollection ────────────
  router.delete("/:id", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const adminDb = getFirestore();
      const docRef = adminDb.collection(PROSPECT_GUARDS_COLLECTION).doc(req.params.id);
      const existing = await docRef.get();
      if (!existing.exists) { res.status(404).json({ error: "Prospect guard not found." }); return; }
      if (existing.data()!.agencyId !== agencyId) { res.status(403).json({ error: "Forbidden." }); return; }

      const notesSnap = await docRef.collection(PROSPECT_GUARD_NOTES_SUBCOLLECTION).get();
      const batch = adminDb.batch();
      notesSnap.docs.forEach((d) => batch.delete(d.ref));
      batch.delete(docRef);
      await batch.commit();

      res.json({ deleted: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to delete prospect guard." });
    }
  });

  // ── GET /api/prospect-guards/:id/notes — list notes ───────────────────────────
  router.get("/:id/notes", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const adminDb = getFirestore();
      const parent = await adminDb.collection(PROSPECT_GUARDS_COLLECTION).doc(req.params.id).get();
      if (!parent.exists) { res.status(404).json({ error: "Prospect guard not found." }); return; }
      if (parent.data()!.agencyId !== agencyId) { res.status(403).json({ error: "Forbidden." }); return; }

      const snap = await adminDb
        .collection(PROSPECT_GUARDS_COLLECTION)
        .doc(req.params.id)
        .collection(PROSPECT_GUARD_NOTES_SUBCOLLECTION)
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

  // ── POST /api/prospect-guards/:id/notes — add note ────────────────────────────
  router.post("/:id/notes", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const { content, authorName } = req.body as { content?: string; authorName?: string };
      if (!content || !content.trim()) {
        res.status(400).json({ error: "Note content is required." }); return;
      }

      const adminDb = getFirestore();
      const parentRef = adminDb.collection(PROSPECT_GUARDS_COLLECTION).doc(req.params.id);
      const parent = await parentRef.get();
      if (!parent.exists) { res.status(404).json({ error: "Prospect guard not found." }); return; }
      if (parent.data()!.agencyId !== agencyId) { res.status(403).json({ error: "Forbidden." }); return; }

      const now = FieldValue.serverTimestamp();
      const noteData = {
        authorName: String(authorName ?? "Admin").trim(),
        content: content.trim(),
        createdAt: now,
      };

      const ref = await parentRef.collection(PROSPECT_GUARD_NOTES_SUBCOLLECTION).add(noteData);
      res.status(201).json({ id: ref.id, ...noteData });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to add note." });
    }
  });

  // ── DELETE /api/prospect-guards/:id/notes/:noteId — delete note ───────────────
  router.delete("/:id/notes/:noteId", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) { res.status(401).json({ error: "Unauthorized." }); return; }

      const adminDb = getFirestore();
      const parent = await adminDb.collection(PROSPECT_GUARDS_COLLECTION).doc(req.params.id).get();
      if (!parent.exists) { res.status(404).json({ error: "Prospect guard not found." }); return; }
      if (parent.data()!.agencyId !== agencyId) { res.status(403).json({ error: "Forbidden." }); return; }

      await adminDb
        .collection(PROSPECT_GUARDS_COLLECTION)
        .doc(req.params.id)
        .collection(PROSPECT_GUARD_NOTES_SUBCOLLECTION)
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
