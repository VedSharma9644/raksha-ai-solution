import { Router, type Response } from "express";
import { getFirestore } from "firebase-admin/firestore";
import {
  buildPayrollPreview,
  exportPayrollRunCsv,
  generatePayrollRun,
  getGuardPayrollBreakdown,
  getPayrollRun,
  getPayrollSettings,
  listPayrollRuns,
  markPayrollRunPaid,
  saveGuardReliefBonuses,
  savePayrollSettings,
  updateGuardSalaryForPayroll,
  updatePayrollLine,
} from "@raskha/payroll";
import {
  requireAgencyCaller,
  type AgencyAuthRequest,
} from "../middleware/requireAgencyCaller.js";

const AGENCIES_COLLECTION = "agencies";
const AGENCY_MODULE_ACCESS_COLLECTION = "agencyModuleAccess";
const PAYROLL_MODULE_ID = "payroll";

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
      error: "Payroll is not enabled for this agency.",
    };
  }
  return { ok: true };
}

function requireAdmin(req: AgencyAuthRequest, res: Response): boolean {
  if (req.callerRole !== "agency") {
    res.status(403).json({
      error: "Only agency admins can manage payroll runs.",
    });
    return false;
  }
  return true;
}

function statusCodeOf(error: unknown): number {
  const err = error as { statusCode?: number };
  return typeof err.statusCode === "number" ? err.statusCode : 500;
}

function messageOf(error: unknown, fallback: string): string {
  const err = error as { message?: string };
  return err.message ?? fallback;
}

/**
 * Thin HTTP adapter — payroll domain lives in @raskha/payroll.
 * Settings GET: admin or HR. Everything else: admin only.
 */
export function createPayrollRoutes(): Router {
  const router = Router();

  router.use(requireAgencyCaller);

  router.get("/settings", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
        res.status(400).json({ error: "Agency is required." });
        return;
      }

      const gate = await assertPayrollModuleEnabled(agencyId);
      if (!gate.ok) {
        res.status(gate.status).json({ error: gate.error });
        return;
      }

      const settings = await getPayrollSettings(agencyId);
      res.json({ settings });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load payroll settings."),
      });
    }
  });

  router.put("/settings", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const agencyId = req.agencyId!;
      const gate = await assertPayrollModuleEnabled(agencyId);
      if (!gate.ok) {
        res.status(gate.status).json({ error: gate.error });
        return;
      }

      const body =
        req.body && typeof req.body === "object"
          ? (req.body as { settings?: unknown }).settings ?? req.body
          : {};

      const { settings, warnings } = await savePayrollSettings(agencyId, body);
      res.json({ settings, warnings });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to save payroll settings."),
      });
    }
  });

  router.get("/preview", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const agencyId = req.agencyId!;
      const gate = await assertPayrollModuleEnabled(agencyId);
      if (!gate.ok) {
        res.status(gate.status).json({ error: gate.error });
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
        res.status(400).json({ error: "Provide a valid year and month." });
        return;
      }

      const preview = await buildPayrollPreview({ agencyId, year, month });
      res.json({ preview });
    } catch (error: unknown) {
      console.error("[payroll] preview failed", error);
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load payroll preview."),
      });
    }
  });

  router.get("/runs", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const agencyId = req.agencyId!;
      const gate = await assertPayrollModuleEnabled(agencyId);
      if (!gate.ok) {
        res.status(gate.status).json({ error: gate.error });
        return;
      }

      const runs = await listPayrollRuns(agencyId);
      res.json({ runs });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to list payroll runs."),
      });
    }
  });

  router.post("/runs", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const agencyId = req.agencyId!;
      const gate = await assertPayrollModuleEnabled(agencyId);
      if (!gate.ok) {
        res.status(gate.status).json({ error: gate.error });
        return;
      }

      const year = Number((req.body as { year?: unknown })?.year);
      const month = Number((req.body as { month?: unknown })?.month);
      if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
      ) {
        res.status(400).json({ error: "Provide a valid year and month." });
        return;
      }

      const { run, lines } = await generatePayrollRun({
        agencyId,
        year,
        month,
      });
      res.status(201).json({ run, lines });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; runId?: string };
      console.error("[payroll] generate failed", error);
      if (err.statusCode === 409) {
        res.status(409).json({
          error: messageOf(error, "Payroll run conflict."),
          runId: err.runId,
        });
        return;
      }
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to generate payroll run."),
      });
    }
  });

  router.get("/runs/:runId", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const agencyId = req.agencyId!;
      const gate = await assertPayrollModuleEnabled(agencyId);
      if (!gate.ok) {
        res.status(gate.status).json({ error: gate.error });
        return;
      }

      const runId = String(req.params.runId ?? "");
      const { run, lines } = await getPayrollRun({ agencyId, runId });
      res.json({ run, lines });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load payroll run."),
      });
    }
  });

  router.patch("/runs/:runId", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const agencyId = req.agencyId!;
      const gate = await assertPayrollModuleEnabled(agencyId);
      if (!gate.ok) {
        res.status(gate.status).json({ error: gate.error });
        return;
      }

      const status = (req.body as { status?: string })?.status;
      if (status !== "paid") {
        res.status(400).json({ error: 'Only status "paid" is supported.' });
        return;
      }

      const runId = String(req.params.runId ?? "");
      const { run, lines } = await markPayrollRunPaid({ agencyId, runId });
      res.json({ run, lines });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to update payroll run."),
      });
    }
  });

  router.patch(
    "/guards/:guardId/salary",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const agencyId = req.agencyId!;
        const gate = await assertPayrollModuleEnabled(agencyId);
        if (!gate.ok) {
          res.status(gate.status).json({ error: gate.error });
          return;
        }

        const guardId = String(req.params.guardId ?? "");
        const result = await updateGuardSalaryForPayroll({
          agencyId,
          guardId,
          monthlySalaryRaw: (req.body as { monthlySalary?: unknown })
            ?.monthlySalary,
        });
        res.json(result);
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to update guard salary."),
        });
      }
    }
  );

  router.get(
    "/guards/:guardId/breakdown",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const agencyId = req.agencyId!;
        const gate = await assertPayrollModuleEnabled(agencyId);
        if (!gate.ok) {
          res.status(gate.status).json({ error: gate.error });
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
          res.status(400).json({ error: "Provide a valid year and month." });
          return;
        }

        const breakdown = await getGuardPayrollBreakdown({
          agencyId,
          guardId: String(req.params.guardId ?? ""),
          year,
          month,
        });
        res.json({ breakdown });
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to load guard payroll breakdown."),
        });
      }
    }
  );

  router.put(
    "/guards/:guardId/relief-bonuses",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const agencyId = req.agencyId!;
        const gate = await assertPayrollModuleEnabled(agencyId);
        if (!gate.ok) {
          res.status(gate.status).json({ error: gate.error });
          return;
        }

        const body = (req.body ?? {}) as {
          year?: unknown;
          month?: unknown;
          entries?: Array<{ reliefRequestId?: string; amount?: unknown }>;
        };
        const year = Number(body.year);
        const month = Number(body.month);
        if (
          !Number.isInteger(year) ||
          !Number.isInteger(month) ||
          month < 1 ||
          month > 12
        ) {
          res.status(400).json({ error: "Provide a valid year and month." });
          return;
        }
        if (!Array.isArray(body.entries)) {
          res.status(400).json({ error: "Provide entries array." });
          return;
        }

        const breakdown = await saveGuardReliefBonuses({
          agencyId,
          guardId: String(req.params.guardId ?? ""),
          year,
          month,
          entries: body.entries.map((e) => ({
            reliefRequestId: String(e.reliefRequestId ?? ""),
            amount: Number(e.amount),
          })),
        });
        res.json({ breakdown });
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to save relief bonuses."),
        });
      }
    }
  );

  router.patch(
    "/runs/:runId/lines/:lineId",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const agencyId = req.agencyId!;
        const gate = await assertPayrollModuleEnabled(agencyId);
        if (!gate.ok) {
          res.status(gate.status).json({ error: gate.error });
          return;
        }

        const body = (req.body ?? {}) as {
          status?: string;
          monthlySalary?: unknown;
        };

        const { run, line } = await updatePayrollLine({
          agencyId,
          runId: String(req.params.runId ?? ""),
          lineId: String(req.params.lineId ?? ""),
          monthlySalary: body.monthlySalary,
          markPaid: body.status === "paid",
        });
        res.json({ run, line });
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to update payroll line."),
        });
      }
    }
  );

  router.get(
    "/runs/:runId/export.csv",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const agencyId = req.agencyId!;
        const gate = await assertPayrollModuleEnabled(agencyId);
        if (!gate.ok) {
          res.status(gate.status).json({ error: gate.error });
          return;
        }

        const { csv, filename } = await exportPayrollRunCsv({
          agencyId,
          runId: String(req.params.runId ?? ""),
        });
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        res.send(csv);
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to export payroll CSV."),
        });
      }
    }
  );

  return router;
}
