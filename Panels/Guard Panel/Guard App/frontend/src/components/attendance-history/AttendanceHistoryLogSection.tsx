import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import type { AttendanceHistoryLogDto } from '../../api/guard-api';
import type { AttendanceFilterKey } from '../../constants/attendance-history-defaults';
import { appColors } from '../../theme';
import { attendanceHistoryLogSectionStyles as styles } from '../../styles/attendance-history-log-section.styles';
import { AttendanceDailyLogCard } from './AttendanceDailyLogCard';
import { AttendanceLogFilterTabs } from './AttendanceLogFilterTabs';

type AttendanceHistoryLogSectionProps = {
  logs: AttendanceHistoryLogDto[];
  filterCounts: { all: number; present: number; weeklyOff: number };
};

export function AttendanceHistoryLogSection({
  logs,
  filterCounts,
}: AttendanceHistoryLogSectionProps) {
  const [activeFilter, setActiveFilter] = useState<AttendanceFilterKey>('all');

  const filteredLogs = useMemo(() => {
    if (activeFilter === 'present') {
      return logs.filter((item) => item.kind === 'present' || item.kind === 'onDuty');
    }
    if (activeFilter === 'weeklyOff') {
      return logs.filter((item) => item.kind === 'weeklyOff');
    }
    return logs;
  }, [activeFilter, logs]);

  const tabs = [
    { key: 'all' as const, label: `All Days (${filterCounts.all})` },
    { key: 'present' as const, label: `Present (${filterCounts.present})` },
    { key: 'weeklyOff' as const, label: 'Weekly Off' },
  ];

  return (
    <View style={styles.section}>
      <AttendanceLogFilterTabs
        tabs={tabs}
        activeFilter={activeFilter}
        onChange={setActiveFilter}
      />
      {filteredLogs.length === 0 ? (
        <Text
          style={{
            color: appColors.secondary,
            fontFamily: 'PublicSans_500Medium',
            paddingVertical: 12,
            paddingHorizontal: 4,
          }}
        >
          No attendance logs for this filter in the selected month.
        </Text>
      ) : (
        filteredLogs.map((item) => <AttendanceDailyLogCard key={item.id} item={item} />)
      )}
    </View>
  );
}
