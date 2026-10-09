import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { fetchTodayShift, type TodayShiftStatus } from '../api/guard-api';
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
  isLoading: boolean;
  refresh: () => Promise<void>;
};

export function useGuardDutyAssignment(): GuardDutyAssignmentView {
  const { authToken, guardUser, shiftActive: navShiftActive } = useGuardAppNavigation();
  const [today, setToday] = useState<TodayShiftStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(async () => {
    if (!authToken) {
      setToday(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchTodayShift(authToken);
      setToday(data);
    } catch {
      // Keep last known assignment on transient errors
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    return subscribeRosterSync(() => {
      void refresh();
    });
  }, [refresh]);

  useEffect(() => {
    const onState = (state: AppStateStatus) => {
      if (state === 'active') {
        void refresh();
      }
    };
    const sub = AppState.addEventListener('change', onState);
    const interval = setInterval(() => {
      void refresh();
      setTick((value) => value + 1);
    }, ROSTER_FOREGROUND_POLL_MS);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [refresh]);

  return useMemo(() => {
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
    const delayedWaiting = !shiftActive && isWithinShiftAfterStart({ shiftFrom, shiftTo });
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

    if (shiftActive) {
      const lateLogin =
        punchInStatus?.toLowerCase() === 'late' ||
        punchInStatus?.toLowerCase() === 'late login';
      statusBadge = lateLogin ? 'LATE LOGIN' : 'ON DUTY';
      statusText = lateLogin ? 'Late check-in' : 'Checked in on time';
      badgeTone = lateLogin ? 'warning' : 'success';
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
      isLoading,
      refresh,
    };
  }, [guardUser, isLoading, navShiftActive, refresh, tick, today]);
}
