import { Text, View } from 'react-native';

import type { AttendanceHistoryDayStatus } from '../../api/guard-api';
import { attendanceHistoryDefaults } from '../../constants/attendance-history-defaults';
import { appColors } from '../../theme';
import { attendanceMonthCalendarOverviewStyles as styles } from '../../styles/attendance-month-calendar-overview.styles';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const LEGEND = [
  { key: 'present', label: 'Present', color: appColors.surfaceContainerHigh },
  { key: 'today', label: 'Today', color: appColors.primary },
  { key: 'off', label: 'Off', color: appColors.surfaceContainerLow },
  { key: 'leave', label: 'Leave', color: appColors.outlineVariant },
] as const;

type AttendanceMonthCalendarOverviewProps = {
  calendarDays: Array<{ day: number; status: AttendanceHistoryDayStatus }>;
  leadingEmpty: number;
};

function dayCircleStyle(status: string) {
  switch (status) {
    case 'today':
      return styles.dayToday;
    case 'off':
      return styles.dayOff;
    case 'leave':
      return styles.dayLeave;
    case 'empty':
      return styles.dayOff;
    default:
      return styles.dayPresent;
  }
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
              <Text style={[styles.dayText, item.status === 'today' && styles.dayTextToday]}>
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
