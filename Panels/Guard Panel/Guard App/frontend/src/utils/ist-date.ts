/** India Standard Time helpers for Guard client duty dates / shift windows. */

export const IST_TIME_ZONE = 'Asia/Kolkata';
export const IST_OFFSET = '+05:30';

/** Calendar duty date in IST (YYYY-MM-DD). */
export function toIstDutyDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Instant of an IST wall-clock time on the given duty date (YYYY-MM-DD). */
export function istWallClockToDate(
  dutyDateKey: string,
  hours: number,
  minutes: number,
): Date {
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return new Date(`${dutyDateKey}T${hh}:${mm}:00${IST_OFFSET}`);
}

function parseHhMm(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

/** Shift window as absolute instants in IST (overnight spills +24h). */
export function shiftWindowIst(
  dutyDate: string,
  shiftFrom: string,
  shiftTo: string,
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

export function addDaysToIstDutyDate(
  dutyDate: string,
  offsetDays: number,
): string {
  const [y, m, d] = dutyDate.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + offsetDays, 6, 30));
  return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, '0')}-${String(
    utc.getUTCDate(),
  ).padStart(2, '0')}`;
}
