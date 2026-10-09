import { getFirestore, Timestamp } from "firebase-admin/firestore";

import { ATTENDANCE_COLLECTION } from "./attendance";
import {
  formatIstPunchTime,
  formatIstShortDate,
  IST_TIME_ZONE,
  toDutyDateKey,
} from "./dutyDate";
import { hydrateAssignmentsFromLiveSites } from "./rosterLive";

const SHIFT_ASSIGNMENTS_COLLECTION = "shiftAssignments";
const RELIEF_REQUESTS_COLLECTION = "reliefRequests";
const LEAVE_REQUESTS_COLLECTION = "leaveRequests";

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

export type AttendanceHistoryDayStatus =
  | "full"
  | "half"
  | "missed"
  | "upcoming"
  | "today"
  | "off"
  | "leave"
  /** @deprecated use full — kept for older clients */
  | "present"
  | "empty";

export type AttendanceHistoryLogKind =
  | "onDuty"
  | "full"
  | "half"
  | "missed"
  | "upcoming"
  | "weeklyOff"
  | "leave"
  /** @deprecated use full */
  | "present";

export type AttendanceHistoryLogDto = {
  id: string;
  kind: AttendanceHistoryLogKind;
  statusLabel: string;
  dateLabel: string;
  postLabel: string;
  postIcon: "shield" | "door-front" | "weekend" | "domain";
  detailPrimaryLabel?: string;
  detailPrimaryValue?: string;
  detailSecondaryLabel?: string;
  detailSecondaryValue?: string;
  detailTertiaryLabel?: string;
  detailTertiaryValue?: string;
  footerTags: string[];
  punchedAtIso: string;
  dayOfMonth: number;
  dutyDate?: string;
  selfieUrl?: string;
};

export type AttendanceHistoryResponse = {
  year: number;
  month: number;
  monthLabel: string;
  cycleLabel: string;
  cycleNote: string;
  punctualityTitle: string;
  punctualitySubtitle: string;
  stats: {
    presentDays: number;
    totalHours: number;
    leaveDays: number;
    weeklyOffDays: number;
    missedDays: number;
    halfDays: number;
  };
  calendarDays: Array<{ day: number; status: AttendanceHistoryDayStatus }>;
  leadingEmpty: number;
  logs: AttendanceHistoryLogDto[];
  filterCounts: {
    all: number;
    present: number;
    missed: number;
    half: number;
    weeklyOff: number;
  };
};

type ShiftAssignmentRow = {
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

type PunchRow = {
  id: string;
  punchedAt: Date;
  punchedOutAt?: Date;
  postName: string;
  siteName: string;
  geofenceStatus: string;
  shiftStatus: string;
  punchInStatus: string;
  selfieUrl?: string;
  dutyDate: string;
};

type ScheduledDuty = {
  dutyDate: string;
  shiftFrom: string;
  shiftTo: string;
  shiftLabel: string;
  siteName: string;
  postName: string;
};

function monthBounds(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);
  return { start, end };
}

const formatPunchTime = formatIstPunchTime;
const formatShortDate = formatIstShortDate;

function formatMonthLabel(year: number, month: number): string {
  // Use noon UTC so the calendar month is stable regardless of host TZ.
  return new Date(Date.UTC(year, month - 1, 1, 12)).toLocaleDateString("en-IN", {
    timeZone: IST_TIME_ZONE,
    month: "long",
    year: "numeric",
  });
}

function mondayBasedWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function dutyDateFromParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function weekdayFromDutyDate(dutyDate: string): DayOfWeek {
  const [y, m, d] = dutyDate.split("-").map(Number);
  // Noon IST ≈ 06:30 UTC — stable weekday for India duty dates
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

function formatDuration(from: Date, to: Date): string {
  const minutes = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours <= 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
}

function durationHours(from: Date, to: Date): number {
  return Math.max(0, (to.getTime() - from.getTime()) / 3_600_000);
}

function estimateShiftHours(shiftFrom?: string, shiftTo?: string): number {
  if (!shiftFrom || !shiftTo) {
    return 12;
  }
  const { start, end } = shiftWindow("2000-01-01", shiftFrom, shiftTo);
  return Math.max(1, Math.round(durationHours(start, end)));
}

function eachDutyDateInMonth(year: number, month: number): string[] {
  const days = new Date(year, month, 0).getDate();
  const out: string[] = [];
  for (let day = 1; day <= days; day += 1) {
    out.push(dutyDateFromParts(year, month, day));
  }
  return out;
}

function addDaysToDutyDate(dutyDate: string, offset: number): string {
  const [y, m, d] = dutyDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offset, 6, 30));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(
    dt.getUTCDate()
  ).padStart(2, "0")}`;
}

function assignmentCoversDate(
  assignment: ShiftAssignmentRow,
  dutyDate: string
): boolean {
  if (dutyDate < assignment.effectiveFrom) {
    return false;
  }
  if (assignment.effectiveTo && dutyDate > assignment.effectiveTo) {
    return false;
  }
  const dow = weekdayFromDutyDate(dutyDate);
  return assignment.recurringDays.includes(dow);
}

async function loadAssignments(
  guardId: string,
  agencyId: string
): Promise<ShiftAssignmentRow[]> {
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

async function loadPunches(
  guardId: string,
  year: number,
  month: number,
  postName?: string
): Promise<Map<string, PunchRow>> {
  const { start, end } = monthBounds(year, month);
  const startMs = start.getTime();
  const endMs = end.getTime();
  const snap = await getFirestore()
    .collection(ATTENDANCE_COLLECTION)
    .where("guardId", "==", guardId)
    .get();

  const byDay = new Map<string, PunchRow>();

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.type && data.type !== "punch_in") {
      continue;
    }
    const punchedAtRaw = data.punchedAt as Timestamp | undefined;
    if (!punchedAtRaw?.toMillis) {
      continue;
    }
    const punchedAt = punchedAtRaw.toDate();
    const ms = punchedAt.getTime();
    if (ms < startMs || ms >= endMs) {
      continue;
    }

    const dutyDate =
      typeof data.dutyDate === "string" && data.dutyDate
        ? data.dutyDate
        : toDutyDateKey(punchedAt);

    const punchedOutRaw = data.punchedOutAt as Timestamp | undefined;
    const row: PunchRow = {
      id: docSnap.id,
      punchedAt,
      punchedOutAt: punchedOutRaw?.toDate?.() ?? undefined,
      postName:
        (typeof data.postName === "string" && data.postName) ||
        postName ||
        "Assigned Post",
      siteName:
        (typeof data.siteName === "string" && data.siteName) || "Assigned Site",
      geofenceStatus: String(data.geofenceStatus ?? ""),
      shiftStatus: String(data.shiftStatus ?? ""),
      punchInStatus:
        typeof data.punchInStatus === "string" && data.punchInStatus.trim()
          ? data.punchInStatus
          : "On Time",
      selfieUrl: typeof data.selfieUrl === "string" ? data.selfieUrl : undefined,
      dutyDate,
    };

    const existing = byDay.get(dutyDate);
    if (!existing || punchedAt.getTime() > existing.punchedAt.getTime()) {
      byDay.set(dutyDate, row);
    }
  }

  return byDay;
}

async function loadApprovedReliefDutyDates(
  guardId: string
): Promise<Map<string, { method: string; handoverFrom?: string; assignedGuardName?: string }>> {
  const map = new Map<
    string,
    { method: string; handoverFrom?: string; assignedGuardName?: string }
  >();
  try {
    const snap = await getFirestore()
      .collection(RELIEF_REQUESTS_COLLECTION)
      .where("guardId", "==", guardId)
      .where("status", "==", "approved")
      .get();

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const dutyDate = String(data.dutyDate ?? "");
      if (!dutyDate) {
        continue;
      }
      map.set(dutyDate, {
        method: String(data.method ?? ""),
        handoverFrom:
          typeof data.handoverFrom === "string" ? data.handoverFrom : undefined,
        assignedGuardName:
          typeof data.assignedGuardName === "string"
            ? data.assignedGuardName
            : undefined,
      });
    }
  } catch {
    // Missing composite index — ignore relief overlay
  }
  return map;
}

async function loadApprovedLeaveDates(
  guardId: string,
  year: number,
  month: number
): Promise<Set<string>> {
  const monthDates = new Set(eachDutyDateInMonth(year, month));
  const leaveDates = new Set<string>();
  try {
    const snap = await getFirestore()
      .collection(LEAVE_REQUESTS_COLLECTION)
      .where("guardId", "==", guardId)
      .where("status", "==", "approved")
      .get();

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const startDate = String(data.startDate ?? "");
      const endDate = String(data.endDate ?? startDate);
      if (!startDate) {
        continue;
      }
      for (const dutyDate of monthDates) {
        if (dutyDate >= startDate && dutyDate <= endDate) {
          leaveDates.add(dutyDate);
        }
      }
    }
  } catch {
    // ignore
  }
  return leaveDates;
}

function buildScheduledDuties(params: {
  year: number;
  month: number;
  assignments: ShiftAssignmentRow[];
  fallbackShiftFrom?: string;
  fallbackShiftTo?: string;
  siteName?: string;
  postName?: string;
}): Map<string, ScheduledDuty> {
  const duties = new Map<string, ScheduledDuty>();
  const dates = eachDutyDateInMonth(params.year, params.month);

  if (params.assignments.length > 0) {
    for (const dutyDate of dates) {
      for (const assignment of params.assignments) {
        if (!assignmentCoversDate(assignment, dutyDate)) {
          continue;
        }
        duties.set(dutyDate, {
          dutyDate,
          shiftFrom: assignment.shiftStartTime,
          shiftTo: assignment.shiftEndTime,
          shiftLabel: assignment.shiftLabel || "Duty",
          siteName:
            assignment.siteName || params.siteName || "Assigned Site",
          postName: params.postName || assignment.shiftLabel || "Assigned Post",
        });
        break;
      }
    }
    return duties;
  }

  // No roster rows: use profile shift Mon–Sat as a soft schedule so missed/upcoming still work.
  const from = params.fallbackShiftFrom || "08:00";
  const to = params.fallbackShiftTo || "20:00";
  for (const dutyDate of dates) {
    const dow = weekdayFromDutyDate(dutyDate);
    if (dow === "sun") {
      continue;
    }
    duties.set(dutyDate, {
      dutyDate,
      shiftFrom: from,
      shiftTo: to,
      shiftLabel: "Assigned Duty",
      siteName: params.siteName || "Assigned Site",
      postName: params.postName || "Assigned Post",
    });
  }
  return duties;
}

type DayCompletion =
  | "full"
  | "half"
  | "missed"
  | "upcoming"
  | "today"
  | "off"
  | "leave"
  | "onDuty";

function classifyDay(params: {
  dutyDate: string;
  todayKey: string;
  now: Date;
  scheduled?: ScheduledDuty;
  punch?: PunchRow;
  leave: boolean;
  relief?: { method: string; handoverFrom?: string; assignedGuardName?: string };
}): DayCompletion {
  if (params.leave) {
    return "leave";
  }

  const scheduled = params.scheduled;
  const punch = params.punch;
  const isToday = params.dutyDate === params.todayKey;
  const isFuture = params.dutyDate > params.todayKey;
  const isPast = params.dutyDate < params.todayKey;

  if (!scheduled && !punch) {
    return "off";
  }

  if (params.relief?.method === "cover" && !punch) {
    return "leave";
  }

  if (isFuture && scheduled) {
    return "upcoming";
  }

  if (punch) {
    const ended =
      punch.shiftStatus === "ended" || Boolean(punch.punchedOutAt);
    const remainingHandover = params.relief?.method === "remaining";

    if (isToday && !ended) {
      return "onDuty";
    }
    if (remainingHandover) {
      return "half";
    }
    if (!ended && isPast) {
      // Forgot punch-out or left early without relief → incomplete / half
      return "half";
    }
    if (ended) {
      return "full";
    }
    return "full";
  }

  if (!scheduled) {
    return "off";
  }

  if (isToday) {
    const { end } = shiftWindow(
      params.dutyDate,
      scheduled.shiftFrom,
      scheduled.shiftTo
    );
    if (params.now.getTime() > end.getTime()) {
      return "missed";
    }
    return "today";
  }

  if (isPast) {
    return "missed";
  }

  return "upcoming";
}

function calendarStatusOf(completion: DayCompletion): AttendanceHistoryDayStatus {
  switch (completion) {
    case "full":
      return "full";
    case "half":
      return "half";
    case "missed":
      return "missed";
    case "upcoming":
      return "upcoming";
    case "onDuty":
    case "today":
      return "today";
    case "leave":
      return "leave";
    case "off":
      return "off";
    default:
      return "empty";
  }
}

function buildLog(params: {
  completion: DayCompletion;
  dutyDate: string;
  scheduled?: ScheduledDuty;
  punch?: PunchRow;
  relief?: { method: string; handoverFrom?: string; assignedGuardName?: string };
}): AttendanceHistoryLogDto | null {
  const { completion, dutyDate, scheduled, punch, relief } = params;
  const [y, m, d] = dutyDate.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d, 12, 0, 0, 0);
  const dateLabel = formatShortDate(dateObj).toUpperCase();
  const postLabel =
    punch?.postName || scheduled?.postName || scheduled?.shiftLabel || "Duty";
  const siteName = punch?.siteName || scheduled?.siteName || "Assigned Site";
  const late = punch?.punchInStatus?.toLowerCase() === "late";

  if (completion === "off") {
    return {
      id: `off-${dutyDate}`,
      kind: "weeklyOff",
      statusLabel: "WEEKLY OFF",
      dateLabel,
      postLabel: "Roster rest day",
      postIcon: "weekend",
      footerTags: ["Planned Off"],
      punchedAtIso: dateObj.toISOString(),
      dayOfMonth: d,
      dutyDate,
    };
  }

  if (completion === "leave") {
    const covered = relief?.method === "cover";
    return {
      id: `leave-${dutyDate}`,
      kind: "leave",
      statusLabel: covered ? "COVERED • RELIEF" : "ON LEAVE",
      dateLabel,
      postLabel: covered
        ? relief?.assignedGuardName
          ? `Covered by ${relief.assignedGuardName}`
          : "Full shift cover"
        : "Approved leave",
      postIcon: "domain",
      footerTags: covered ? ["Relief Approved"] : ["Approved Leave"],
      punchedAtIso: dateObj.toISOString(),
      dayOfMonth: d,
      dutyDate,
    };
  }

  if (completion === "upcoming") {
    return {
      id: `upcoming-${dutyDate}`,
      kind: "upcoming",
      statusLabel: "UPCOMING SHIFT",
      dateLabel,
      postLabel,
      postIcon: "shield",
      detailPrimaryLabel: "Shift",
      detailPrimaryValue: scheduled
        ? `${scheduled.shiftFrom} – ${scheduled.shiftTo}`
        : "—",
      detailSecondaryLabel: "Site",
      detailSecondaryValue: siteName,
      footerTags: ["Scheduled"],
      punchedAtIso: dateObj.toISOString(),
      dayOfMonth: d,
      dutyDate,
    };
  }

  if (completion === "missed") {
    return {
      id: `missed-${dutyDate}`,
      kind: "missed",
      statusLabel: "SHIFT MISSED",
      dateLabel,
      postLabel,
      postIcon: "shield",
      detailPrimaryLabel: "Shift",
      detailPrimaryValue: scheduled
        ? `${scheduled.shiftFrom} – ${scheduled.shiftTo}`
        : "—",
      detailSecondaryLabel: "Site",
      detailSecondaryValue: siteName,
      footerTags: ["No Punch-in"],
      punchedAtIso: dateObj.toISOString(),
      dayOfMonth: d,
      dutyDate,
    };
  }

  if (completion === "today" && !punch) {
    return {
      id: `today-${dutyDate}`,
      kind: "upcoming",
      statusLabel: "TODAY • CHECK-IN PENDING",
      dateLabel,
      postLabel,
      postIcon: "shield",
      detailPrimaryLabel: "Shift",
      detailPrimaryValue: scheduled
        ? `${scheduled.shiftFrom} – ${scheduled.shiftTo}`
        : "—",
      detailSecondaryLabel: "Site",
      detailSecondaryValue: siteName,
      footerTags: ["Scheduled"],
      punchedAtIso: dateObj.toISOString(),
      dayOfMonth: d,
      dutyDate,
    };
  }

  if (!punch) {
    return null;
  }

  const tags = ["Geofence Verified"];
  if (punch.selfieUrl && !punch.selfieUrl.startsWith("demo://")) {
    tags.push("Selfie Saved");
  }
  if (late) {
    tags.push("Late Login");
  }

  if (completion === "onDuty") {
    tags.push("Live Session");
    return {
      id: punch.id,
      kind: "onDuty",
      statusLabel: late ? "ON DUTY • LATE LOGIN" : "ON DUTY • TODAY",
      dateLabel,
      postLabel,
      postIcon: "shield",
      detailPrimaryLabel: "Punch In",
      detailPrimaryValue: formatPunchTime(punch.punchedAt),
      detailSecondaryLabel: "Status",
      detailSecondaryValue: late ? "Late check-in" : "Shift active",
      detailTertiaryLabel: scheduled ? "Shift" : undefined,
      detailTertiaryValue: scheduled
        ? `${scheduled.shiftFrom} – ${scheduled.shiftTo}`
        : undefined,
      footerTags: tags,
      punchedAtIso: punch.punchedAt.toISOString(),
      dayOfMonth: d,
      dutyDate,
      selfieUrl: punch.selfieUrl,
    };
  }

  if (completion === "half") {
    tags.push(relief?.method === "remaining" ? "Handover" : "Incomplete");
    if (relief?.assignedGuardName) {
      tags.push(`To ${relief.assignedGuardName}`);
    }
    return {
      id: punch.id,
      kind: "half",
      statusLabel: "HALF SHIFT • HANDOVER",
      dateLabel,
      postLabel,
      postIcon: "door-front",
      detailPrimaryLabel: "In",
      detailPrimaryValue: formatPunchTime(punch.punchedAt),
      detailSecondaryLabel: punch.punchedOutAt ? "Out" : "Handover",
      detailSecondaryValue: punch.punchedOutAt
        ? formatPunchTime(punch.punchedOutAt)
        : relief?.handoverFrom || "Mid-shift",
      detailTertiaryLabel: punch.punchedOutAt ? "Worked" : undefined,
      detailTertiaryValue: punch.punchedOutAt
        ? formatDuration(punch.punchedAt, punch.punchedOutAt)
        : undefined,
      footerTags: tags,
      punchedAtIso: punch.punchedAt.toISOString(),
      dayOfMonth: d,
      dutyDate,
      selfieUrl: punch.selfieUrl,
    };
  }

  // full
  tags.push("Full Shift");
  return {
    id: punch.id,
    kind: "full",
    statusLabel: late ? "FULL SHIFT • LATE LOGIN" : "FULL SHIFT • COMPLETE",
    dateLabel,
    postLabel,
    postIcon: "shield",
    detailPrimaryLabel: "In",
    detailPrimaryValue: formatPunchTime(punch.punchedAt),
    detailSecondaryLabel: punch.punchedOutAt ? "Out" : "Site",
    detailSecondaryValue: punch.punchedOutAt
      ? formatPunchTime(punch.punchedOutAt)
      : siteName,
    detailTertiaryLabel: punch.punchedOutAt ? "Total" : undefined,
    detailTertiaryValue: punch.punchedOutAt
      ? formatDuration(punch.punchedAt, punch.punchedOutAt)
      : undefined,
    footerTags: tags,
    punchedAtIso: punch.punchedAt.toISOString(),
    dayOfMonth: d,
    dutyDate,
    selfieUrl: punch.selfieUrl,
  };
}

/**
 * Guard attendance history for a calendar month — joins roster, punches, relief, leave.
 */
export async function listAttendanceHistory(params: {
  guardId: string;
  agencyId?: string;
  year: number;
  month: number;
  postName?: string;
  siteName?: string;
  shiftFrom?: string;
  shiftTo?: string;
}): Promise<AttendanceHistoryResponse> {
  const { year, month } = params;
  const now = new Date();
  const todayKey = toDutyDateKey(now);
  const daysInMonth = new Date(year, month, 0).getDate();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() + 1 === month;
  const { start } = monthBounds(year, month);

  const [assignments, punches, reliefMap, leaveDates] = await Promise.all([
    loadAssignments(params.guardId, params.agencyId || ""),
    loadPunches(params.guardId, year, month, params.postName),
    loadApprovedReliefDutyDates(params.guardId),
    loadApprovedLeaveDates(params.guardId, year, month),
  ]);

  const scheduled = buildScheduledDuties({
    year,
    month,
    assignments,
    fallbackShiftFrom: params.shiftFrom,
    fallbackShiftTo: params.shiftTo,
    siteName: params.siteName,
    postName: params.postName,
  });

  // Include punch-only days that weren't in the soft roster
  for (const dutyDate of punches.keys()) {
    if (!scheduled.has(dutyDate)) {
      const punch = punches.get(dutyDate)!;
      scheduled.set(dutyDate, {
        dutyDate,
        shiftFrom: params.shiftFrom || "08:00",
        shiftTo: params.shiftTo || "20:00",
        shiftLabel: "Duty",
        siteName: punch.siteName,
        postName: punch.postName,
      });
    }
  }

  const calendarDays: AttendanceHistoryResponse["calendarDays"] = [];
  const logs: AttendanceHistoryLogDto[] = [];
  let presentDays = 0;
  let halfDays = 0;
  let missedDays = 0;
  let leaveDays = 0;
  let weeklyOffDays = 0;
  let totalHours = 0;
  const defaultHours = estimateShiftHours(params.shiftFrom, params.shiftTo);

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dutyDate = dutyDateFromParts(year, month, day);
    const duty = scheduled.get(dutyDate);
    const punch = punches.get(dutyDate);
    const relief = reliefMap.get(dutyDate);
    const onLeave = leaveDates.has(dutyDate);

    const completion = classifyDay({
      dutyDate,
      todayKey,
      now,
      scheduled: duty,
      punch,
      leave: onLeave,
      relief,
    });

    calendarDays.push({ day, status: calendarStatusOf(completion) });

    if (completion === "full" || completion === "onDuty") {
      presentDays += 1;
    } else if (completion === "half") {
      presentDays += 1;
      halfDays += 1;
    } else if (completion === "missed") {
      missedDays += 1;
    } else if (completion === "leave") {
      leaveDays += 1;
    } else if (completion === "off") {
      weeklyOffDays += 1;
    }

    if (punch?.punchedOutAt) {
      totalHours += durationHours(punch.punchedAt, punch.punchedOutAt);
    } else if (completion === "full" || completion === "onDuty") {
      totalHours += defaultHours;
    } else if (completion === "half") {
      totalHours += Math.max(1, Math.round(defaultHours / 2));
    }

    // Calendar always paints the day; logs focus on actionable history + near-term upcoming.
    const includeInLogs =
      completion === "full" ||
      completion === "half" ||
      completion === "missed" ||
      completion === "onDuty" ||
      completion === "leave" ||
      completion === "today" ||
      (completion === "upcoming" &&
        isCurrentMonth &&
        dutyDate <= addDaysToDutyDate(todayKey, 7)) ||
      (completion === "off" && dutyDate <= todayKey);

    if (!includeInLogs) {
      continue;
    }

    const log = buildLog({ completion, dutyDate, scheduled: duty, punch, relief });
    if (log) {
      logs.push(log);
    }
  }

  // Newest first
  logs.sort((a, b) => (a.dutyDate! < b.dutyDate! ? 1 : -1));

  const monthLabel = formatMonthLabel(year, month);
  const worked = presentDays;
  const scheduledPast = [...scheduled.keys()].filter((d) => d <= todayKey).length;
  const coveragePct =
    scheduledPast > 0
      ? Math.min(100, Math.round((worked / scheduledPast) * 100))
      : worked > 0
        ? 100
        : 0;

  return {
    year,
    month,
    monthLabel,
    cycleLabel: isCurrentMonth ? "Current Cycle" : "Past Cycle",
    cycleNote: `Cycle: 01 ${monthLabel.split(" ")[0]} – ${String(daysInMonth).padStart(2, "0")} ${monthLabel.split(" ")[0]} • Roster + verified punches`,
    punctualityTitle: `${worked} Days Present • ${missedDays} Missed • ${coveragePct}% coverage`,
    punctualitySubtitle:
      worked > 0 || missedDays > 0
        ? "Full, half (handover), missed and upcoming from your schedule"
        : "No scheduled or punched shifts for this month yet",
    stats: {
      presentDays: worked,
      totalHours: Math.round(totalHours),
      leaveDays,
      weeklyOffDays,
      missedDays,
      halfDays,
    },
    calendarDays,
    leadingEmpty: mondayBasedWeekday(start),
    logs,
    filterCounts: {
      all: logs.length,
      present: logs.filter((l) =>
        ["full", "half", "onDuty", "present"].includes(l.kind)
      ).length,
      missed: logs.filter((l) => l.kind === "missed").length,
      half: logs.filter((l) => l.kind === "half").length,
      weeklyOff: logs.filter((l) => l.kind === "weeklyOff" || l.kind === "leave")
        .length,
    },
  };
}
