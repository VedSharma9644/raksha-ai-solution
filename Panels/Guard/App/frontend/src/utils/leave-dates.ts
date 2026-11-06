import {
  addDaysToIstDutyDate,
  istWallClockToDate,
  toIstDutyDateKey,
} from './ist-date';

/** Start of the IST calendar day for a Date (or today). */
export function startOfDay(date: Date = new Date()): Date {
  return istWallClockToDate(toIstDutyDateKey(date), 0, 0);
}

export function addDays(date: Date, days: number): Date {
  const key = addDaysToIstDutyDate(toIstDutyDateKey(date), days);
  return istWallClockToDate(key, 12, 0);
}

export function toDateKey(date: Date): string {
  return toIstDutyDateKey(date);
}

export function inclusiveDayCount(start: Date, end: Date): number {
  const a = startOfDay(start).getTime();
  const b = startOfDay(end).getTime();
  if (b < a) {
    return 0;
  }
  return Math.floor((b - a) / 86_400_000) + 1;
}

export function formatLeaveDayValue(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
  });
}

export function formatLeaveDayMeta(date: Date): string {
  const weekday = date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
  });
  const todayKey = toIstDutyDateKey();
  const tomorrowKey = addDaysToIstDutyDate(todayKey, 1);
  const key = toDateKey(date);
  if (key === todayKey) {
    return `${weekday} (Today)`;
  }
  if (key === tomorrowKey) {
    return `${weekday} (Tomorrow)`;
  }
  const todayMs = istWallClockToDate(todayKey, 0, 0).getTime();
  const diffDays = Math.round(
    (startOfDay(date).getTime() - todayMs) / 86_400_000,
  );
  if (diffDays > 0 && diffDays <= 7) {
    return `${weekday} (This week)`;
  }
  return weekday;
}

export function formatDurationValue(dayCount: number): string {
  return `${dayCount} Day${dayCount === 1 ? '' : 's'}`;
}

export function formatDurationMeta(dayCount: number): string {
  return `(${dayCount * 8} Duty Hrs)`;
}

export function defaultLeaveRange(): { start: Date; end: Date } {
  const start = addDays(new Date(), 1);
  const end = addDays(start, 2);
  return { start, end };
}

export function resolveLeavePreset(
  presetKey: string,
): { start: Date; end: Date } | null {
  const todayKey = toIstDutyDateKey();
  const today = istWallClockToDate(todayKey, 12, 0);
  if (presetKey === 'tomorrow') {
    const start = addDays(today, 1);
    return { start, end: start };
  }
  if (presetKey === 'next2') {
    const start = addDays(today, 1);
    return { start, end: addDays(start, 1) };
  }
  if (presetKey === 'weekend') {
    // IST weekday via noon UTC≈IST for the duty key
    const [y, m, d] = todayKey.split('-').map(Number);
    const utc = new Date(Date.UTC(y, m - 1, d, 6, 30));
    const day = utc.getUTCDay(); // 0 Sun … 6 Sat
    const daysUntilSat = (6 - day + 7) % 7 || 7;
    const start = addDays(today, daysUntilSat);
    return { start, end: addDays(start, 1) };
  }
  return null;
}
