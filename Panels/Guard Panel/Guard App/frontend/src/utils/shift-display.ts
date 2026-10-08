/** Shared formatting for assigned shift times shown on Home + Schedule. */

export function parseHhMm(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }
  return { hours, minutes };
}

export function formatShiftClock(hhmm: string): string {
  const parsed = parseHhMm(hhmm);
  if (!parsed) {
    return hhmm || '—';
  }
  const period = parsed.hours >= 12 ? 'PM' : 'AM';
  const hour12 = parsed.hours % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')} ${period}`;
}

export function formatShiftTimeRange(shiftFrom: string, shiftTo: string): string {
  return `${formatShiftClock(shiftFrom)} – ${formatShiftClock(shiftTo)}`;
}

export function shiftDurationHours(shiftFrom: string, shiftTo: string): number {
  const from = parseHhMm(shiftFrom);
  const to = parseHhMm(shiftTo);
  if (!from || !to) {
    return 0;
  }
  let start = from.hours * 60 + from.minutes;
  let end = to.hours * 60 + to.minutes;
  if (end <= start) {
    end += 24 * 60;
  }
  return Math.round((end - start) / 60);
}

export function formatDurationLabel(shiftFrom: string, shiftTo: string): string {
  const hours = shiftDurationHours(shiftFrom, shiftTo);
  if (hours <= 0) {
    return '';
  }
  return `(${hours} Hours)`;
}

export function isNightDuty(shiftFrom: string, shiftTo: string): boolean {
  const from = parseHhMm(shiftFrom);
  const to = parseHhMm(shiftTo);
  if (!from || !to) {
    return false;
  }
  const start = from.hours * 60 + from.minutes;
  const end = to.hours * 60 + to.minutes;
  return end <= start || from.hours >= 18;
}

export function dutyTypeLabel(shiftFrom: string, shiftTo: string): string {
  const hours = shiftDurationHours(shiftFrom, shiftTo);
  const kind = isNightDuty(shiftFrom, shiftTo) ? 'Night Duty' : 'Day Duty';
  return hours > 0 ? `${kind} • ${hours} Hours Duration` : kind;
}

export function todayShiftHeading(shiftFrom: string, shiftTo: string): string {
  const kind = isNightDuty(shiftFrom, shiftTo) ? 'NIGHT DUTY' : 'DAY DUTY';
  return `TODAY'S SHIFT • ${kind}`;
}

function shiftMomentToday(hhmm: string, now: Date): Date | null {
  const parsed = parseHhMm(hhmm);
  if (!parsed) {
    return null;
  }
  const at = new Date(now);
  at.setSeconds(0, 0);
  at.setHours(parsed.hours, parsed.minutes, 0, 0);
  return at;
}

export function getShiftWindow(params: {
  shiftFrom: string;
  shiftTo: string;
  now?: Date;
}): { start: Date; end: Date } | null {
  const now = params.now ?? new Date();
  const start = shiftMomentToday(params.shiftFrom, now);
  let end = shiftMomentToday(params.shiftTo, now);
  if (!start || !end) {
    return null;
  }
  if (end <= start) {
    end = new Date(end);
    end.setDate(end.getDate() + 1);
  }
  return { start, end };
}

/** True when current time is after shift start and before shift end. */
export function isWithinShiftAfterStart(params: {
  shiftFrom: string;
  shiftTo: string;
  now?: Date;
}): boolean {
  const now = params.now ?? new Date();
  const window = getShiftWindow(params);
  if (!window) {
    return false;
  }
  return now >= window.start && now < window.end;
}

export function minutesPastShiftStart(params: {
  shiftFrom: string;
  shiftTo: string;
  now?: Date;
}): number {
  const now = params.now ?? new Date();
  const window = getShiftWindow(params);
  if (!window) {
    return 0;
  }
  return Math.max(0, Math.floor((now.getTime() - window.start.getTime()) / 60_000));
}

export function formatDelayLabel(minutesLate: number): string {
  if (minutesLate <= 0) {
    return '';
  }
  if (minutesLate < 60) {
    return `Delayed by ${minutesLate} min`;
  }
  const hours = Math.floor(minutesLate / 60);
  const mins = minutesLate % 60;
  return mins > 0 ? `Delayed by ${hours}h ${mins}m` : `Delayed by ${hours}h`;
}

export function formatCountdownLabel(params: {
  shiftFrom: string;
  shiftTo: string;
  shiftActive: boolean;
  now?: Date;
}): string {
  const now = params.now ?? new Date();
  const start = shiftMomentToday(params.shiftFrom, now);
  let end = shiftMomentToday(params.shiftTo, now);
  if (!start || !end) {
    return '';
  }
  if (end <= start) {
    end = new Date(end);
    end.setDate(end.getDate() + 1);
  }

  if (params.shiftActive) {
    const minsLeft = Math.floor((end.getTime() - now.getTime()) / 60_000);
    if (minsLeft <= 0) {
      return 'Shift ending';
    }
    if (minsLeft < 60) {
      return `Ends in ${minsLeft} min`;
    }
    const hours = Math.floor(minsLeft / 60);
    const mins = minsLeft % 60;
    return mins > 0 ? `Ends in ${hours}h ${mins}m` : `Ends in ${hours}h`;
  }

  const minsToStart = Math.floor((start.getTime() - now.getTime()) / 60_000);
  if (minsToStart > 0) {
    if (minsToStart < 60) {
      return `Starts in ${minsToStart} min`;
    }
    const hours = Math.floor(minsToStart / 60);
    const mins = minsToStart % 60;
    return mins > 0 ? `Starts in ${hours}h ${mins}m` : `Starts in ${hours}h`;
  }

  if (now < end) {
    const delayed = Math.floor((now.getTime() - start.getTime()) / 60_000);
    return formatDelayLabel(delayed) || 'Shift window open';
  }
  return 'Shift ended';
}

export function formatTodayBadge(now = new Date()): string {
  const day = now.getDate();
  const month = now.toLocaleString('en-IN', { month: 'short' });
  return `Today • ${day} ${month}`;
}

export function firstNameFromFullName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0];
  return part || 'Guard';
}

export function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'G';
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}
