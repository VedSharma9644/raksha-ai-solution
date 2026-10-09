import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Text,
  View,
  type AppStateStatus,
} from 'react-native';

import {
  fetchGuardSchedule,
  type GuardScheduleShiftDto,
} from '../../api/guard-api';
import type { UpcomingShiftItem } from '../../constants/upcoming-schedule-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import {
  ROSTER_FOREGROUND_POLL_MS,
  subscribeRosterSync,
} from '../../sync/rosterSync';
import { appColors, appSpacing } from '../../theme';
import { scheduleUpcomingListHeaderStyles as headerStyles } from '../../styles/schedule-upcoming-list-header.styles';
import { ScheduleUpcomingShiftCard } from './ScheduleUpcomingShiftCard';

type WeekFilter = 'thisWeek' | 'nextWeek' | 'all';

type ScheduleUpcomingShiftsSectionProps = {
  weekFilter?: WeekFilter;
};

function toUpcomingItem(shift: GuardScheduleShiftDto): UpcomingShiftItem {
  if (shift.kind === 'rest') {
    return {
      id: shift.id,
      kind: 'rest',
      dayLabel: shift.dayLabel,
      todayBadge: shift.isToday,
      tomorrowBadge: shift.isTomorrow,
      restTitle: 'Weekly Off',
      restMessage: 'No duty scheduled for this day.',
      statusLabel: shift.statusLabel,
      dutyStatus: shift.dutyStatus ?? 'rest',
    };
  }

  return {
    id: shift.id,
    kind: shift.kind,
    dayLabel: shift.dayLabel,
    todayBadge: shift.isToday,
    tomorrowBadge: shift.isTomorrow,
    siteName: shift.siteName,
    postName: shift.postName,
    timeLabel: shift.timeLabel,
    statusLabel: shift.statusLabel,
    dutyStatus: shift.dutyStatus ?? (shift.isToday ? 'coming' : 'scheduled'),
    nightAllowanceLabel: shift.nightAllowanceLabel,
  };
}

function inWeekWindow(dutyDate: string, filter: WeekFilter, from: string): boolean {
  if (filter === 'all') {
    return true;
  }
  const start = new Date(`${from}T12:00:00`);
  const target = new Date(`${dutyDate}T12:00:00`);
  const dayMs = 24 * 60 * 60 * 1000;
  const offset = Math.round((target.getTime() - start.getTime()) / dayMs);
  if (filter === 'thisWeek') {
    return offset >= 0 && offset < 7;
  }
  return offset >= 7 && offset < 14;
}

export function ScheduleUpcomingShiftsSection({
  weekFilter = 'thisWeek',
}: ScheduleUpcomingShiftsSectionProps) {
  const { authToken } = useGuardAppNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState('');
  const [rows, setRows] = useState<GuardScheduleShiftDto[]>([]);

  const load = useCallback(async () => {
    if (!authToken) {
      setError('Please log in again to view your schedule.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGuardSchedule(authToken, 14);
      setFrom(data.from);
      setRows([...data.shifts, ...data.restDays].sort((a, b) =>
        a.dutyDate.localeCompare(b.dutyDate),
      ));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return subscribeRosterSync(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    const onState = (state: AppStateStatus) => {
      if (state === 'active') {
        void load();
      }
    };
    const sub = AppState.addEventListener('change', onState);
    const interval = setInterval(() => {
      void load();
    }, ROSTER_FOREGROUND_POLL_MS);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [load]);

  const items = useMemo(() => {
    const filtered = rows.filter((row) =>
      inWeekWindow(row.dutyDate, weekFilter, from || row.dutyDate),
    );
    // Schedule tab: show duty days first; include rest days so roster is clear
    return filtered.map(toUpcomingItem);
  }, [from, rows, weekFilter]);

  return (
    <View style={{ gap: appSpacing.sm }}>
      <View style={headerStyles.row}>
        <View style={headerStyles.left}>
          <MaterialIcons name="calendar-month" size={22} color={appColors.primary} />
          <Text style={headerStyles.title}>Upcoming Shifts</Text>
        </View>
        <Text style={headerStyles.subtitle}>From roster</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={appColors.primary} style={{ marginVertical: 16 }} />
      ) : null}

      {error ? (
        <Text
          style={{
            color: appColors.error,
            fontFamily: 'PublicSans_600SemiBold',
            paddingHorizontal: 4,
          }}
        >
          {error}
        </Text>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <Text
          style={{
            color: appColors.secondary,
            fontFamily: 'PublicSans_500Medium',
            paddingHorizontal: 4,
          }}
        >
          No scheduled shifts in this window.
        </Text>
      ) : null}

      {items.map((shift) => (
        <ScheduleUpcomingShiftCard key={shift.id} shift={shift} />
      ))}
    </View>
  );
}
