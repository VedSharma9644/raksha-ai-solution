import { Router, type Request, type Response } from "express";
import {
  authenticateGuard,
  requestGuardLoginOtp,
  verifyGuardLoginOtp,
} from "@raskha/attendance";

import { createSession } from "../sessionStore";

function isDemoMode(): boolean {
  return process.env.ATTENDANCE_DEMO_MODE !== "false";
}

function sessionPayload(token: string, guard: {
  guardId: string;
  employeeCode: string;
  fullName: string;
  agencyId: string;
  assignedSiteId: string;
  siteName: string;
  postName: string;
  shiftFrom: string;
  shiftTo: string;
}) {
  return {
    token,
    guard: {
      id: guard.guardId,
      employeeCode: guard.employeeCode,
      fullName: guard.fullName,
      agencyId: guard.agencyId,
      assignedSiteId: guard.assignedSiteId,
      siteName: guard.siteName,
      postName: guard.postName,
      shiftFrom: guard.shiftFrom,
      shiftTo: guard.shiftTo,
    },
  };
}

function readIdentifier(body: Record<string, unknown>): string {
  const candidates = [
    body.identifier,
    body.guardId,
    body.employeeCode,
    body.phone,
    body.mobile,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

export function createAuthRoutes(): Router {
  const router = Router();

  /**
   * POST /api/auth/login
   * Body: { identifier | employeeCode | phone | guardId, password }
   */
  router.post("/login", async (req: Request, res: Response) => {
    try {
      const identifier = readIdentifier(req.body as Record<string, unknown>);
      const password =
        typeof req.body?.password === "string" ? req.body.password : "";

      if (!identifier || !password) {
        res.status(400).json({
          error: "Mobile number or Guard ID, and password, are required.",
        });
        return;
      }

      const guard = await authenticateGuard({
        identifier,
        password,
        demoMode: isDemoMode(),
      });

      if (!guard) {
        res.status(401).json({
          error: "Invalid mobile / Guard ID or password.",
        });
        return;
      }

      const token = createSession(guard);
      res.json(sessionPayload(token, guard));
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({ error: err.message ?? "Login failed." });
    }
  });

  /**
   * POST /api/auth/otp/request
   * Forgot password / OTP login — send code to registered mobile.
   */
  router.post("/otp/request", async (req: Request, res: Response) => {
    try {
      const phone =
        typeof req.body?.phone === "string"
          ? req.body.phone
          : typeof req.body?.mobile === "string"
            ? req.body.mobile
            : "";

      if (!phone.trim()) {
        res.status(400).json({ error: "Mobile number is required." });
        return;
      }

      const result = await requestGuardLoginOtp({
        phone,
        demoMode: isDemoMode(),
      });

      res.json({
        ok: true,
        maskedPhone: result.maskedPhone,
        expiresInSeconds: result.expiresInSeconds,
        ...(result.debugOtp ? { debugOtp: result.debugOtp } : {}),
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      const message = err.message ?? "Failed to send OTP.";
      const status = message.includes("No guard") ? 404 : 400;
      res.status(status).json({ error: message });
    }
  });

  /**
   * POST /api/auth/otp/verify
   * Verify OTP and create a duty session (password-reset login path).
   */
  router.post("/otp/verify", async (req: Request, res: Response) => {
    try {
      const phone =
        typeof req.body?.phone === "string"
          ? req.body.phone
          : typeof req.body?.mobile === "string"
            ? req.body.mobile
            : "";
      const otp = typeof req.body?.otp === "string" ? req.body.otp : "";

      if (!phone.trim() || !otp.trim()) {
        res.status(400).json({ error: "Mobile number and OTP are required." });
        return;
      }

      const { guard } = await verifyGuardLoginOtp({
        phone,
        otp,
        demoMode: isDemoMode(),
      });

      const token = createSession(guard);
      res.json(sessionPayload(token, guard));
    } catch (error: unknown) {
      const err = error as { message?: string };
      const message = err.message ?? "OTP verification failed.";
      const status = message.includes("Too many") ? 429 : 400;
      res.status(status).json({ error: message });
    }
  });

  return router;
}
