import { Router, type Response } from "express";
import { getGuardProfile } from "@raskha/attendance";

import {
  type AuthedRequest,
  requireGuardAuth,
} from "../middleware/requireGuardAuth";

export function createProfileRoutes(): Router {
  const router = Router();

  router.use(requireGuardAuth);

  /** GET /api/profile — agency, site HR, gear inventory, compliance flags */
  router.get("/", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const profile = await getGuardProfile({
        guardId: req.guard.guardId,
        agencyId: req.guard.agencyId,
        employeeCode: req.guard.employeeCode,
        fullName: req.guard.fullName,
        postName: req.guard.postName,
        profilePictureUrl: req.guard.profilePictureUrl,
        assignedSiteId: req.guard.assignedSiteId,
        profileShiftFrom: req.guard.shiftFrom,
        profileShiftTo: req.guard.shiftTo,
        profileSiteName: req.guard.siteName,
      });

      res.json(profile);
    } catch (error: unknown) {
      const err = error as { message?: string };
      res
        .status(500)
        .json({ error: err.message ?? "Failed to load guard profile." });
    }
  });

  return router;
}
