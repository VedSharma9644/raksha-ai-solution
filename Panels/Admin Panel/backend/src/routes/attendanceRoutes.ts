import { Router, type Response } from "express";
import { listAgencyAttendanceForDate } from "@raskha/attendance";

import {
  requireAgencyCaller,
  type AgencyAuthRequest,
} from "../middleware/requireAgencyCaller";

function statusCodeOf(error: unknown): number {
  const err = error as { statusCode?: number };
  return typeof err.statusCode === "number" ? err.statusCode : 500;
}

function messageOf(error: unknown, fallback: string): string {
  const err = error as { message?: string };
  return err.message ?? fallback;
}

/**
 * Agency / HR attendance overview for Guard Attendance screens.
 */
export function createAttendanceRoutes(): Router {
  const router = Router();

  router.use(requireAgencyCaller);

  router.get("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const date =
        typeof req.query.date === "string" && req.query.date.trim()
          ? req.query.date.trim()
          : new Intl.DateTimeFormat("en-CA", {
              timeZone: "Asia/Kolkata",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date());

      const siteId =
        typeof req.query.siteId === "string" ? req.query.siteId.trim() : undefined;

      const result = await listAgencyAttendanceForDate({
        agencyId,
        date,
        siteId: siteId && siteId !== "all" ? siteId : undefined,
      });

      res.json(result);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load attendance."),
      });
    }
  });

  return router;
}
