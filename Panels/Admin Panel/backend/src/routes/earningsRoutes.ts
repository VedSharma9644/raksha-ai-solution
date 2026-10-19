import { Router, type Response } from "express";
import {
  buildEarningsSummary,
  exportEarningsCsv,
  getSiteEarningsDetail,
  type EarningsReportPeriod,
} from "@raskha/earnings";
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
      error: "Only agency admins can view earnings.",
    });
    return false;
  }
  return true;
}

function parseYearMonth(
  yearRaw: unknown,
  monthRaw: unknown
): { year: number; month: number } | null {
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }
  return { year, month };
}

/**
 * Thin HTTP adapter — earnings domain lives in @raskha/earnings.
 */
export function createEarningsRoutes(): Router {
  const router = Router();
  router.use(requireAgencyCaller);

  router.get("/summary", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const agencyId = req.agencyId!;
      const now = new Date();
      const from =
        parseYearMonth(
          req.query.fromYear ?? now.getFullYear(),
          req.query.fromMonth ?? now.getMonth() + 1
        ) ?? null;
      const to =
        parseYearMonth(
          req.query.toYear ?? req.query.fromYear ?? now.getFullYear(),
          req.query.toMonth ?? req.query.fromMonth ?? now.getMonth() + 1
        ) ?? null;
      if (!from || !to) {
        res.status(400).json({ error: "Provide valid from/to year and month." });
        return;
      }

      const branchId =
        typeof req.query.branchId === "string" && req.query.branchId.trim()
          ? req.query.branchId.trim()
          : undefined;
      const summary = await buildEarningsSummary({
        agencyId,
        from,
        to,
        branchId,
      });
      res.json({ summary });
    } catch (error: unknown) {
      console.error("[earnings] summary failed", error);
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load earnings summary."),
      });
    }
  });

  router.get(
    "/sites/:siteId",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        if (!requireAdmin(req, res)) return;
        const agencyId = req.agencyId!;
        const now = new Date();
        const from =
          parseYearMonth(
            req.query.fromYear ?? req.query.year ?? now.getFullYear(),
            req.query.fromMonth ?? req.query.month ?? now.getMonth() + 1
          ) ?? null;
        const to =
          parseYearMonth(
            req.query.toYear ?? req.query.year ?? now.getFullYear(),
            req.query.toMonth ?? req.query.month ?? now.getMonth() + 1
          ) ?? null;
        if (!from || !to) {
          res
            .status(400)
            .json({ error: "Provide a valid year and month range." });
          return;
        }

        const detail = await getSiteEarningsDetail({
          agencyId,
          siteId: String(req.params.siteId ?? ""),
          from,
          to,
        });
        res.json({ detail });
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to load site earnings."),
        });
      }
    }
  );

  router.get("/export.csv", async (req: AgencyAuthRequest, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;
      const agencyId = req.agencyId!;
      const now = new Date();
      const period = String(req.query.period ?? "monthly") as EarningsReportPeriod;
      if (
        !["monthly", "bimonthly", "halfyearly", "yearly"].includes(period)
      ) {
        res.status(400).json({
          error:
            "period must be monthly, bimonthly, halfyearly, or yearly.",
        });
        return;
      }
      const ym = parseYearMonth(
        req.query.year ?? now.getFullYear(),
        req.query.month ?? now.getMonth() + 1
      );
      if (!ym) {
        res.status(400).json({ error: "Provide a valid year and month." });
        return;
      }

      const branchId =
        typeof req.query.branchId === "string" && req.query.branchId.trim()
          ? req.query.branchId.trim()
          : undefined;
      const { csv, filename } = await exportEarningsCsv({
        agencyId,
        period,
        year: ym.year,
        month: ym.month,
        branchId,
      });
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(csv);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to export earnings CSV."),
      });
    }
  });

  return router;
}
