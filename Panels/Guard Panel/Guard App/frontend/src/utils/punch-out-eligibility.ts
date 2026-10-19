import type { TodayShiftStatus } from '../api/guard-api';

const EARLY_END_BLOCKED_MESSAGE =
  'You cannot end your shift before scheduled end time unless a relief guard has been assigned. Request relief and wait for approval first.';

/**
 * Returns a blocking message when early punch-out is not allowed; otherwise null.
 */
export function resolvePunchOutBlockedMessage(
  today: Pick<TodayShiftStatus, 'shiftActive' | 'punchOutEligibility'> | null | undefined,
): string | null {
  if (!today?.shiftActive) {
    return null;
  }
  const eligibility = today.punchOutEligibility;
  if (!eligibility) {
    return null;
  }
  if (eligibility.allowed) {
    return null;
  }
  return eligibility.message?.trim() || EARLY_END_BLOCKED_MESSAGE;
}
