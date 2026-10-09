import { getFirestore } from "firebase-admin/firestore";

import { toDutyDateKey } from "./dutyDate";
import { hydrateAssignmentsFromLiveSites } from "./rosterLive";
import { getSiteGeofenceById } from "./siteLookup";

const SHIFT_ASSIGNMENTS_COLLECTION = "shiftAssignments";

type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const JS_TO_DOW: DayOfWeek[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

export type TodayDutyResolution = {
  shiftFrom: string;
  shiftTo: string;
  shiftLabel: string;
  siteId: string;
  siteName: string;
  postName: string;
  source: "roster" | "profile";
  assignmentId?: string;
  /** Roster shifts earlier today whose window already ended (missed / completed). */
  earlierShiftCount: number;
  /** True when an earlier roster window ended and a later one is still actionable. */
  hasLaterReplacement: boolean;
};

type AssignmentRow = {
  id: string;
  siteId: string;
  shiftId?: string;
  shiftLabel: string;
  shiftStartTime: string;
  shiftEndTime: string;
  recurringDays: DayOfWeek[];
  effectiveFrom: string;
  effectiveTo?: string | null;
};

function weekdayFromDutyDate(dutyDate: string): DayOfWeek {
  const [y, m, d] = dutyDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 6, 30));
  return JS_TO_DOW[utc.getUTCDay()] ?? "mon";
}

function parseHhMm(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

function shiftWindow(
  dutyDate: string,
  shiftFrom: string,
  shiftTo: string
): { start: Date; end: Date } {
  const [y, m, d] = dutyDate.split("-").map(Number);
  const from = parseHhMm(shiftFrom) ?? { hours: 8, minutes: 0 };
  const to = parseHhMm(shiftTo) ?? { hours: 20, minutes: 0 };
  const start = new Date(y, m - 1, d, from.hours, from.minutes, 0, 0);
  let end = new Date(y, m - 1, d, to.hours, to.minutes, 0, 0);
  if (end <= start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }
  return { start, end };
}

function covers(assignment: AssignmentRow, dutyDate: string): boolean {
  if (dutyDate < assignment.effectiveFrom) {
    return false;
  }
  if (assignment.effectiveTo && dutyDate > assignment.effectiveTo) {
    return false;
  }
  return assignment.recurringDays.includes(weekdayFromDutyDate(dutyDate));
}

async function loadAssignments(
  guardId: string,
  agencyId: string
): Promise<AssignmentRow[]> {
  if (!guardId || !agencyId) {
    return [];
  }
  try {
    const snap = await getFirestore()
      .collection(SHIFT_ASSIGNMENTS_COLLECTION)
      .where("guardId", "==", guardId)
      .where("agencyId", "==", agencyId)
      .get();

    const rows = snap.docs.map((docSnap) => {
      const data = docSnap.data();
      const days = Array.isArray(data.recurringDays)
        ? (data.recurringDays.filter(
            (d: unknown) => typeof d === "string"
          ) as DayOfWeek[])
        : [];
      return {
        id: docSnap.id,
        siteId: String(data.siteId ?? ""),
        shiftId: String(data.shiftId ?? ""),
        shiftLabel: String(data.shiftLabel ?? "Duty"),
        shiftStartTime: String(data.shiftStartTime ?? "08:00"),
        shiftEndTime: String(data.shiftEndTime ?? "20:00"),
        recurringDays: days,
        effectiveFrom: String(data.effectiveFrom ?? "1970-01-01"),
        effectiveTo:
          typeof data.effectiveTo === "string" ? data.effectiveTo : null,
      };
    });
    return hydrateAssignmentsFromLiveSites(rows);
  } catch {
    return [];
  }
}

/**
 * Resolve the duty the Guard homepage should show right now.
 * Prefers live roster over profile defaults so same-day HR reassignments appear.
 */
export async function resolveTodayDuty(params: {
  guardId: string;
  agencyId: string;
  profileShiftFrom?: string;
  profileShiftTo?: string;
  profileSiteId?: string;
  profileSiteName?: string;
  profilePostName?: string;
  /** When true, prefer a window that contains "now" (active punch session). */
  hasOpenPunch?: boolean;
}): Promise<TodayDutyResolution> {
  const dutyDate = toDutyDateKey();
  const now = new Date();
  const profileFrom = params.profileShiftFrom || "08:00";
  const profileTo = params.profileShiftTo || "20:00";

  const fallback: TodayDutyResolution = {
    shiftFrom: profileFrom,
    shiftTo: profileTo,
    shiftLabel: "Assigned Duty",
    siteId: params.profileSiteId || "",
    siteName: params.profileSiteName || "Assigned Site",
    postName: params.profilePostName || "Assigned Post",
    source: "profile",
    earlierShiftCount: 0,
    hasLaterReplacement: false,
  };

  const assignments = await loadAssignments(params.guardId, params.agencyId);
  const todayRows = assignments
    .filter((row) => covers(row, dutyDate))
    .map((row) => {
      const { start, end } = shiftWindow(
        dutyDate,
        row.shiftStartTime,
        row.shiftEndTime
      );
      return { row, start, end };
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (todayRows.length === 0) {
    return fallback;
  }

  const notEnded = todayRows.filter((item) => item.end.getTime() > now.getTime());
  const ended = todayRows.filter((item) => item.end.getTime() <= now.getTime());

  let chosen = notEnded[0] ?? todayRows[todayRows.length - 1];

  if (params.hasOpenPunch) {
    const containing = todayRows.find(
      (item) =>
        item.start.getTime() <= now.getTime() && item.end.getTime() > now.getTime()
    );
    chosen = containing ?? notEnded[0] ?? todayRows[todayRows.length - 1];
  } else if (notEnded.length > 0) {
    const inProgress = notEnded.filter(
      (item) => item.start.getTime() <= now.getTime()
    );
    const upcoming = notEnded.filter((item) => item.start.getTime() > now.getTime());
    // Normal: show current in-progress window (late check-in still possible).
    // After that window ends, the next rostered shift becomes the homepage duty.
    chosen = inProgress[0] ?? upcoming[0] ?? notEnded[0];
  }

  let siteName = params.profileSiteName || "Assigned Site";
  const siteId = chosen.row.siteId || params.profileSiteId || "";
  if (siteId) {
    const site = await getSiteGeofenceById(siteId).catch(() => null);
    if (site?.siteName) {
      siteName = site.siteName;
    }
  }

  const hasLaterReplacement =
    ended.length > 0 &&
    notEnded.some((item) => item.start.getTime() > now.getTime());

  return {
    shiftFrom: chosen.row.shiftStartTime,
    shiftTo: chosen.row.shiftEndTime,
    shiftLabel: chosen.row.shiftLabel || "Duty",
    siteId,
    siteName,
    postName: chosen.row.shiftLabel || params.profilePostName || "Assigned Post",
    source: "roster",
    assignmentId: chosen.row.id,
    earlierShiftCount: ended.length,
    hasLaterReplacement,
  };
}
