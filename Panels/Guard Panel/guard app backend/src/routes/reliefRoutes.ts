import { Router, type Response } from "express";
import {
  isReliefMethod,
  isReliefReason,
  listReliefRequestsForGuard,
  submitReliefRequest,
  withdrawReliefRequest,
} from "@raskha/relief";

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

export function createReliefRoutes(): Router {
  const router = Router();

  router.use(requireGuardAuth);

  router.get("/requests", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }
      const statusRaw = String(req.query.status ?? "all");
      const status =
        statusRaw === "pending" ||
        statusRaw === "approved" ||
        statusRaw === "rejected" ||
        statusRaw === "all"
          ? statusRaw
          : "all";

      const result = await listReliefRequestsForGuard({
        guard: req.guard,
        status,
      });
      res.json(result);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load relief requests."),
      });
    }
  });

  router.post("/requests", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const method = req.body?.method;
      const reason = req.body?.reason;
      if (!isReliefMethod(method)) {
        res.status(400).json({
          error: "method must be remaining, swap, or cover.",
        });
        return;
      }
      if (!isReliefReason(reason)) {
        res.status(400).json({ error: "Please select a valid reason." });
        return;
      }

      const result = await submitReliefRequest({
        guard: req.guard,
        method,
        reason,
        note: typeof req.body?.note === "string" ? req.body.note : "",
        dutyDate:
          typeof req.body?.dutyDate === "string" ? req.body.dutyDate : undefined,
        shiftFrom:
          typeof req.body?.shiftFrom === "string"
            ? req.body.shiftFrom
            : undefined,
        shiftTo:
          typeof req.body?.shiftTo === "string" ? req.body.shiftTo : undefined,
        siteId:
          typeof req.body?.siteId === "string" ? req.body.siteId : undefined,
        siteName:
          typeof req.body?.siteName === "string"
            ? req.body.siteName
            : undefined,
        postName:
          typeof req.body?.postName === "string"
            ? req.body.postName
            : undefined,
        handoverFrom:
          typeof req.body?.handoverFrom === "string"
            ? req.body.handoverFrom
            : undefined,
      });
      res.status(201).json(result);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to submit relief request."),
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
        const result = await withdrawReliefRequest({
          guard: req.guard,
          requestId: String(req.params.id ?? ""),
        });
        res.json(result);
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to withdraw relief request."),
        });
      }
    }
  );

  return router;
}
