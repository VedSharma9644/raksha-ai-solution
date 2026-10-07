import { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  attendanceLogItems,
  type AttendanceFilterKey,
} from '../../constants/attendance-history-defaults';
import { attendanceHistoryLogSectionStyles as styles } from '../../styles/attendance-history-log-section.styles';
import { AttendanceDailyLogCard } from './AttendanceDailyLogCard';
import { AttendanceLogFilterTabs } from './AttendanceLogFilterTabs';

export function AttendanceHistoryLogSection() {
  const [activeFilter, setActiveFilter] = useState<AttendanceFilterKey>('all');

  const filteredLogs = useMemo(() => {
    if (activeFilter === 'present') {
      return attendanceLogItems.filter(
        (item) => item.kind === 'present' || item.kind === 'onDuty',
      );
    }
    if (activeFilter === 'weeklyOff') {
      return attendanceLogItems.filter((item) => item.kind === 'weeklyOff');
    }
    return attendanceLogItems;
  }, [activeFilter]);

  return (
    <View style={styles.section}>
      <AttendanceLogFilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />
      {filteredLogs.map((item) => (
        <AttendanceDailyLogCard key={item.id} item={item} />
      ))}
    </View>
  );
}
