import { getFirestore } from "firebase-admin/firestore";

import {
  addDaysToDutyDate,
  shiftWindowIst,
  startOfIstDay,
  toDutyDateKey,
  weekdayFromDutyDate,
  type DayOfWeek,
} from "./dutyDate";
import { hydrateAssignmentsFromLiveSites } from "./rosterLive";
import { getSiteGeofenceById } from "./siteLookup";

const SHIFT_ASSIGNMENTS_COLLECTION = "shiftAssignments";

export type TodayDutyResolution = {
  shiftFrom: string;
  shiftTo: string;
  shiftLabel: string;
  siteId: string;
  siteName: string;
  postName: string;
  source: "roster" | "profile";
  assignmentId?: string;
  /** Roster duty date (YYYY-MM-DD IST) for the chosen window — may be yesterday for overnight. */
  dutyDate: string;
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

type WindowCandidate = {
  row: AssignmentRow;
  start: Date;
  end: Date;
  dutyDate: string;
};

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
 * Build actionable windows for today plus yesterday overnight spills that still
 * contain (or have not ended past) "now".
 */
export function buildTodayDutyWindows(params: {
  assignments: AssignmentRow[];
  now?: Date;
  todayKey?: string;
}): WindowCandidate[] {
  const now = params.now ?? new Date();
  const todayKey = params.todayKey ?? toDutyDateKey(now);
  const yesterdayKey = addDaysToDutyDate(todayKey, -1);
  const todayStart = startOfIstDay(todayKey);
  const candidates: WindowCandidate[] = [];

  for (const row of params.assignments) {
    if (covers(row, todayKey)) {
      const { start, end } = shiftWindowIst(
        todayKey,
        row.shiftStartTime,
        row.shiftEndTime
      );
      candidates.push({ row, start, end, dutyDate: todayKey });
    }
    if (covers(row, yesterdayKey)) {
      const { start, end } = shiftWindowIst(
        yesterdayKey,
        row.shiftStartTime,
        row.shiftEndTime
      );
      // Overnight (or long) window that spills past today's IST midnight.
      if (end.getTime() > todayStart.getTime()) {
        candidates.push({ row, start, end, dutyDate: yesterdayKey });
      }
    }
  }

  return candidates.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Pure selection used by resolveTodayDuty and unit tests. */
export function pickTodayDutyWindow(params: {
  windows: WindowCandidate[];
  nowMs: number;
  hasOpenPunch?: boolean;
}): WindowCandidate | null {
  const sorted = [...params.windows].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
  if (sorted.length === 0) {
    return null;
  }
  const notEnded = sorted.filter((item) => item.end.getTime() > params.nowMs);
  const ended = sorted.filter((item) => item.end.getTime() <= params.nowMs);

  if (params.hasOpenPunch) {
    const containing = sorted.find(
      (item) =>
        item.start.getTime() <= params.nowMs && item.end.getTime() > params.nowMs
    );
    return containing ?? notEnded[0] ?? sorted[sorted.length - 1] ?? null;
  }

  if (notEnded.length === 0) {
    return sorted[sorted.length - 1] ?? null;
  }

  const inProgress = notEnded.filter(
    (item) => item.start.getTime() <= params.nowMs
  );
  const upcoming = notEnded.filter((item) => item.start.getTime() > params.nowMs);
  void ended;
  return inProgress[0] ?? upcoming[0] ?? notEnded[0] ?? null;
}

/**
 * Resolve the duty the Guard homepage should show right now.
 * Prefers live roster over profile defaults so same-day HR reassignments appear.
 * Includes yesterday's overnight windows that still contain "now".
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
  const now = new Date();
  const todayKey = toDutyDateKey(now);
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
    dutyDate: todayKey,
    earlierShiftCount: 0,
    hasLaterReplacement: false,
  };

  const assignments = await loadAssignments(params.guardId, params.agencyId);
  const windows = buildTodayDutyWindows({
    assignments,
    now,
    todayKey,
  });

  if (windows.length === 0) {
    return fallback;
  }

  const nowMs = now.getTime();
  const notEnded = windows.filter((item) => item.end.getTime() > nowMs);
  const ended = windows.filter((item) => item.end.getTime() <= nowMs);
  const chosen = pickTodayDutyWindow({
    windows,
    nowMs,
    hasOpenPunch: params.hasOpenPunch,
  });

  if (!chosen) {
    return fallback;
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
    notEnded.some((item) => item.start.getTime() > nowMs);

  return {
    shiftFrom: chosen.row.shiftStartTime,
    shiftTo: chosen.row.shiftEndTime,
    shiftLabel: chosen.row.shiftLabel || "Duty",
    siteId,
    siteName,
    postName: chosen.row.shiftLabel || params.profilePostName || "Assigned Post",
    source: "roster",
    assignmentId: chosen.row.id,
    dutyDate: chosen.dutyDate,
    earlierShiftCount: ended.length,
    hasLaterReplacement,
  };
}
