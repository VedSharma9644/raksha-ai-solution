import { View } from 'react-native';

import type { AttendanceStatItem } from '../../constants/attendance-history-defaults';
import { attendanceStatsGridStyles as styles } from '../../styles/attendance-stats-grid.styles';
import { StatSummaryTile } from '../shared/StatSummaryTile';

type AttendanceStatsGridProps = {
  presentDays: number;
  totalHours: number;
  missedDays: number;
  halfDays: number;
};

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function AttendanceStatsGrid({
  presentDays,
  totalHours,
  missedDays,
  halfDays,
}: AttendanceStatsGridProps) {
  const stats: AttendanceStatItem[] = [
    {
      key: 'present',
      value: pad2(presentDays),
      label: 'Present',
      subtitle: 'Full + half + on duty',
      icon: 'check-circle',
    },
    {
      key: 'hours',
      value: String(totalHours),
      label: 'Hours',
      subtitle: 'From punch duration',
      icon: 'schedule',
    },
    {
      key: 'half',
      value: pad2(halfDays),
      label: 'Half shifts',
      subtitle: 'Handover / incomplete',
      icon: 'event-busy',
    },
    {
      key: 'missed',
      value: pad2(missedDays),
      label: 'Missed',
      subtitle: 'No punch-in',
      icon: 'cancel',
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
