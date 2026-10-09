import { Router, type Response } from "express";
import {
  checkGeofence,
  createSelfieUploadUrl,
  getSiteGeofenceById,
  getTodayOpenPunchIn,
  listAttendanceHistory,
  markPunchIn,
  markPunchOut,
  resolveTodayDuty,
  type SiteGeofenceContext,
  type TodayDutyResolution,
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

function readLoadTestId(req: AuthedRequest): string | undefined {
  if (!isDemoMode() || process.env.LOAD_TEST_ALLOW_MULTI_PUNCH !== "true") {
    return undefined;
  }
  const header = req.header("x-load-test-id");
  if (typeof header === "string" && header.trim()) {
    return header.trim().slice(0, 64);
  }
  const bodyId = (req.body as { loadTestId?: unknown })?.loadTestId;
  if (typeof bodyId === "string" && bodyId.trim()) {
    return bodyId.trim().slice(0, 64);
  }
  return undefined;
}

function statusCodeOf(error: unknown, fallback = 400): number {
  const err = error as { statusCode?: number; message?: string };
  if (typeof err.statusCode === "number") {
    return err.statusCode;
  }
  const message = err.message ?? "";
  if (message.includes("already recorded") || message.includes("No active shift")) {
    return 409;
  }
  if (message.includes("busy")) {
    return 503;
  }
  return fallback;
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

/**
 * Overlay today's roster assignment onto the request guard context so homepage,
 * geofence, and punch-in all see a same-day HR reassignment (not stale profile times).
 */
async function applyRosterDutyToRequest(
  req: AuthedRequest
): Promise<TodayDutyResolution | null> {
  if (!req.guard) {
    return null;
  }
  const open = await getTodayOpenPunchIn(req.guard.guardId);
  const duty = await resolveTodayDuty({
    guardId: req.guard.guardId,
    agencyId: req.guard.agencyId,
    profileShiftFrom: req.guard.shiftFrom,
    profileShiftTo: req.guard.shiftTo,
    profileSiteId: req.guard.assignedSiteId,
    profileSiteName: req.guard.siteName,
    profilePostName: req.guard.postName,
    hasOpenPunch: Boolean(open),
  });

  if (duty.siteId) {
    req.guard.assignedSiteId = duty.siteId;
  }
  req.guard.siteName = duty.siteName;
  req.guard.postName = duty.postName;
  req.guard.shiftFrom = duty.shiftFrom;
  req.guard.shiftTo = duty.shiftTo;
  return duty;
}

export function createAttendanceRoutes(): Router {
  const router = Router();

  router.use(requireGuardAuth);

  router.post("/geofence-check", async (req: AuthedRequest, res: Response) => {
    try {
      const lat = Number(req.body?.lat);
      const lng = Number(req.body?.lng);
      const accuracyMeters = Number(req.body?.accuracyMeters ?? 5);
      await applyRosterDutyToRequest(req);
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
        await markGeofenceUnlocked(req.guardToken);
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

  /**
   * POST /api/attendance/selfie-upload-url
   * Returns a V4 signed URL for direct JPEG upload to Storage.
   */
  router.post("/selfie-upload-url", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }
      const purposeRaw = String(req.body?.purpose ?? "punch_in_selfie");
      const purpose =
        purposeRaw === "punch_out_selfie" ? "punch_out_selfie" : "punch_in_selfie";

      const ticket = await createSelfieUploadUrl({
        agencyId: req.guard.agencyId,
        siteId: req.guard.assignedSiteId,
        guardId: req.guard.guardId,
        purpose,
        loadTestId: readLoadTestId(req),
      });
      res.json(ticket);
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(statusCodeOf(error, 500)).json({
        error: err.message ?? "Failed to create selfie upload URL.",
      });
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
      const selfieStoragePath =
        typeof req.body?.selfieStoragePath === "string"
          ? req.body.selfieStoragePath
          : "";
      const selfieUrl =
        typeof req.body?.selfieUrl === "string" ? req.body.selfieUrl : "";

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        res.status(400).json({ error: "lat and lng are required." });
        return;
      }

      if (!selfieBase64 && !selfieStoragePath) {
        res.status(400).json({
          error: "selfieStoragePath or selfieBase64 is required.",
        });
        return;
      }

      await applyRosterDutyToRequest(req);
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

      const unlocked =
        (await isGeofenceUnlocked(req.guardToken)) || geofence.unlocked;

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
        selfieBase64: selfieBase64 || undefined,
        selfieStoragePath: selfieStoragePath || undefined,
        selfieUrl: selfieUrl || undefined,
        site,
        demoMode: isDemoMode(),
        loadTestId: readLoadTestId(req),
      });

      res.status(201).json(result);
    } catch (error: unknown) {
      const err = error as { message?: string };
      const message = err.message ?? "Punch-in failed.";
      res.status(statusCodeOf(error)).json({ error: message });
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
      const selfieStoragePath =
        typeof req.body?.selfieStoragePath === "string"
          ? req.body.selfieStoragePath
          : "";
      const selfieUrl =
        typeof req.body?.selfieUrl === "string" ? req.body.selfieUrl : "";

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        res.status(400).json({ error: "lat and lng are required." });
        return;
      }

      if (!selfieBase64 && !selfieStoragePath) {
        res.status(400).json({
          error: "selfieStoragePath or selfieBase64 is required.",
        });
        return;
      }

      await applyRosterDutyToRequest(req);
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

      const unlocked =
        (await isGeofenceUnlocked(req.guardToken)) || geofence.unlocked;
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
        selfieBase64: selfieBase64 || undefined,
        selfieStoragePath: selfieStoragePath || undefined,
        selfieUrl: selfieUrl || undefined,
        site,
        demoMode: isDemoMode(),
        loadTestId: readLoadTestId(req),
      });

      res.status(201).json(result);
    } catch (error: unknown) {
      const err = error as { message?: string };
      const message = err.message ?? "Punch-out failed.";
      res.status(statusCodeOf(error)).json({ error: message });
    }
  });

  router.get("/today", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const open = await getTodayOpenPunchIn(req.guard.guardId);
      const duty = await applyRosterDutyToRequest(req);
      const site = await resolveAssignedSite(req);
      if (site && req.guard) {
        req.guard.siteName = site.siteName;
      }

      const siteName =
        open?.siteName || req.guard.siteName || duty?.siteName || "";
      const postName =
        open?.postName || req.guard.postName || duty?.postName || "";

      res.json({
        shiftActive: Boolean(open),
        openPunchInId: open?.id ?? null,
        punchedAt: open?.punchedAt?.toISOString?.() ?? null,
        punchInStatus: open?.punchInStatus ?? null,
        minutesLate: open?.minutesLate ?? null,
        siteName,
        postName,
        assignedSiteId: req.guard.assignedSiteId,
        shiftFrom: req.guard.shiftFrom,
        shiftTo: req.guard.shiftTo,
        shiftLabel: duty?.shiftLabel,
        dutySource: duty?.source ?? "profile",
        earlierShiftCount: duty?.earlierShiftCount ?? 0,
        hasLaterReplacement: duty?.hasLaterReplacement ?? false,
        assignmentId: duty?.assignmentId ?? null,
        guard: {
          employeeCode: req.guard.employeeCode,
          fullName: req.guard.fullName,
          siteName,
          postName,
          shiftFrom: req.guard.shiftFrom,
          shiftTo: req.guard.shiftTo,
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
        agencyId: req.guard.agencyId,
        year,
        month,
        postName: req.guard.postName,
        siteName: req.guard.siteName,
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
