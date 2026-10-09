export const IST_TIME_ZONE = "Asia/Kolkata";

/** Calendar duty date in IST (YYYY-MM-DD) for indexed attendance queries. */
export function toDutyDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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
  return new Date(`${dutyDateKey}T${hh}:${mm}:00+05:30`);
}
