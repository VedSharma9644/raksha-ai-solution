import { Router, type Response } from "express";
import {
  listGuardNotifications,
  markGuardNotificationsRead,
  registerGuardPushToken,
  unregisterGuardPushToken,
} from "@raskha/notifications";

import {
  type AuthedRequest,
  requireGuardAuth,
} from "../middleware/requireGuardAuth";

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
  router.use(requireGuardAuth);

  router.post("/register", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }
      const platformRaw = String(req.body?.platform ?? "unknown");
      const platform =
        platformRaw === "ios" ||
        platformRaw === "android" ||
        platformRaw === "web"
          ? platformRaw
          : "unknown";

      const result = await registerGuardPushToken({
        guardId: req.guard.guardId,
        agencyId: req.guard.agencyId,
        expoPushToken: String(req.body?.expoPushToken ?? ""),
        deviceId: String(req.body?.deviceId ?? "unknown"),
        platform,
      });
      res.status(201).json(result);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to register push token."),
      });
    }
  });

  router.post("/unregister", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }
      const result = await unregisterGuardPushToken({
        guardId: req.guard.guardId,
        deviceId:
          typeof req.body?.deviceId === "string" ? req.body.deviceId : undefined,
        expoPushToken:
          typeof req.body?.expoPushToken === "string"
            ? req.body.expoPushToken
            : undefined,
      });
      res.json(result);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to unregister push token."),
      });
    }
  });

  router.get("/", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }
      const limit = Number(req.query.limit);
      const result = await listGuardNotifications({
        guardId: req.guard.guardId,
        limit: Number.isFinite(limit) ? limit : 50,
      });
      res.json(result);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load notifications."),
      });
    }
  });

  router.post("/read", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }
      const result = await markGuardNotificationsRead({
        guardId: req.guard.guardId,
        all: Boolean(req.body?.all),
        notificationIds: Array.isArray(req.body?.notificationIds)
          ? req.body.notificationIds.map(String)
          : undefined,
      });
      res.json(result);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to update notifications."),
      });
    }
  });

  return router;
}
