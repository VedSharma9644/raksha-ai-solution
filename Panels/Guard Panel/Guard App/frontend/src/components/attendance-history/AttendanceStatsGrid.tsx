import { View } from 'react-native';

import { attendanceStatItems } from '../../constants/attendance-history-defaults';
import { attendanceStatsGridStyles as styles } from '../../styles/attendance-stats-grid.styles';
import { StatSummaryTile } from '../shared/StatSummaryTile';

export function AttendanceStatsGrid() {
  return (
    <View style={styles.grid}>
      {attendanceStatItems.map((stat) => (
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
