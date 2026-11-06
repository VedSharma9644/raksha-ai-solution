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
  filterCounts: {
    all: number;
    present: number;
    weeklyOff: number;
    missed?: number;
    half?: number;
  };
};

export function AttendanceHistoryLogSection({
  logs,
  filterCounts,
}: AttendanceHistoryLogSectionProps) {
  const [activeFilter, setActiveFilter] = useState<AttendanceFilterKey>('all');

  const filteredLogs = useMemo(() => {
    if (activeFilter === 'present') {
      return logs.filter((item) =>
        ['present', 'full', 'half', 'onDuty'].includes(item.kind),
      );
    }
    if (activeFilter === 'missed') {
      return logs.filter((item) => item.kind === 'missed');
    }
    if (activeFilter === 'half') {
      return logs.filter((item) => item.kind === 'half');
    }
    if (activeFilter === 'weeklyOff') {
      return logs.filter(
        (item) => item.kind === 'weeklyOff' || item.kind === 'leave',
      );
    }
    return logs;
  }, [activeFilter, logs]);

  const tabs = [
    { key: 'all' as const, label: `All (${filterCounts.all})` },
    { key: 'present' as const, label: `Present (${filterCounts.present})` },
    {
      key: 'missed' as const,
      label: `Missed (${filterCounts.missed ?? 0})`,
    },
    { key: 'half' as const, label: `Half (${filterCounts.half ?? 0})` },
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
        filteredLogs.map((item) => (
          <AttendanceDailyLogCard key={item.id} item={item} />
        ))
      )}
    </View>
  );
}
