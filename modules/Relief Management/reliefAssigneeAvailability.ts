import { getFirestore } from "firebase-admin/firestore";
import { ATTENDANCE_COLLECTION } from "@raskha/attendance";
import {
  SHIFT_ASSIGNMENTS_COLLECTION,
  assignmentCoversDutyDate,
} from "@raskha/scheduling";

function httpError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

/**
 * Block assigning a relief guard who is already scheduled that day at another
 * site, or who has already started a shift at another site that day.
 */
export async function assertReliefAssigneeAvailable(params: {
  agencyId: string;
  assignedGuardId: string;
  dutyDate: string;
  reliefSiteId: string;
  reliefSiteName?: string;
}): Promise<void> {
  const agencyId = params.agencyId.trim();
  const assignedGuardId = params.assignedGuardId.trim();
  const dutyDate = params.dutyDate.trim();
  const reliefSiteId = params.reliefSiteId.trim();
  const reliefSiteName = (params.reliefSiteName ?? "").trim();

  if (!agencyId || !assignedGuardId || !dutyDate) {
    return;
  }

  const db = getFirestore();

  // 1) Roster: already scheduled on this duty date at another site
  const assignmentSnap = await db
    .collection(SHIFT_ASSIGNMENTS_COLLECTION)
    .where("guardId", "==", assignedGuardId)
    .where("agencyId", "==", agencyId)
    .get();

  for (const doc of assignmentSnap.docs) {
    const data = doc.data() as {
      siteId?: string;
      siteName?: string;
      shiftLabel?: string;
      shiftStartTime?: string;
      shiftEndTime?: string;
      effectiveFrom?: string;
      effectiveTo?: string | null;
      recurringDays?: string[];
    };

    if (
      !assignmentCoversDutyDate(
        {
          effectiveFrom: String(data.effectiveFrom ?? ""),
          effectiveTo: data.effectiveTo,
          recurringDays: Array.isArray(data.recurringDays)
            ? (data.recurringDays as ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[])
            : [],
        },
        dutyDate
      )
    ) {
      continue;
    }

    const scheduledSiteId = String(data.siteId ?? "").trim();
    const scheduledSiteName = String(data.siteName ?? "").trim();
    const isOtherSite = reliefSiteId
      ? scheduledSiteId !== "" && scheduledSiteId !== reliefSiteId
      : Boolean(
          scheduledSiteName &&
            reliefSiteName &&
            scheduledSiteName !== reliefSiteName
        );

    if (!isOtherSite) {
      continue;
    }

    const shiftLabel =
      String(data.shiftLabel ?? "").trim() ||
      `${data.shiftStartTime ?? "?"}–${data.shiftEndTime ?? "?"}`;
    const siteLabel = scheduledSiteName || "another site";
    throw httpError(
      `Cannot assign this guard — already scheduled on ${dutyDate} at ${siteLabel} (${shiftLabel}).`,
      409
    );
  }

  // 2) Attendance: already started a shift that day at another site
  const attendanceSnap = await db
    .collection(ATTENDANCE_COLLECTION)
    .where("guardId", "==", assignedGuardId)
    .where("dutyDate", "==", dutyDate)
    .get();

  for (const doc of attendanceSnap.docs) {
    const data = doc.data() as {
      type?: string;
      shiftStatus?: string;
      siteId?: string;
      siteName?: string;
      punchedOutAt?: unknown;
    };

    if (data.type && data.type !== "punch_in") {
      continue;
    }
    // Open / started shift only
    const isStarted =
      data.shiftStatus === "started" ||
      (data.shiftStatus !== "completed" && !data.punchedOutAt);
    if (!isStarted) {
      continue;
    }

    const punchSiteId = String(data.siteId ?? "").trim();
    const punchSiteName = String(data.siteName ?? "").trim();
    const isOtherSite = reliefSiteId
      ? punchSiteId !== "" && punchSiteId !== reliefSiteId
      : Boolean(
          punchSiteName && reliefSiteName && punchSiteName !== reliefSiteName
        );

    if (!isOtherSite) {
      continue;
    }

    const siteLabel = punchSiteName || "another site";
    throw httpError(
      `Cannot assign this guard — already on shift at ${siteLabel} on ${dutyDate}.`,
      409
    );
  }
}
