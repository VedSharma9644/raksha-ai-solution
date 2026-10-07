import { View } from 'react-native';

import type { AttendanceStatItem } from '../../constants/attendance-history-defaults';
import { attendanceStatsGridStyles as styles } from '../../styles/attendance-stats-grid.styles';
import { StatSummaryTile } from '../shared/StatSummaryTile';

type AttendanceStatsGridProps = {
  presentDays: number;
  totalHours: number;
  leaveDays: number;
  weeklyOffDays: number;
};

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function AttendanceStatsGrid({
  presentDays,
  totalHours,
  leaveDays,
  weeklyOffDays,
}: AttendanceStatsGridProps) {
  const stats: AttendanceStatItem[] = [
    {
      key: 'present',
      value: pad2(presentDays),
      label: 'Present Days',
      subtitle: 'Verified punch-ins',
      icon: 'check-circle',
    },
    {
      key: 'hours',
      value: String(totalHours),
      label: 'Est. Hours',
      subtitle: 'From shift length',
      icon: 'schedule',
    },
    {
      key: 'leave',
      value: pad2(leaveDays),
      label: 'Leave Taken',
      subtitle: 'Approved leave',
      icon: 'event-busy',
    },
    {
      key: 'off',
      value: pad2(weeklyOffDays),
      label: 'Weekly Off',
      subtitle: 'Roster rest days',
      icon: 'hotel',
    },
  ];

  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <StatSummaryTile
          key={stat.key}
          value={stat.value}
          label={stat.label}
          subtitle={stat.subtitle}
          icon={stat.icon}
        />
      ))}
    </View>
  );
}
