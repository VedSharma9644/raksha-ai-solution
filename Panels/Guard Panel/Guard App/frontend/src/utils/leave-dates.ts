export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date: Date, days: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function formatLeaveDayMeta(date: Date): string {
  const weekday = date.toLocaleDateString('en-IN', { weekday: 'long' });
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const key = toDateKey(date);
  if (key === toDateKey(today)) {
    return `${weekday} (Today)`;
  }
  if (key === toDateKey(tomorrow)) {
    return `${weekday} (Tomorrow)`;
  }
  const diffDays = Math.round((startOfDay(date).getTime() - today.getTime()) / 86_400_000);
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

export function resolveLeavePreset(presetKey: string): { start: Date; end: Date } | null {
  const today = startOfDay(new Date());
  if (presetKey === 'tomorrow') {
    const start = addDays(today, 1);
    return { start, end: start };
  }
  if (presetKey === 'next2') {
    const start = addDays(today, 1);
    return { start, end: addDays(start, 1) };
  }
  if (presetKey === 'weekend') {
    const day = today.getDay(); // 0 Sun … 6 Sat
    const daysUntilSat = (6 - day + 7) % 7 || 7;
    const start = addDays(today, daysUntilSat);
    return { start, end: addDays(start, 1) };
  }
  return null;
}
