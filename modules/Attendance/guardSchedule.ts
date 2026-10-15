import { getFirestore, type Timestamp } from "firebase-admin/firestore";

import { ATTENDANCE_COLLECTION } from "./attendance";
import {
  addDaysToDutyDate,
  formatIstDutyDayLabel,
  shiftWindowIst,
  toDutyDateKey,
  weekdayFromDutyDate,
  type DayOfWeek,
} from "./dutyDate";
import { hydrateAssignmentsFromLiveSites } from "./rosterLive";

const SHIFT_ASSIGNMENTS_COLLECTION = "shiftAssignments";

/** Live duty status for today's roster card (and scheduled for future days). */
export type GuardScheduleDutyStatus =
  | "coming"
  | "on_duty"
  | "late_login"
  | "delayed"
  | "completed"
  | "missed"
  | "scheduled"
  | "rest";

export type GuardScheduleShiftDto = {
  id: string;
  dutyDate: string;
  dayLabel: string;
  siteName: string;
  postName: string;
  shiftFrom: string;
  shiftTo: string;
  timeLabel: string;
  kind: "confirmed" | "night" | "rest";
  statusLabel: string;
  /** Machine-friendly status for Today badge styling. */
  dutyStatus: GuardScheduleDutyStatus;
  isToday: boolean;
  isTomorrow: boolean;
  nightAllowanceLabel?: string;
};

export type GuardScheduleResponse = {
  shifts: GuardScheduleShiftDto[];
  restDays: GuardScheduleShiftDto[];
  from: string;
  days: number;
};

type AssignmentRow = {
  siteId: string;
  shiftId?: string;
  shiftLabel: string;
  shiftStartTime: string;
  shiftEndTime: string;
  recurringDays: DayOfWeek[];
  effectiveFrom: string;
  effectiveTo?: string | null;
  siteName?: string;
};

function isNightDuty(shiftFrom: string, shiftTo: string): boolean {
  const parse = (v: string) => {
    const [h] = v.split(":").map(Number);
    return Number.isFinite(h) ? h : 8;
  };
  const from = parse(shiftFrom);
  const to = parse(shiftTo);
  return to <= from || from >= 18;
}

/** Format roster HH:mm wall-clock labels without timezone conversion (Cloud Run is UTC). */
function formatTimeRange(shiftFrom: string, shiftTo: string): string {
  const toLabel = (hhmm: string) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
    const h = match ? Number(match[1]) : 0;
    const m = match ? Number(match[2]) : 0;
    const hour24 = ((Number.isFinite(h) ? h : 0) % 24 + 24) % 24;
    const minute = ((Number.isFinite(m) ? m : 0) % 60 + 60) % 60;
    const suffix = hour24 >= 12 ? "pm" : "am";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
  };
  return `${toLabel(shiftFrom)} – ${toLabel(shiftTo)}`;
}

type TodayPunchState = {
  hasOpenPunch: boolean;
  hasEndedPunch: boolean;
  punchInStatus?: string;
};

async function loadTodayPunchState(
  guardId: string,
  dutyDate: string
): Promise<TodayPunchState> {
  if (!guardId) {
    return { hasOpenPunch: false, hasEndedPunch: false };
  }
  try {
    const snap = await getFirestore()
      .collection(ATTENDANCE_COLLECTION)
      .where("guardId", "==", guardId)
      .where("dutyDate", "==", dutyDate)
      .get();

    let hasOpenPunch = false;
    let hasEndedPunch = false;
    let punchInStatus: string | undefined;

    for (const docSnap of snap.docs) {
      const data = docSnap.data() as {
        type?: string;
        shiftStatus?: string;
        punchInStatus?: string;
        punchedOutAt?: Timestamp;
      };
      if (data.type && data.type !== "punch_in") {
        continue;
      }
      if (typeof data.punchInStatus === "string" && data.punchInStatus) {
        punchInStatus = data.punchInStatus;
      }
      if (data.shiftStatus === "started") {
        hasOpenPunch = true;
      }
      if (data.shiftStatus === "ended" || data.punchedOutAt) {
        hasEndedPunch = true;
      }
    }

    return { hasOpenPunch, hasEndedPunch, punchInStatus };
  } catch {
    return { hasOpenPunch: false, hasEndedPunch: false };
  }
}

function resolveTodayDutyStatus(params: {
  shiftFrom: string;
  shiftTo: string;
  dutyDate: string;
  punch: TodayPunchState;
  now?: Date;
}): { dutyStatus: GuardScheduleDutyStatus; statusLabel: string } {
  const now = params.now ?? new Date();
  const { start, end } = shiftWindowIst(
    params.dutyDate,
    params.shiftFrom,
    params.shiftTo
  );

  if (params.punch.hasOpenPunch) {
    const late =
      params.punch.punchInStatus?.toLowerCase().includes("late") === true;
    return {
      dutyStatus: late ? "late_login" : "on_duty",
      // Multiline-friendly label for the Schedule badge
      statusLabel: late ? "On Duty\nLate Login" : "On Duty",
    };
  }

  if (params.punch.hasEndedPunch) {
    return { dutyStatus: "completed", statusLabel: "Completed" };
  }

  if (now.getTime() >= end.getTime()) {
    return { dutyStatus: "missed", statusLabel: "Missed" };
  }

  if (now.getTime() >= start.getTime()) {
    return { dutyStatus: "delayed", statusLabel: "Delayed" };
  }

  return { dutyStatus: "coming", statusLabel: "Coming" };
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
  if (!agencyId) {
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
        ? (data.recurringDays.filter((d: unknown) =>
            typeof d === "string"
          ) as DayOfWeek[])
        : [];
      return {
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
 * Upcoming roster shifts for the Schedule tab.
 * Today's row overlays live punch state: Coming / Delayed / On Duty / Completed / Missed.
 */
export async function listGuardUpcomingSchedule(params: {
  guardId: string;
  agencyId: string;
  siteName?: string;
  postName?: string;
  shiftFrom?: string;
  shiftTo?: string;
  from?: string;
  days?: number;
}): Promise<GuardScheduleResponse> {
  const days = Math.min(31, Math.max(1, params.days ?? 14));
  const from = params.from || toDutyDateKey();
  const [assignments, todayPunch] = await Promise.all([
    loadAssignments(params.guardId, params.agencyId),
    loadTodayPunchState(params.guardId, from),
  ]);

  const shifts: GuardScheduleShiftDto[] = [];
  const restDays: GuardScheduleShiftDto[] = [];
  const tomorrow = addDaysToDutyDate(from, 1);
  const defaultSiteName = params.siteName || "Assigned Site";

  for (let i = 0; i < days; i += 1) {
    const dutyDate = addDaysToDutyDate(from, i);
    const isToday = dutyDate === from;
    let shiftFrom = params.shiftFrom || "08:00";
    let shiftTo = params.shiftTo || "20:00";
    let postName = params.postName || "Assigned Post";
    let siteName = defaultSiteName;
    let matched = false;

    if (assignments.length > 0) {
      for (const assignment of assignments) {
        if (!covers(assignment, dutyDate)) {
          continue;
        }
        shiftFrom = assignment.shiftStartTime;
        shiftTo = assignment.shiftEndTime;
        postName = assignment.shiftLabel || postName;
        if (assignment.siteName) {
          siteName = assignment.siteName;
        }
        matched = true;
        break;
      }
      if (!matched) {
        restDays.push({
          id: `rest-${dutyDate}`,
          dutyDate,
          dayLabel: formatIstDutyDayLabel(dutyDate),
          siteName: defaultSiteName,
          postName: "Roster rest day",
          shiftFrom: "",
          shiftTo: "",
          timeLabel: "Weekly off",
          kind: "rest",
          statusLabel: "Rest Day",
          dutyStatus: "rest",
          isToday,
          isTomorrow: dutyDate === tomorrow,
        });
        continue;
      }
    } else {
      // Soft profile schedule: skip Sundays as rest
      if (weekdayFromDutyDate(dutyDate) === "sun") {
        restDays.push({
          id: `rest-${dutyDate}`,
          dutyDate,
          dayLabel: formatIstDutyDayLabel(dutyDate),
          siteName: defaultSiteName,
          postName: "Roster rest day",
          shiftFrom: "",
          shiftTo: "",
          timeLabel: "Weekly off",
          kind: "rest",
          statusLabel: "Rest Day",
          dutyStatus: "rest",
          isToday,
          isTomorrow: dutyDate === tomorrow,
        });
        continue;
      }
    }

    const night = isNightDuty(shiftFrom, shiftTo);
    const timeLabel = `${formatTimeRange(shiftFrom, shiftTo)} (${night ? "Night" : "Day"})`;

    let dutyStatus: GuardScheduleDutyStatus = "scheduled";
    let statusLabel = night ? "Night Duty" : "Scheduled";
    if (isToday) {
      const live = resolveTodayDutyStatus({
        shiftFrom,
        shiftTo,
        dutyDate,
        punch: todayPunch,
      });
      dutyStatus = live.dutyStatus;
      statusLabel = live.statusLabel;
    }

    shifts.push({
      id: `shift-${dutyDate}`,
      dutyDate,
      dayLabel: formatIstDutyDayLabel(dutyDate),
      siteName,
      postName,
      shiftFrom,
      shiftTo,
      timeLabel,
      kind: night ? "night" : "confirmed",
      statusLabel,
      dutyStatus,
      isToday,
      isTomorrow: dutyDate === tomorrow,
      nightAllowanceLabel: night ? "Night Shift Allowance Applicable" : undefined,
    });
  }

  return { shifts, restDays, from, days };
}
