import type { Firestore } from "firebase/firestore";
import { Router, type Request, type Response } from "express";
import {
  addGuard,
  getGuardById,
  listGuardsByAgency,
  updateGuard,
  deleteGuard,
} from "@raskha/guard-management";

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
        employeeCode,
        phone,
        email,
        assignedSiteId: assignedSiteId ?? "",
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

  // PUT /api/guards/:id — update a guard
  router.put("/:id", async (req: Request, res: Response) => {
    try {
      await updateGuard(db, req.params.id, req.body);
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
