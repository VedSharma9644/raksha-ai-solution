import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Pressable,
  Text,
  View,
  type AppStateStatus,
} from 'react-native';

import {
  fetchAttendanceHistory,
  type AttendanceHistoryResponse,
} from '../../api/guard-api';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { AttendanceDisputeHelpCard } from './AttendanceDisputeHelpCard';
import { AttendanceHistoryLogSection } from './AttendanceHistoryLogSection';
import { AttendanceMonthCalendarOverview } from './AttendanceMonthCalendarOverview';
import { AttendanceMonthCycleSelector } from './AttendanceMonthCycleSelector';
import { AttendancePunctualityBanner } from './AttendancePunctualityBanner';
import { AttendanceStatsGrid } from './AttendanceStatsGrid';

export function AttendanceHistoryScreenContent() {
  const { authToken } = useGuardAppNavigation();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [history, setHistory] = useState<AttendanceHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!authToken) {
      setError('Please log in again to view attendance history.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAttendanceHistory(authToken, year, month);
      setHistory(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load attendance history.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [authToken, month, year]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const onState = (state: AppStateStatus) => {
      if (state === 'active') {
        void loadHistory();
      }
    };
    const sub = AppState.addEventListener('change', onState);
    return () => {
      sub.remove();
    };
  }, [loadHistory]);

  const shiftMonth = (delta: number) => {
    const cursor = new Date(year, month - 1 + delta, 1);
    setYear(cursor.getFullYear());
    setMonth(cursor.getMonth() + 1);
  };

  if (loading && !history) {
    return (
      <View style={{ paddingVertical: 48, alignItems: 'center', gap: 12 }}>
        <ActivityIndicator size="large" color={appColors.primary} />
        <Text style={{ color: appColors.secondary, fontFamily: 'PublicSans_500Medium' }}>
          Loading attendance…
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      <AttendanceMonthCycleSelector
        monthLabel={history?.monthLabel ?? `${month}/${year}`}
        cycleLabel={history?.cycleLabel ?? 'Current Cycle'}
        cycleNote={history?.cycleNote ?? ''}
        onPrev={() => shiftMonth(-1)}
        onNext={() => shiftMonth(1)}
      />

      {error ? (
        <View style={{ gap: 8 }}>
          <Text
            style={{
              color: appColors.error,
              fontFamily: 'PublicSans_600SemiBold',
              paddingHorizontal: 4,
            }}
          >
            {error}
          </Text>
          <Pressable onPress={() => void loadHistory()}>
            <Text
              style={{
                color: appColors.primary,
                fontFamily: 'PublicSans_700Bold',
                paddingHorizontal: 4,
              }}
            >
              Tap to retry
            </Text>
          </Pressable>
        </View>
      ) : null}

      <AttendanceStatsGrid
        presentDays={history?.stats.presentDays ?? 0}
        totalHours={history?.stats.totalHours ?? 0}
        missedDays={history?.stats.missedDays ?? 0}
        halfDays={history?.stats.halfDays ?? 0}
      />
      <AttendancePunctualityBanner
        title={history?.punctualityTitle ?? 'No records yet'}
        subtitle={
          history?.punctualitySubtitle ??
          'Roster, punches, handovers and missed shifts appear here.'
        }
      />
      <AttendanceMonthCalendarOverview
        calendarDays={history?.calendarDays ?? []}
        leadingEmpty={history?.leadingEmpty ?? 0}
      />
      <AttendanceHistoryLogSection
        logs={history?.logs ?? []}
        filterCounts={
          history?.filterCounts ?? {
            all: 0,
            present: 0,
            weeklyOff: 0,
            missed: 0,
            half: 0,
          }
        }
      />
      <AttendanceDisputeHelpCard />
    </View>
  );
}
