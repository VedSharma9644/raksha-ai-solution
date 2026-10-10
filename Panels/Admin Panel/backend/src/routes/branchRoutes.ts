import { Router } from "express";
import { getFirestore } from "firebase-admin/firestore";
import { requireAgencyCaller } from "../middleware/requireAgencyCaller";
import type { Request, Response } from "express";

const BRANCHES_COLLECTION = "branches";

export function createBranchRoutes(): Router {
  const router = Router();

  // All branch routes require an authenticated agency caller
  router.use(requireAgencyCaller);

  // GET /api/branches — list all branches for the agency
  router.get("/", async (req: Request, res: Response) => {
    try {
      const agencyId = (req as Request & { agencyId: string }).agencyId;
      const db = getFirestore();
      const snap = await db
        .collection(BRANCHES_COLLECTION)
        .where("agencyId", "==", agencyId)
        .get();
      const branches = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.json(branches);
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to fetch branches." });
    }
  });

  // GET /api/branches/:id — get a single branch
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const agencyId = (req as Request & { agencyId: string }).agencyId;
      const branchId = String(req.params.id);
      const db = getFirestore();
      const ref = db.collection(BRANCHES_COLLECTION).doc(branchId);
      const snap = await ref.get();
      if (!snap.exists) {
        res.status(404).json({ error: "Branch not found." });
        return;
      }
      const data = snap.data() as { agencyId?: string };
      if (data.agencyId !== agencyId) {
        res.status(403).json({ error: "Access denied." });
        return;
      }
      res.json({ id: snap.id, ...data });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to fetch branch." });
    }
  });

  // POST /api/branches — create a new branch
  router.post("/", async (req: Request, res: Response) => {
    try {
      const agencyId = (req as Request & { agencyId: string }).agencyId;
      const { name, city, address, phone, managerName } = req.body as {
        name?: string;
        city?: string;
        address?: string;
        phone?: string;
        managerName?: string;
      };
      if (!name?.trim() || !city?.trim()) {
        res.status(400).json({ error: "name and city are required." });
        return;
      }
      const db = getFirestore();
      const now = new Date();
      const data = {
        agencyId,
        name: name.trim(),
        city: city.trim(),
        address: address?.trim() ?? "",
        phone: phone?.trim() ?? "",
        managerName: managerName?.trim() ?? "",
        status: "active",
        createdAt: now,
        updatedAt: now,
      };
      const ref = await db.collection(BRANCHES_COLLECTION).add(data);
      res.status(201).json({ id: ref.id, ...data });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to create branch." });
    }
  });

  // PUT /api/branches/:id — update a branch
  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const agencyId = (req as Request & { agencyId: string }).agencyId;
      const branchId = String(req.params.id);
      const db = getFirestore();
      const ref = db.collection(BRANCHES_COLLECTION).doc(branchId);
      const snap = await ref.get();
      if (!snap.exists) {
        res.status(404).json({ error: "Branch not found." });
        return;
      }
      const existing = snap.data() as { agencyId?: string };
      if (existing.agencyId !== agencyId) {
        res.status(403).json({ error: "Access denied." });
        return;
      }
      const { name, city, address, phone, managerName, status } = req.body as {
        name?: string;
        city?: string;
        address?: string;
        phone?: string;
        managerName?: string;
        status?: "active" | "inactive";
      };
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (name !== undefined) updates.name = name.trim();
      if (city !== undefined) updates.city = city.trim();
      if (address !== undefined) updates.address = address.trim();
      if (phone !== undefined) updates.phone = phone.trim();
      if (managerName !== undefined) updates.managerName = managerName.trim();
      if (status !== undefined) updates.status = status;
      await ref.update(updates);
      res.json({ id: branchId, ...existing, ...updates });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to update branch." });
    }
  });

  // DELETE /api/branches/:id — delete a branch
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const agencyId = (req as Request & { agencyId: string }).agencyId;
      const branchId = String(req.params.id);
      const db = getFirestore();
      const ref = db.collection(BRANCHES_COLLECTION).doc(branchId);
      const snap = await ref.get();
      if (!snap.exists) {
        res.status(404).json({ error: "Branch not found." });
        return;
      }
      const data = snap.data() as { agencyId?: string };
      if (data.agencyId !== agencyId) {
        res.status(403).json({ error: "Access denied." });
        return;
      }
      await ref.delete();
      res.json({ success: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      res.status(500).json({ error: e.message ?? "Failed to delete branch." });
    }
  });

  return router;
}
