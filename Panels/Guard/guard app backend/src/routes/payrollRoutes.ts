import { Router, type Response } from "express";
import { getFirestore } from "firebase-admin/firestore";
import { getGuardPayrollBreakdown } from "@raskha/payroll";

import {
  type AuthedRequest,
  requireGuardAuth,
} from "../middleware/requireGuardAuth";

const AGENCIES_COLLECTION = "agencies";
const AGENCY_MODULE_ACCESS_COLLECTION = "agencyModuleAccess";
const PAYROLL_MODULE_ID = "payroll";

function statusCodeOf(error: unknown): number {
  const err = error as { statusCode?: number };
  return typeof err.statusCode === "number" ? err.statusCode : 500;
}

function messageOf(error: unknown, fallback: string): string {
  const err = error as { message?: string };
  return err.message ?? fallback;
}

async function assertPayrollModuleEnabled(
  agencyId: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const db = getFirestore();
  const accessSnap = await db
    .collection(AGENCY_MODULE_ACCESS_COLLECTION)
    .doc(agencyId)
    .get();

  let enabled: string[] | undefined;
  if (accessSnap.exists) {
    const data = accessSnap.data() as { enabledFeatureIds?: string[] };
    enabled = Array.isArray(data.enabledFeatureIds)
      ? data.enabledFeatureIds
      : undefined;
  } else {
    const agencySnap = await db
      .collection(AGENCIES_COLLECTION)
      .doc(agencyId)
      .get();
    const data = agencySnap.data() as { enabledModules?: string[] } | undefined;
    enabled = data?.enabledModules;
  }

  if (!Array.isArray(enabled) || !enabled.includes(PAYROLL_MODULE_ID)) {
    return {
      ok: false,
      status: 403,
      error: "Payroll is not enabled for your agency.",
    };
  }
  return { ok: true };
}

/**
 * Guard-facing payroll — self-scoped only (never accept another guardId).
 */
export function createPayrollRoutes(): Router {
  const router = Router();

  router.use(requireGuardAuth);

  router.get("/me", async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.guard) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const gate = await assertPayrollModuleEnabled(req.guard.agencyId);
      if (!gate.ok) {
        res.status(gate.status).json({ error: gate.error });
        return;
      }

      const now = new Date();
      const yearRaw = Number(req.query.year);
      const monthRaw = Number(req.query.month);
      const year = Number.isFinite(yearRaw) ? yearRaw : now.getFullYear();
      const month = Number.isFinite(monthRaw) ? monthRaw : now.getMonth() + 1;

      if (month < 1 || month > 12 || year < 2000 || year > 2100) {
        res.status(400).json({ error: "Invalid year or month." });
        return;
      }

      const breakdown = await getGuardPayrollBreakdown({
        agencyId: req.guard.agencyId,
        guardId: req.guard.guardId,
        year,
        month,
      });

      res.json({
        breakdown,
        asOf: now.toISOString(),
        disclaimer:
          "Estimate based on attendance to date. Final payslip may change after payroll is finalized by your agency.",
      });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load salary breakdown."),
      });
    }
  });

  return router;
}
