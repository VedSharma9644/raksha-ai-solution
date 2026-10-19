/**
 * Regular interval check-in during an active shift.
 * Window: due at lastEvent + intervalMinutes; late for 15 minutes; then missed
 * until the next slot opens (dueAt + intervalMinutes).
 *
 * Slots due at or after scheduled shift end are not requested — the last in-shift
 * photo stays a normal interval check-in; ending the shift is a separate action.
 */

export const INTERVAL_CHECKIN_GRACE_MINUTES = 15;

export type IntervalCheckinPunctuality = "on_time" | "late";

export type IntervalCheckinWindowStatus =
  | "inactive"
  | "waiting"
  | "due"
  | "late"
  | "missed"
  /** No more interval photos for this shift (next slot would be after shift end). */
  | "complete";

export type IntervalCheckinStatusDto = {
  enabled: boolean;
  intervalMinutes: number | null;
  status: IntervalCheckinWindowStatus;
  /** ISO — when the current slot became / becomes due */
  dueAt: string | null;
  /** ISO — end of late window for the current slot */
  graceEndsAt: string | null;
  /** ISO — next actionable due (waiting/missed → next open; due/late → same as dueAt) */
  nextDueAt: string | null;
  completedCount: number;
  lastCheckinAt: string | null;
  graceMinutes: number;
};

function toIso(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

function isDueAtOrAfterShiftEnd(
  dueAt: Date,
  shiftEndsAt: Date | null | undefined
): boolean {
  if (!shiftEndsAt) {
    return false;
  }
  return dueAt.getTime() >= shiftEndsAt.getTime();
}

/**
 * Compute the current interval-check-in window for the Guard app /today API.
 */
export function computeIntervalCheckinStatus(params: {
  intervalMinutes: number | null | undefined;
  shiftActive: boolean;
  punchInAt: Date | null;
  lastCheckinAt: Date | null;
  completedCount?: number;
  now?: Date;
  /** Absolute shift end; interval slots at/after this time are not requested. */
  shiftEndsAt?: Date | null;
}): IntervalCheckinStatusDto {
  const now = params.now ?? new Date();
  const intervalMinutes =
    typeof params.intervalMinutes === "number" &&
    Number.isFinite(params.intervalMinutes) &&
    params.intervalMinutes >= 5
      ? Math.floor(params.intervalMinutes)
      : null;

  const base: IntervalCheckinStatusDto = {
    enabled: false,
    intervalMinutes: null,
    status: "inactive",
    dueAt: null,
    graceEndsAt: null,
    nextDueAt: null,
    completedCount: params.completedCount ?? 0,
    lastCheckinAt: toIso(params.lastCheckinAt),
    graceMinutes: INTERVAL_CHECKIN_GRACE_MINUTES,
  };

  if (!params.shiftActive || !intervalMinutes || !params.punchInAt) {
    return base;
  }

  const intervalMs = intervalMinutes * 60_000;
  const graceMs = INTERVAL_CHECKIN_GRACE_MINUTES * 60_000;
  const shiftEndsAt = params.shiftEndsAt ?? null;
  const anchor = params.lastCheckinAt ?? params.punchInAt;
  let dueAt = new Date(anchor.getTime() + intervalMs);

  if (isDueAtOrAfterShiftEnd(dueAt, shiftEndsAt)) {
    return {
      ...base,
      enabled: true,
      intervalMinutes,
      status: "complete",
    };
  }

  // Advance past fully elapsed missed slots until we land on the active window.
  while (now.getTime() >= dueAt.getTime() + graceMs) {
    const nextSlotDue = new Date(dueAt.getTime() + intervalMs);
    if (now.getTime() < nextSlotDue.getTime()) {
      if (isDueAtOrAfterShiftEnd(nextSlotDue, shiftEndsAt)) {
        return {
          ...base,
          enabled: true,
          intervalMinutes,
          status: "complete",
          dueAt: toIso(dueAt),
          graceEndsAt: toIso(new Date(dueAt.getTime() + graceMs)),
          nextDueAt: null,
        };
      }
      return {
        ...base,
        enabled: true,
        intervalMinutes,
        status: "missed",
        dueAt: toIso(dueAt),
        graceEndsAt: toIso(new Date(dueAt.getTime() + graceMs)),
        nextDueAt: toIso(nextSlotDue),
      };
    }
    dueAt = nextSlotDue;
    if (isDueAtOrAfterShiftEnd(dueAt, shiftEndsAt)) {
      return {
        ...base,
        enabled: true,
        intervalMinutes,
        status: "complete",
      };
    }
  }

  if (isDueAtOrAfterShiftEnd(dueAt, shiftEndsAt)) {
    return {
      ...base,
      enabled: true,
      intervalMinutes,
      status: "complete",
    };
  }

  const graceEndsAt = new Date(dueAt.getTime() + graceMs);

  if (now.getTime() < dueAt.getTime()) {
    return {
      ...base,
      enabled: true,
      intervalMinutes,
      status: "waiting",
      dueAt: toIso(dueAt),
      graceEndsAt: toIso(graceEndsAt),
      nextDueAt: toIso(dueAt),
    };
  }

  // Inside the actionable window (on-time or late within grace).
  // Still a regular interval photo — not an end-shift selfie.
  const status: IntervalCheckinWindowStatus =
    now.getTime() > dueAt.getTime() + 60_000 ? "late" : "due";

  return {
    ...base,
    enabled: true,
    intervalMinutes,
    status,
    dueAt: toIso(dueAt),
    graceEndsAt: toIso(graceEndsAt),
    nextDueAt: toIso(dueAt),
  };
}

export function evaluateIntervalCheckinPunctuality(params: {
  punchedAt: Date;
  dueAt: Date;
}): IntervalCheckinPunctuality {
  const graceMs = INTERVAL_CHECKIN_GRACE_MINUTES * 60_000;
  if (params.punchedAt.getTime() <= params.dueAt.getTime() + 60_000) {
    return "on_time";
  }
  if (params.punchedAt.getTime() <= params.dueAt.getTime() + graceMs) {
    return "late";
  }
  throw Object.assign(
    new Error(
      `Check-in window closed. Late check-ins are only allowed for ${INTERVAL_CHECKIN_GRACE_MINUTES} minutes after the due time.`
    ),
    { statusCode: 400 }
  );
}
