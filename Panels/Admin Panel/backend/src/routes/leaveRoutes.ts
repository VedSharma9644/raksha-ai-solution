import { Router, type Response } from "express";
import {
  decideLeaveRequest,
  LEAVE_TYPE_LABELS,
  listAgencyLeaveRequestsDto,
} from "@raskha/leave";
import { notifyLeaveDecision } from "@raskha/notifications";
import { getFirestore } from "firebase-admin/firestore";

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

async function resolveDeciderName(req: AgencyAuthRequest): Promise<string> {
  const uid = req.callerUid;
  if (!uid) {
    return req.callerRole === "hr" ? "HR" : "Agency Admin";
  }

  try {
    if (req.callerRole === "hr") {
      const snap = await getFirestore().collection("hrStaff").doc(uid).get();
      const name = String(snap.data()?.fullName ?? "").trim();
      return name || "HR";
    }
    const snap = await getFirestore().collection("agencies").doc(uid).get();
    const name =
      String(snap.data()?.ownerName ?? "").trim() ||
      String(snap.data()?.name ?? "").trim();
    return name || "Agency Admin";
  } catch {
    return req.callerRole === "hr" ? "HR" : "Agency Admin";
  }
}

export function createLeaveRoutes(): Router {
  const router = Router();

  router.use(requireAgencyCaller);

  router.get("/requests", async (req: AgencyAuthRequest, res: Response) => {
    try {
      const agencyId = req.agencyId;
      if (!agencyId) {
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

      const result = await listAgencyLeaveRequestsDto({ agencyId, status });
      res.json(result);
    } catch (error: unknown) {
      res.status(statusCodeOf(error)).json({
        error: messageOf(error, "Failed to load leave requests."),
      });
    }
  });

  router.post(
    "/requests/:id/approve",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        const agencyId = req.agencyId;
        if (!agencyId) {
          res.status(401).json({ error: "Unauthorized." });
          return;
        }

        const result = await decideLeaveRequest({
          agencyId,
          requestId: String(req.params.id ?? ""),
          decision: "approved",
          decidedByName: await resolveDeciderName(req),
          remark:
            typeof req.body?.approvalNote === "string"
              ? req.body.approvalNote
              : undefined,
        });
        void notifyLeaveDecision({
          guardId: result.guardId,
          agencyId: result.agencyId,
          leaveRequestId: result.id,
          status: "approved",
          leaveTypeLabel: LEAVE_TYPE_LABELS[result.leaveType],
          startDate: result.startDate,
          endDate: result.endDate,
        }).catch(() => undefined);
        res.json(result);
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to approve leave request."),
        });
      }
    }
  );

  router.post(
    "/requests/:id/reject",
    async (req: AgencyAuthRequest, res: Response) => {
      try {
        const agencyId = req.agencyId;
        if (!agencyId) {
          res.status(401).json({ error: "Unauthorized." });
          return;
        }

        const result = await decideLeaveRequest({
          agencyId,
          requestId: String(req.params.id ?? ""),
          decision: "rejected",
          decidedByName: await resolveDeciderName(req),
          remark:
            typeof req.body?.rejectionRemark === "string"
              ? req.body.rejectionRemark
              : typeof req.body?.remark === "string"
                ? req.body.remark
                : undefined,
        });
        void notifyLeaveDecision({
          guardId: result.guardId,
          agencyId: result.agencyId,
          leaveRequestId: result.id,
          status: "rejected",
          leaveTypeLabel: LEAVE_TYPE_LABELS[result.leaveType],
          startDate: result.startDate,
          endDate: result.endDate,
        }).catch(() => undefined);
        res.json(result);
      } catch (error: unknown) {
        res.status(statusCodeOf(error)).json({
          error: messageOf(error, "Failed to reject leave request."),
        });
      }
    }
  );

  return router;
}
