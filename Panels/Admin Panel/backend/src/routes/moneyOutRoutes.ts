import { Router, type Response } from "express";
import {
  createAgencyExpense,
  createEmployeeAdvance,
  getAgencyExpense,
  getEmployeeAdvance,
  listAgencyExpenses,
  listEmployeeAdvances,
  recordAdvanceCashRepayment,
  updateAgencyExpense,
  voidAgencyExpense,
  voidEmployeeAdvance,
  type AdvanceRecoveryMode,
  type ExpenseCategory,
} from "@raskha/money-out";
import {
  requireAgencyCaller,
  type AgencyAuthRequest,
} from "../middleware/requireAgencyCaller.js";

function statusCodeOf(error: unknown): number {
  const err = error as { statusCode?: number };
  return typeof err.statusCode === "number" ? err.statusCode : 500;
}

function messageOf(error: unknown, fallback: string): string {
  const err = error as { message?: string };
  return err.message ?? fallback;
}

function requireAdmin(req: AgencyAuthRequest, res: Response): boolean {
  if (req.callerRole !== "agency") {
    res.status(403).json({
      error: "Only agency admins can manage money out.",
    });
    return false;
  }
  return true;
}

export function createMoneyOutRoutes(): Router {
  const router = Router();
  router.use(requireAgencyCaller);

  router.get("/advances", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const guardId =
        typeof req.query.guardId === "string" ? req.query.guardId : undefined;
      const statusRaw =
        typeof req.query.status === "string" ? req.query.status : "all";
      const status =
        statusRaw === "open" ||
        statusRaw === "settled" ||
        statusRaw === "void" ||
        statusRaw === "all"
          ? statusRaw
          : "all";
      const branchId =
        typeof req.query.branchId === "string" && req.query.branchId.trim()
          ? req.query.branchId.trim()
          : undefined;
      const advances = await listEmployeeAdvances({
        agencyId: req.agencyId!,
        guardId,
        status,
        branchId,
      });
      res.json({ advances });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to list advances."),
      });
    }
  });

  router.post("/advances", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const body = (req.body ?? {}) as {
        guardId?: string;
        amount?: number;
        givenOn?: string;
        purpose?: string;
        recoveryMode?: AdvanceRecoveryMode;
        emiMonths?: number;
        recoveryStartYear?: number;
        recoveryStartMonth?: number;
      };
      const advance = await createEmployeeAdvance({
        agencyId: req.agencyId!,
        guardId: String(body.guardId ?? ""),
        amount: Number(body.amount),
        givenOn: String(body.givenOn ?? ""),
        purpose: body.purpose,
        recoveryMode: (body.recoveryMode ?? "next_payroll") as AdvanceRecoveryMode,
        emiMonths: body.emiMonths,
        recoveryStartYear:
          body.recoveryStartYear != null
            ? Number(body.recoveryStartYear)
            : undefined,
        recoveryStartMonth:
          body.recoveryStartMonth != null
            ? Number(body.recoveryStartMonth)
            : undefined,
        createdByUid: req.callerUid || req.agencyId || "",
      });
      res.status(201).json({ advance });
    } catch (error: unknown) {
      console.error("[money-out] create advance failed", error);
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to create advance."),
      });
    }
  });

  router.get(
    "/advances/:advanceId",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const advance = await getEmployeeAdvance({
          agencyId: req.agencyId!,
          advanceId: String(req.params.advanceId ?? ""),
        });
        res.json({ advance });
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to load advance."),
        });
      }
    }
  );

  router.post(
    "/advances/:advanceId/repay",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const body = (req.body ?? {}) as {
          amount?: number;
          date?: string;
          note?: string;
        };
        const advance = await recordAdvanceCashRepayment({
          agencyId: req.agencyId!,
          advanceId: String(req.params.advanceId ?? ""),
          amount: Number(body.amount),
          date: String(body.date ?? ""),
          note: body.note,
        });
        res.json({ advance });
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to record repayment."),
        });
      }
    }
  );

  router.post(
    "/advances/:advanceId/void",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const advance = await voidEmployeeAdvance({
          agencyId: req.agencyId!,
          advanceId: String(req.params.advanceId ?? ""),
        });
        res.json({ advance });
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to void advance."),
        });
      }
    }
  );

  router.get("/expenses", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const year =
        req.query.year != null ? Number(req.query.year) : undefined;
      const month =
        req.query.month != null ? Number(req.query.month) : undefined;
      const siteId =
        typeof req.query.siteId === "string" ? req.query.siteId : undefined;
      const guardId =
        typeof req.query.guardId === "string" ? req.query.guardId : undefined;
      const category =
        typeof req.query.category === "string"
          ? (req.query.category as ExpenseCategory)
          : undefined;
      const branchId =
        typeof req.query.branchId === "string" && req.query.branchId.trim()
          ? req.query.branchId.trim()
          : undefined;
      const expenses = await listAgencyExpenses({
        agencyId: req.agencyId!,
        year: Number.isInteger(year) ? year : undefined,
        month: Number.isInteger(month) ? month : undefined,
        siteId,
        guardId,
        category,
        branchId,
      });
      res.json({ expenses });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to list expenses."),
      });
    }
  });

  router.post("/expenses", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const body = (req.body ?? {}) as {
        date?: string;
        amount?: number;
        category?: ExpenseCategory;
        siteId?: string;
        guardId?: string;
        note?: string;
      };
      const expense = await createAgencyExpense({
        agencyId: req.agencyId!,
        date: String(body.date ?? ""),
        amount: Number(body.amount),
        category: (body.category ?? "miscellaneous") as ExpenseCategory,
        siteId: body.siteId,
        guardId: body.guardId,
        note: body.note,
        createdByUid: req.callerUid || req.agencyId || "",
      });
      res.status(201).json({ expense });
    } catch (error: unknown) {
      console.error("[money-out] create expense failed", error);
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to create expense."),
      });
    }
  });

  router.get(
    "/expenses/:expenseId",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const expense = await getAgencyExpense({
          agencyId: req.agencyId!,
          expenseId: String(req.params.expenseId ?? ""),
        });
        res.json({ expense });
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to load expense."),
        });
      }
    }
  );

  router.patch(
    "/expenses/:expenseId",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const body = (req.body ?? {}) as {
          date?: string;
          amount?: number;
          category?: ExpenseCategory;
          siteId?: string | null;
          guardId?: string | null;
          note?: string;
        };
        const expense = await updateAgencyExpense({
          agencyId: req.agencyId!,
          expenseId: String(req.params.expenseId ?? ""),
          patch: body,
        });
        res.json({ expense });
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to update expense."),
        });
      }
    }
  );

  router.post(
    "/expenses/:expenseId/void",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const expense = await voidAgencyExpense({
          agencyId: req.agencyId!,
          expenseId: String(req.params.expenseId ?? ""),
        });
        res.json({ expense });
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to void expense."),
        });
      }
    }
  );

  return router;
}
