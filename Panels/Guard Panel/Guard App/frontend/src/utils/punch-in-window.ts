import { shiftWindowIst, toIstDutyDateKey } from './ist-date';

/** Must match server `PUNCH_IN_EARLY_MINUTES` / `PUNCH_IN_LATE_GRACE_MINUTES`. */
export const PUNCH_IN_EARLY_MINUTES = 15;
export const PUNCH_IN_LATE_GRACE_MINUTES = 15;

export type LocalPunchInWindow = {
  open: boolean;
  message: string | null;
  opensAt: Date | null;
  closesAt: Date | null;
  minutesUntilOpen: number | null;
};

/**
 * Client-side punch-in gate (IST). Fail closed when times cannot be resolved.
 * Opens 15 minutes before shift start; after start counts as late until +15 min.
 */
export function evaluateLocalPunchInWindow(params: {
  shiftFrom?: string | null;
  shiftTo?: string | null;
  dutyDate?: string | null;
  now?: Date;
  shiftActive?: boolean;
}): LocalPunchInWindow {
  if (params.shiftActive) {
    return {
      open: false,
      message: null,
      opensAt: null,
      closesAt: null,
      minutesUntilOpen: null,
    };
  }

  const shiftFrom = params.shiftFrom?.trim() || '';
  const shiftTo = params.shiftTo?.trim() || shiftFrom || '20:00';
  if (!/^\d{1,2}:\d{2}$/.test(shiftFrom)) {
    return {
      open: false,
      message:
        'Punch-in unavailable — shift start time is missing. Pull to refresh or contact your supervisor.',
      opensAt: null,
      closesAt: null,
      minutesUntilOpen: null,
    };
  }

  const now = params.now ?? new Date();
  const dutyDate = params.dutyDate?.trim() || toIstDutyDateKey(now);
  const { start } = shiftWindowIst(dutyDate, shiftFrom, shiftTo);
  const opensAt = new Date(start.getTime() - PUNCH_IN_EARLY_MINUTES * 60_000);
  const closesAt = new Date(
    start.getTime() + PUNCH_IN_LATE_GRACE_MINUTES * 60_000,
  );

  if (now.getTime() < opensAt.getTime()) {
    const minutesUntilOpen = Math.ceil(
      (opensAt.getTime() - now.getTime()) / 60_000,
    );
    return {
      open: false,
      message: `Punch-in opens ${PUNCH_IN_EARLY_MINUTES} minutes before your shift start (${shiftFrom}). Come back in about ${minutesUntilOpen} min.`,
      opensAt,
      closesAt,
      minutesUntilOpen,
    };
  }

  if (now.getTime() > closesAt.getTime()) {
    return {
      open: false,
      message: `Punch-in closed. Late check-in is only allowed within ${PUNCH_IN_LATE_GRACE_MINUTES} minutes after your shift start (${shiftFrom}).`,
      opensAt,
      closesAt,
      minutesUntilOpen: null,
    };
  }

  return {
    open: true,
    message: null,
    opensAt,
    closesAt,
    minutesUntilOpen: null,
  };
}

/** Prefer server flag when closed; always also enforce local IST early/late bounds. */
export function resolvePunchInBlockedMessage(params: {
  shiftFrom?: string | null;
  shiftTo?: string | null;
  dutyDate?: string | null;
  shiftActive?: boolean;
  serverOpen?: boolean | null;
  serverMessage?: string | null;
  now?: Date;
}): string | null {
  if (params.shiftActive) {
    return null;
  }
  const local = evaluateLocalPunchInWindow(params);
  if (!local.open) {
    return local.message;
  }
  if (params.serverOpen === false) {
    return (
      params.serverMessage?.trim() ||
      'Punch-in is only open from 15 minutes before shift start until 15 minutes after.'
    );
  }
  return null;
}
