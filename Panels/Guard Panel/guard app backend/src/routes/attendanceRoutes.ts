import { Router, type Response } from "express";
import {
  checkGeofence,
  getSiteGeofenceById,
  getTodayOpenPunchIn,
  listAttendanceHistory,
  markPunchIn,
  markPunchOut,
  type SiteGeofenceContext,
} from "@raskha/attendance";

import {
  type AuthedRequest,
  requireGuardAuth,
} from "../middleware/requireGuardAuth";
import {
  isGeofenceUnlocked,
  markGeofenceUnlocked,
} from "../sessionStore";

function isDemoMode(): boolean {
  return process.env.ATTENDANCE_DEMO_MODE !== "false";
}

async function resolveAssignedSite(
  req: AuthedRequest
): Promise<SiteGeofenceContext | null> {
  const siteId = req.guard?.assignedSiteId;
  if (!siteId) {
    return null;
  }
  return getSiteGeofenceById(siteId);
}

export function createAttendanceRoutes(): Router {
  const router = Router();

  router.use(requireGuardAuth);

  router.post("/geofence-check", async (req: AuthedRequest, res: Response) => {
    try {
      const lat = Number(req.body?.lat);
      const lng = Number(req.body?.lng);
      const accuracyMeters = Number(req.body?.accuracyMeters ?? 5);
      const site = await resolveAssignedSite(req);

      if (site && req.guard) {
        req.guard.siteName = site.siteName;
      }

      const result = checkGeofence({
        lat,
        lng,
        accuracyMeters: Number.isFinite(accuracyMeters) ? accuracyMeters : 5,
        site,
        demoMode: isDemoMode(),
      });

      if (result.unlocked && req.guardToken) {
        markGeofenceUnlocked(req.guardToken);
      }

      res.json({
        unlocked: result.unlocked,
        status: result.status,
        accuracyMeters: result.accuracyMeters,
        distanceMeters: result.distanceMeters,
        message: result.message,
        cameraUnlocked: result.unlocked,
        site: site
          ? {
              id: site.siteId,
              name: site.siteName,
              latitude: site.latitude,
              longitude: site.longitude,
              geofenceRadiusMeters: site.geofenceRadiusMeters,
            }
          : null,
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Geofence check failed." });
    }
  });

  router.post("/punch-in", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard || !req.guardToken) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const lat = Number(req.body?.lat);
      const lng = Number(req.body?.lng);
      const accuracyMeters = Number(req.body?.accuracyMeters ?? 5);
      const selfieBase64 =
        typeof req.body?.selfieBase64 === "string" ? req.body.selfieBase64 : "";

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        res.status(400).json({ error: "lat and lng are required." });
        return;
      }

      if (!selfieBase64) {
        res.status(400).json({ error: "selfieBase64 is required." });
        return;
      }

      const site = await resolveAssignedSite(req);
      if (site) {
        req.guard.siteName = site.siteName;
      }

      const accuracy = Number.isFinite(accuracyMeters) ? accuracyMeters : 5;
      const geofence = checkGeofence({
        lat,
        lng,
        accuracyMeters: accuracy,
        site,
        demoMode: isDemoMode(),
      });

      const unlocked = isGeofenceUnlocked(req.guardToken) || geofence.unlocked;

      if (!unlocked) {
        res.status(403).json({
          error:
            geofence.message ||
            "Camera not unlocked. Complete geofence check at the site first.",
          distanceMeters: geofence.distanceMeters,
        });
        return;
      }

      const result = await markPunchIn({
        guard: req.guard,
        lat,
        lng,
        accuracyMeters: accuracy,
        selfieBase64,
        site,
        demoMode: isDemoMode(),
      });

      res.status(201).json(result);
    } catch (error: unknown) {
      const err = error as { message?: string };
      const message = err.message ?? "Punch-in failed.";
      const status = message.includes("already recorded") ? 409 : 400;
      res.status(status).json({ error: message });
    }
  });

  router.post("/punch-out", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard || !req.guardToken) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const lat = Number(req.body?.lat);
      const lng = Number(req.body?.lng);
      const accuracyMeters = Number(req.body?.accuracyMeters ?? 5);
      const selfieBase64 =
        typeof req.body?.selfieBase64 === "string" ? req.body.selfieBase64 : "";

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        res.status(400).json({ error: "lat and lng are required." });
        return;
      }

      if (!selfieBase64) {
        res.status(400).json({ error: "selfieBase64 is required." });
        return;
      }

      const site = await resolveAssignedSite(req);
      if (site) {
        req.guard.siteName = site.siteName;
      }

      const accuracy = Number.isFinite(accuracyMeters) ? accuracyMeters : 5;
      const geofence = checkGeofence({
        lat,
        lng,
        accuracyMeters: accuracy,
        site,
        demoMode: isDemoMode(),
      });

      const unlocked = isGeofenceUnlocked(req.guardToken) || geofence.unlocked;
      if (!unlocked) {
        res.status(403).json({
          error:
            geofence.message ||
            "You must be at the duty site to end your shift.",
          distanceMeters: geofence.distanceMeters,
        });
        return;
      }

      const result = await markPunchOut({
        guard: req.guard,
        lat,
        lng,
        accuracyMeters: accuracy,
        selfieBase64,
        site,
        demoMode: isDemoMode(),
      });

      res.status(201).json(result);
    } catch (error: unknown) {
      const err = error as { message?: string };
      const message = err.message ?? "Punch-out failed.";
      const status = message.includes("No active shift") ? 409 : 400;
      res.status(status).json({ error: message });
    }
  });

  router.get("/today", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const open = await getTodayOpenPunchIn(req.guard.guardId);
      res.json({
        shiftActive: Boolean(open),
        openPunchInId: open?.id ?? null,
        punchedAt: open?.punchedAt?.toISOString?.() ?? null,
        siteName: open?.siteName ?? req.guard.siteName,
        postName: open?.postName ?? req.guard.postName,
        guard: {
          employeeCode: req.guard.employeeCode,
          fullName: req.guard.fullName,
          siteName: req.guard.siteName,
          postName: req.guard.postName,
        },
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Failed to load today status." });
    }
  });

  /**
   * GET /api/attendance/history?year=2026&month=10
   */
  router.get("/history", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const now = new Date();
      const year = Number(req.query.year ?? now.getFullYear());
      const month = Number(req.query.month ?? now.getMonth() + 1);

      if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
      ) {
        res.status(400).json({ error: "Invalid year or month." });
        return;
      }

      const history = await listAttendanceHistory({
        guardId: req.guard.guardId,
        year,
        month,
        postName: req.guard.postName,
        shiftFrom: req.guard.shiftFrom,
        shiftTo: req.guard.shiftTo,
      });

      res.json(history);
    } catch (error: unknown) {
      const err = error as { message?: string };
      res
        .status(500)
        .json({ error: err.message ?? "Failed to load attendance history." });
    }
  });

  return router;
}
