import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  fetchTodayShift,
  type IntervalCheckinStatus,
  type TodayShiftStatus,
} from '../api/guard-api';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';
import {
  ROSTER_FOREGROUND_POLL_MS,
  subscribeRosterSync,
} from '../sync/rosterSync';
import {
  dutyTypeLabel,
  formatCountdownLabel,
  formatDelayLabel,
  formatDurationLabel,
  formatShiftTimeRange,
  formatTodayBadge,
  isNightDuty,
  isWithinShiftAfterStart,
  minutesPastShiftStart,
  todayShiftHeading,
} from '../utils/shift-display';
import { useForegroundInterval } from './useForegroundInterval';

export type DutyBadgeTone = 'neutral' | 'warning' | 'danger' | 'success';

export type GuardDutyAssignmentView = {
  siteName: string;
  postName: string;
  shiftFrom: string;
  shiftTo: string;
  timeRange: string;
  durationLabel: string;
  dutyType: string;
  shiftLabel: string;
  todayBadge: string;
  statusBadge: string;
  statusText: string;
  countdownLabel: string;
  badgeTone: DutyBadgeTone;
  shiftActive: boolean;
  isDelayed: boolean;
  punchedAt: string | null;
  punchInStatus: string | null;
  isNight: boolean;
  dutySource: 'roster' | 'profile';
  hasLaterReplacement: boolean;
  assignmentId: string | null;
  /** Shared /today interval window — single fetch for Home banner + duty UI. */
  intervalCheckin: IntervalCheckinStatus | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

/** Fields that affect Home / duty UI — ignore volatile noise. */
function todaySignature(data: TodayShiftStatus | null): string {
  if (!data) {
    return '';
  }
  return [
    data.shiftActive ? '1' : '0',
    data.openPunchInId ?? '',
    data.punchedAt ?? '',
    data.punchedOutAt ?? '',
    data.shiftCompleted ? '1' : '0',
    data.punchInStatus ?? '',
    data.siteName ?? '',
    data.postName ?? '',
    data.assignedSiteId ?? '',
    data.shiftFrom ?? '',
    data.shiftTo ?? '',
    data.shiftLabel ?? '',
    data.dutySource ?? '',
    data.assignmentId ?? '',
    data.hasLaterReplacement ? '1' : '0',
    data.intervalCheckinMinutes ?? '',
    data.intervalCheckin?.status ?? '',
    data.intervalCheckin?.dueAt ?? '',
    data.intervalCheckin?.graceEndsAt ?? '',
    data.intervalCheckin?.nextDueAt ?? '',
    data.intervalCheckin?.completedCount ?? '',
    data.punchInWindow?.open === false ? '0' : '1',
    data.punchInWindow?.message ?? '',
  ].join('|');
}

const GuardDutyAssignmentContext =
  createContext<GuardDutyAssignmentView | null>(null);

/**
 * Single owner of GET /attendance/today for the authenticated session.
 * All screens should read via useGuardDutyAssignment() — do not fetch /today elsewhere.
 */
export function GuardDutyAssignmentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    authToken,
    guardUser,
    shiftActive: navShiftActive,
    patchGuardUser,
    setShiftActive,
  } = useGuardAppNavigation();
  const [today, setToday] = useState<TodayShiftStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const signatureRef = useRef('');
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!authToken) {
        setToday(null);
        signatureRef.current = '';
        hasLoadedRef.current = false;
        return;
      }
      const silent = opts?.silent === true && hasLoadedRef.current;
      if (!silent) {
        setIsLoading(true);
      }
      try {
        const data = await fetchTodayShift(authToken);
        const nextSig = todaySignature(data);
        if (nextSig !== signatureRef.current) {
          signatureRef.current = nextSig;
          setToday(data);
          setShiftActive(Boolean(data.shiftActive));
          if (data.shiftFrom || data.shiftTo || data.siteName || data.postName) {
            patchGuardUser({
              ...(data.shiftFrom ? { shiftFrom: data.shiftFrom } : {}),
              ...(data.shiftTo ? { shiftTo: data.shiftTo } : {}),
              ...(data.siteName ? { siteName: data.siteName } : {}),
              ...(data.postName ? { postName: data.postName } : {}),
              ...(data.assignedSiteId
                ? { assignedSiteId: data.assignedSiteId }
                : {}),
            });
          }
        }
        hasLoadedRef.current = true;
      } catch {
        // Keep last known assignment on transient errors
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [authToken, patchGuardUser, setShiftActive],
  );

  useEffect(() => {
    void refresh({ silent: false });
  }, [refresh]);

  useEffect(() => {
    return subscribeRosterSync(() => {
      void refresh({ silent: true });
    });
  }, [refresh]);

  useForegroundInterval(
    () => {
      void refresh({ silent: true });
    },
    ROSTER_FOREGROUND_POLL_MS,
    Boolean(authToken),
  );

  useEffect(() => {
    const clock = setInterval(() => {
      setTick((value) => value + 1);
    }, 60_000);
    return () => clearInterval(clock);
  }, []);

  const value = useMemo((): GuardDutyAssignmentView => {
    void tick; // recompute countdown/delay every minute
    const shiftFrom = today?.shiftFrom || guardUser?.shiftFrom || '08:00';
    const shiftTo = today?.shiftTo || guardUser?.shiftTo || '20:00';
    const siteName =
      (today?.siteName || guardUser?.siteName || '').trim() || 'Assigned site';
    const postName =
      (today?.postName || guardUser?.postName || '').trim() || 'Assigned post';
    const shiftActive = today?.shiftActive ?? navShiftActive;
    const punchedAt = today?.punchedAt ?? null;
    const punchInStatus = today?.punchInStatus ?? null;
    const hasLaterReplacement = Boolean(today?.hasLaterReplacement);
    const dutySource = today?.dutySource === 'roster' ? 'roster' : 'profile';
    const delayedWaiting =
      !shiftActive && isWithinShiftAfterStart({ shiftFrom, shiftTo });
    const minutesLate = delayedWaiting
      ? minutesPastShiftStart({ shiftFrom, shiftTo })
      : 0;

    let statusBadge = 'ON DUTY SOON';
    let statusText = hasLaterReplacement
      ? 'New shift assigned today'
      : 'Check-in Pending';
    let badgeTone: DutyBadgeTone = 'neutral';
    let countdownLabel = formatCountdownLabel({
      shiftFrom,
      shiftTo,
      shiftActive,
    });

    const shiftCompleted = Boolean(today?.shiftCompleted);

    if (shiftActive) {
      const lateLogin =
        punchInStatus?.toLowerCase() === 'late' ||
        punchInStatus?.toLowerCase() === 'late login';
      statusBadge = lateLogin ? 'ON DUTY\nLATE LOGIN' : 'ON DUTY';
      statusText = lateLogin ? 'Late check-in' : 'Checked in on time';
      badgeTone = lateLogin ? 'warning' : 'success';
    } else if (shiftCompleted) {
      const lateLogin =
        punchInStatus?.toLowerCase() === 'late' ||
        punchInStatus?.toLowerCase() === 'late login';
      statusBadge = 'COMPLETED';
      statusText = lateLogin
        ? 'Shift completed (late check-in)'
        : 'Shift completed';
      badgeTone = 'success';
      countdownLabel = 'Shift ended';
    } else if (delayedWaiting) {
      statusBadge = 'DELAYED';
      statusText = 'Late for duty';
      badgeTone = 'danger';
      countdownLabel = formatDelayLabel(minutesLate);
    } else {
      const countdown = formatCountdownLabel({
        shiftFrom,
        shiftTo,
        shiftActive: false,
      });
      if (countdown === 'Shift ended') {
        statusBadge = 'MISSED';
        statusText = 'Did not check in';
        badgeTone = 'danger';
        countdownLabel = 'Shift ended';
      } else if (hasLaterReplacement && countdown !== 'Shift ended') {
        statusBadge = 'NEW SHIFT';
        statusText = 'Replacement duty assigned';
        badgeTone = 'warning';
      }
    }

    const rosterLabel = today?.shiftLabel?.trim();
    const shiftHeading = rosterLabel
      ? rosterLabel.toUpperCase()
      : todayShiftHeading(shiftFrom, shiftTo);

    return {
      siteName,
      postName,
      shiftFrom,
      shiftTo,
      timeRange: formatShiftTimeRange(shiftFrom, shiftTo),
      durationLabel: formatDurationLabel(shiftFrom, shiftTo),
      dutyType: dutyTypeLabel(shiftFrom, shiftTo),
      shiftLabel: shiftHeading,
      todayBadge: formatTodayBadge(),
      statusBadge,
      statusText,
      countdownLabel,
      badgeTone,
      shiftActive,
      isDelayed: delayedWaiting,
      punchedAt,
      punchInStatus,
      isNight: isNightDuty(shiftFrom, shiftTo),
      dutySource,
      hasLaterReplacement,
      assignmentId: today?.assignmentId ?? null,
      intervalCheckin: today?.intervalCheckin ?? null,
      isLoading,
      refresh: () => refresh({ silent: false }),
    };
  }, [guardUser, isLoading, navShiftActive, refresh, tick, today]);

  return (
    <GuardDutyAssignmentContext.Provider value={value}>
      {children}
    </GuardDutyAssignmentContext.Provider>
  );
}

export function useGuardDutyAssignment(): GuardDutyAssignmentView {
  const ctx = useContext(GuardDutyAssignmentContext);
  if (!ctx) {
    throw new Error(
      'useGuardDutyAssignment must be used within GuardDutyAssignmentProvider',
    );
  }
  return ctx;
}
