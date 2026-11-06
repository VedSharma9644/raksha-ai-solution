import { Router, type Response } from "express";
import { listGuardUpcomingSchedule } from "@raskha/attendance";

import {
  type AuthedRequest,
  requireGuardAuth,
} from "../middleware/requireGuardAuth";

export function createScheduleRoutes(): Router {
  const router = Router();
  router.use(requireGuardAuth);

  /**
   * GET /api/schedule/upcoming?days=14
   * Roster-only upcoming shifts (no attendance overlay).
   */
  router.get("/upcoming", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const days = Number(req.query.days ?? 14);
      const schedule = await listGuardUpcomingSchedule({
        guardId: req.guard.guardId,
        agencyId: req.guard.agencyId,
        siteName: req.guard.siteName,
        postName: req.guard.postName,
        shiftFrom: req.guard.shiftFrom,
        shiftTo: req.guard.shiftTo,
        days: Number.isFinite(days) ? days : 14,
      });

      res.json(schedule);
    } catch (error: unknown) {
      const err = error as { message?: string };
      res
        .status(500)
        .json({ error: err.message ?? "Failed to load schedule." });
    }
  });

  return router;
}
