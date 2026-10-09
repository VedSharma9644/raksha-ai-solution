import { Text, View } from 'react-native';

import type { AttendanceHistoryDayStatus } from '../../api/guard-api';
import { attendanceHistoryDefaults } from '../../constants/attendance-history-defaults';
import { appColors } from '../../theme';
import { attendanceMonthCalendarOverviewStyles as styles } from '../../styles/attendance-month-calendar-overview.styles';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const LEGEND = [
  { key: 'full', label: 'Full', color: appColors.surfaceContainerHigh },
  { key: 'half', label: 'Half', color: '#e8b86d' },
  { key: 'missed', label: 'Missed', color: appColors.errorContainer },
  { key: 'upcoming', label: 'Upcoming', color: appColors.primaryFixed },
  { key: 'today', label: 'Today', color: appColors.primary },
] as const;

type AttendanceMonthCalendarOverviewProps = {
  calendarDays: Array<{ day: number; status: AttendanceHistoryDayStatus }>;
  leadingEmpty: number;
};

function dayCircleStyle(status: string) {
  switch (status) {
    case 'today':
      return styles.dayToday;
    case 'half':
      return styles.dayHalf;
    case 'missed':
      return styles.dayMissed;
    case 'upcoming':
      return styles.dayUpcoming;
    case 'off':
      return styles.dayOff;
    case 'leave':
      return styles.dayLeave;
    case 'empty':
      return styles.dayOff;
    case 'full':
    case 'present':
    default:
      return styles.dayPresent;
  }
}

function dayTextStyle(status: string) {
  if (status === 'today') {
    return styles.dayTextToday;
  }
  if (status === 'missed') {
    return styles.dayTextMissed;
  }
  return null;
}

export function AttendanceMonthCalendarOverview({
  calendarDays,
  leadingEmpty,
}: AttendanceMonthCalendarOverviewProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{attendanceHistoryDefaults.calendarTitle}</Text>

      <View style={styles.weekRow}>
        {WEEK_LABELS.map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {Array.from({ length: leadingEmpty }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.dayCell} />
        ))}
        {calendarDays.map((item) => (
          <View key={item.day} style={styles.dayCell}>
            <View style={[styles.dayCircle, dayCircleStyle(item.status)]}>
              <Text style={[styles.dayText, dayTextStyle(item.status)]}>
                {item.day}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.legendRow}>
        {LEGEND.map((item) => (
          <View key={item.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
