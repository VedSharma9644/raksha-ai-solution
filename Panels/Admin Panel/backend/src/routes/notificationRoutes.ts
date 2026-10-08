import { Router, type Response } from "express";

import {
  requireAgencyCaller,
  type AgencyAuthRequest,
} from "../middleware/requireAgencyCaller";
import { listAgencyNotifications } from "../services/agencyNotifications";

function statusCodeOf(error: unknown): number {
  const err = error as { statusCode?: number };
  return typeof err.statusCode === "number" ? err.statusCode : 500;
}

function messageOf(error: unknown, fallback: string): string {
  const err = error as { message?: string };
  return err.message ?? fallback;
}

export function createNotificationRoutes(): Router {
  const router = Router();

  router.use(requireAgencyCaller);

  router.get("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const result = await listAgencyNotifications(agencyId);
      res.json(result);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load notifications."),
      });
    }
  });

  return router;
}
