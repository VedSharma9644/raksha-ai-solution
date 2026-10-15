import { Router, type Response } from "express";
import {
  deleteAttendanceDayOverride,
  getAttendanceDayOverride,
  isAttendanceCorrectionStatus,
  listAgencyAttendanceForDate,
  listAttendanceHistory,
  saveAttendanceDayOverride,
} from "@raskha/attendance";
import { getFirestore } from "firebase-admin/firestore";
import { GUARDS_COLLECTION } from "@raskha/guard-management";

import {
  requireAgencyCaller,
  type AgencyAuthRequest,
} from "../middleware/requireAgencyCaller";

function statusCodeOf(error: unknown): number {
  const err = error as { statusCode?: number };
  return typeof err.statusCode === "number" ? err.statusCode : 500;
}

function messageOf(error: unknown, fallback: string): string {
  const err = error as { message?: string };
  return err.message ?? fallback;
}

async function assertGuardInAgency(
  agencyId: string,
  guardId: string
): Promise<void> {
  const snap = await getFirestore()
    .collection(GUARDS_COLLECTION)
    .doc(guardId)
    .get();
  if (!snap.exists) {
    throw Object.assign(new Error("Guard not found."), { statusCode: 404 });
  }
  const data = snap.data() as { agencyId?: string };
  if (data.agencyId !== agencyId) {
    throw Object.assign(new Error("Guard does not belong to this agency."), {
      statusCode: 403,
    });
  }
}

/**
 * Agency / HR attendance overview for Guard Attendance screens.
 * Day-status corrections for technical failures (no fake punches).
 */
export function createAttendanceRoutes(): Router {
  const router = Router();

  router.use(requireAgencyCaller);

  router.get("/", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const date =
        typeof req.query.date === "string" && req.query.date.trim()
          ? req.query.date.trim()
          : new Intl.DateTimeFormat("en-CA", {
              timeZone: "Asia/Kolkata",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date());

      const siteId =
        typeof req.query.siteId === "string" ? req.query.siteId.trim() : undefined;

      const result = await listAgencyAttendanceForDate({
        agencyId,
        date,
        siteId: siteId && siteId !== "all" ? siteId : undefined,
      });

      res.json(result);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load attendance."),
      });
    }
  });

  /**
   * Guard month history — calendar + logs (missed / half / present).
   * Used so admins can see problem days and correct technical failures.
   */
  router.get("/history", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const guardId =
        typeof req.query.guardId === "string" ? req.query.guardId.trim() : "";
      const now = new Date();
      const year = Number(
        typeof req.query.year === "string" ? req.query.year : now.getFullYear()
      );
      const month = Number(
        typeof req.query.month === "string"
          ? req.query.month
          : now.getMonth() + 1
      );

      if (!guardId) {
        res.status(400).json({ error: "guardId is required." });
        return;
      }
      if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
      ) {
        res.status(400).json({ error: "Provide a valid year and month." });
        return;
      }

      await assertGuardInAgency(agencyId, guardId);

      const guardSnap = await getFirestore()
        .collection(GUARDS_COLLECTION)
        .doc(guardId)
        .get();
      const guard = guardSnap.data() as {
        shiftFrom?: string;
        shiftTo?: string;
        fullName?: string;
        employeeCode?: string;
      };

      const history = await listAttendanceHistory({
        guardId,
        agencyId,
        year,
        month,
        shiftFrom: guard.shiftFrom,
        shiftTo: guard.shiftTo,
      });

      res.json({
        guardId,
        guardName: guard.fullName?.trim() || "Guard",
        employeeCode: guard.employeeCode?.trim() || "",
        history,
      });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load attendance history."),
      });
    }
  });

  /** Load an existing day-status correction (if any). */
  router.get("/corrections", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const guardId =
        typeof req.query.guardId === "string" ? req.query.guardId.trim() : "";
      const dutyDate =
        typeof req.query.dutyDate === "string" ? req.query.dutyDate.trim() : "";

      if (!guardId || !dutyDate) {
        res.status(400).json({ error: "guardId and dutyDate are required." });
        return;
      }

      await assertGuardInAgency(agencyId, guardId);
      const override = await getAttendanceDayOverride({
        agencyId,
        guardId,
        dutyDate,
      });
      res.json({ override });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load attendance correction."),
      });
    }
  });

  /**
   * Set / update a day-status override for technical failures.
   * Does not create synthetic punch records — payroll & history read the override.
   */
  router.post("/corrections", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      const callerUid = req.callerUid;
      const callerRole = req.callerRole;
      if (!agencyId || !callerUid || !callerRole) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const body = (req.body ?? {}) as {
        guardId?: unknown;
        dutyDate?: unknown;
        status?: unknown;
        note?: unknown;
      };

      const guardId = typeof body.guardId === "string" ? body.guardId.trim() : "";
      const dutyDate =
        typeof body.dutyDate === "string" ? body.dutyDate.trim() : "";
      const note = typeof body.note === "string" ? body.note : "";
      const status = body.status;

      if (!guardId || !dutyDate) {
        res.status(400).json({ error: "guardId and dutyDate are required." });
        return;
      }
      if (!isAttendanceCorrectionStatus(status)) {
        res.status(400).json({
          error: "status must be one of: full, half, missed, leave, off.",
        });
        return;
      }

      await assertGuardInAgency(agencyId, guardId);

      const override = await saveAttendanceDayOverride({
        agencyId,
        guardId,
        dutyDate,
        status,
        note,
        correctedByUid: callerUid,
        correctedByRole: callerRole,
      });

      res.json({ override });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to save attendance correction."),
      });
    }
  });

  /** Remove a day-status override (reverts to automatic classification). */
  router.delete("/corrections", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      const guardId =
        typeof req.query.guardId === "string"
          ? req.query.guardId.trim()
          : typeof req.body?.guardId === "string"
            ? String(req.body.guardId).trim()
            : "";
      const dutyDate =
        typeof req.query.dutyDate === "string"
          ? req.query.dutyDate.trim()
          : typeof req.body?.dutyDate === "string"
            ? String(req.body.dutyDate).trim()
            : "";

      if (!guardId || !dutyDate) {
        res.status(400).json({ error: "guardId and dutyDate are required." });
        return;
      }

      await assertGuardInAgency(agencyId, guardId);
      await deleteAttendanceDayOverride({ agencyId, guardId, dutyDate });
      res.json({ ok: true });
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to clear attendance correction."),
      });
    }
  });

  return router;
}
