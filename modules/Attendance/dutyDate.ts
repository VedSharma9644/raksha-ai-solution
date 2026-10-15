/**
 * India Standard Time helpers for duty dates and shift windows.
 * Cloud Run (and most servers) run in UTC — never use `new Date(y, m, d, h, min)`
 * for product wall-clock times; that interprets h/min in the host timezone.
 */

export const IST_TIME_ZONE = "Asia/Kolkata";
export const IST_OFFSET = "+05:30";

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const JS_TO_DOW: DayOfWeek[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

/** Calendar duty date in IST (YYYY-MM-DD) for indexed attendance queries. */
export function toDutyDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function dutyDateFromParts(
  year: number,
  month: number,
  day: number
): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Gregorian days-in-month — host-TZ independent. */
export function daysInCalendarMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Inclusive duty-date keys for a calendar month. */
export function eachDutyDateInMonth(year: number, month: number): string[] {
  const days = daysInCalendarMonth(year, month);
  const out: string[] = [];
  for (let day = 1; day <= days; day += 1) {
    out.push(dutyDateFromParts(year, month, day));
  }
  return out;
}

/**
 * Absolute Date bounds for punches in an IST calendar month: [start, end).
 * start = 1st 00:00 IST, end = 1st of next month 00:00 IST.
 */
export function monthBoundsIst(
  year: number,
  month: number
): { start: Date; end: Date } {
  const start = istWallClockToDate(dutyDateFromParts(year, month, 1), 0, 0);
  let endYear = year;
  let endMonth = month + 1;
  if (endMonth > 12) {
    endMonth = 1;
    endYear += 1;
  }
  const end = istWallClockToDate(dutyDateFromParts(endYear, endMonth, 1), 0, 0);
  return { start, end };
}

/** Midnight IST for a duty date (defaults to today's IST date). */
export function startOfIstDay(dutyDateKey?: string): Date {
  return istWallClockToDate(dutyDateKey ?? toDutyDateKey(), 0, 0);
}

/**
 * Add calendar days to a YYYY-MM-DD duty date (civil calendar, not host TZ).
 * Uses noon-ish UTC so the civil date is stable.
 */
export function addDaysToDutyDate(dutyDate: string, offsetDays: number): string {
  const [y, m, d] = dutyDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + offsetDays, 6, 30));
  return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, "0")}-${String(
    utc.getUTCDate()
  ).padStart(2, "0")}`;
}

/**
 * Weekday for an India duty date (civil). Uses 06:30 UTC ≈ noon IST.
 */
export function weekdayFromDutyDate(dutyDate: string): DayOfWeek {
  const [y, m, d] = dutyDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 6, 30));
  return JS_TO_DOW[utc.getUTCDay()] ?? "mon";
}

/** JS getDay()-style weekday (0=Sun … 6=Sat) for a duty date. */
export function jsWeekdayFromDutyDate(dutyDate: string): number {
  const [y, m, d] = dutyDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 6, 30)).getUTCDay();
}

export function parseHhMm(
  value: string
): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

/**
 * Instant of an IST wall-clock time on the given duty date (YYYY-MM-DD).
 * Shift times in the product are India local, not server local.
 */
export function istWallClockToDate(
  dutyDateKey: string,
  hours: number,
  minutes: number
): Date {
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return new Date(`${dutyDateKey}T${hh}:${mm}:00${IST_OFFSET}`);
}

/**
 * Shift window as absolute instants in IST.
 * Overnight shifts (end <= start) spill into the next calendar day (+24h).
 */
export function shiftWindowIst(
  dutyDate: string,
  shiftFrom: string,
  shiftTo: string
): { start: Date; end: Date } {
  const from = parseHhMm(shiftFrom) ?? { hours: 8, minutes: 0 };
  const to = parseHhMm(shiftTo) ?? { hours: 20, minutes: 0 };
  const start = istWallClockToDate(dutyDate, from.hours, from.minutes);
  let end = istWallClockToDate(dutyDate, to.hours, to.minutes);
  if (end.getTime() <= start.getTime()) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }
  return { start, end };
}

/** Punch clock time for Guard UI — always Asia/Kolkata (Cloud Run is UTC). */
export function formatIstPunchTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    timeZone: IST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Long punch date for Attendance Marked screen — always Asia/Kolkata. */
export function formatIstPunchDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    timeZone: IST_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Short weekday date for attendance history rows. */
export function formatIstShortDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    timeZone: IST_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Month label (e.g. "October 2026") stable on any host TZ. */
export function formatIstMonthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1, 12)).toLocaleDateString("en-IN", {
    timeZone: IST_TIME_ZONE,
    month: "long",
    year: "numeric",
  });
}

/** Short day label for a duty date (e.g. "Wed, 15 Oct"). */
export function formatIstDutyDayLabel(dutyDate: string): string {
  const [y, m, d] = dutyDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 6, 30));
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(utc);
}
