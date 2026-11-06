import { Router, type Response } from "express";
import {
  getLeaveBalanceForGuard,
  listLeaveRequestsForGuard,
  submitLeaveRequest,
  withdrawLeaveRequest,
  type LeaveTypeKey,
} from "@raskha/leave";

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

function isLeaveType(value: unknown): value is LeaveTypeKey {
  return value === "CL" || value === "SL" || value === "EL";
}

export function createLeaveRoutes(): Router {
  const router = Router();

  router.use(requireGuardAuth);

  router.get("/balances", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }
      const year = Number(req.query.year);
      const balance = await getLeaveBalanceForGuard(
        req.guard,
        Number.isFinite(year) ? year : undefined
      );
      res.json(balance);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load leave balances."),
      });
    }
  });

  router.get("/requests", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }
      const year = Number(req.query.year);
      const statusRaw = String(req.query.status ?? "all");
      const status =
        statusRaw === "pending" ||
        statusRaw === "approved" ||
        statusRaw === "rejected" ||
        statusRaw === "all"
          ? statusRaw
          : "all";

      const result = await listLeaveRequestsForGuard({
        guard: req.guard,
        year: Number.isFinite(year) ? year : undefined,
        status,
      });
      res.json(result);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load leave requests."),
      });
    }
  });

  router.post("/requests", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const leaveType = req.body?.leaveType;
      if (!isLeaveType(leaveType)) {
        res.status(400).json({ error: "leaveType must be CL, SL, or EL." });
        return;
      }

      const result = await submitLeaveRequest({
        guard: req.guard,
        leaveType,
        startDate: String(req.body?.startDate ?? ""),
        endDate: String(req.body?.endDate ?? ""),
        reason: String(req.body?.reason ?? ""),
        note: typeof req.body?.note === "string" ? req.body.note : "",
        supervisorName:
          typeof req.body?.supervisorName === "string"
            ? req.body.supervisorName
            : undefined,
      });
      res.status(201).json(result);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to submit leave request."),
      });
    }
  });

  router.post(
    "/requests/:id/withdraw",
    async (req: AuthedRequest, res: Response) => {
      try {
        if (!req.guard) {
          res.status(401).json({ error: "Unauthorized." });
          return;
        }
        const result = await withdrawLeaveRequest({
          guard: req.guard,
          requestId: String(req.params.id ?? ""),
        });
        res.json(result);
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to withdraw leave request."),
        });
      }
    }
  );

  return router;
}
