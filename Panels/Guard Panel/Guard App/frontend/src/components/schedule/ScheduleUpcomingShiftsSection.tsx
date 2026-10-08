import { MaterialIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import type { UpcomingShiftItem } from '../../constants/upcoming-schedule-defaults';
import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { appColors, appSpacing } from '../../theme';
import { formatShiftTimeRange, isNightDuty } from '../../utils/shift-display';
import { scheduleUpcomingListHeaderStyles as headerStyles } from '../../styles/schedule-upcoming-list-header.styles';
import { ScheduleUpcomingShiftCard } from './ScheduleUpcomingShiftCard';

/**
 * Upcoming days use the guard's current site/shift assignment.
 * Full multi-post roster calendars will come from Admin/HR when that lands —
 * until then we show the repeating assigned duty for the next week.
 */
function buildUpcomingFromAssignment(params: {
  siteName: string;
  postName: string;
  shiftFrom: string;
  shiftTo: string;
}): UpcomingShiftItem[] {
  const items: UpcomingShiftItem[] = [];
  const now = new Date();
  const night = isNightDuty(params.shiftFrom, params.shiftTo);
  const timeLabel = `${formatShiftTimeRange(params.shiftFrom, params.shiftTo)} (${
    night ? 'Night' : 'Day'
  })`;

  for (let offset = 1; offset <= 7; offset += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + offset);
    const dayLabel = day.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    items.push({
      id: `assigned-${day.toISOString().slice(0, 10)}`,
      kind: night ? 'night' : 'confirmed',
      dayLabel,
      tomorrowBadge: offset === 1,
      siteName: params.siteName,
      postName: params.postName,
      timeLabel,
      statusLabel: night ? 'Night Duty' : 'Assigned',
      nightAllowanceLabel: night ? 'Night Shift Allowance Applicable' : undefined,
    });
  }

  return items;
}

export function ScheduleUpcomingShiftsSection() {
  const duty = useGuardDutyAssignment();
  const items = useMemo(
    () =>
      buildUpcomingFromAssignment({
        siteName: duty.siteName,
        postName: duty.postName,
        shiftFrom: duty.shiftFrom,
        shiftTo: duty.shiftTo,
      }),
    [duty.postName, duty.shiftFrom, duty.shiftTo, duty.siteName],
  );

  return (
    <View style={{ gap: appSpacing.sm }}>
      <View style={headerStyles.row}>
        <View style={headerStyles.left}>
          <MaterialIcons name="calendar-month" size={22} color={appColors.primary} />
          <Text style={headerStyles.title}>Upcoming Shifts</Text>
        </View>
        <Text style={headerStyles.subtitle}>From assignment</Text>
      </View>

      {items.map((shift) => (
        <ScheduleUpcomingShiftCard key={shift.id} shift={shift} />
      ))}
    </View>
  );
}
