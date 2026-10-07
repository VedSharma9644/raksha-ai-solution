import { Pressable, Text, View } from 'react-native';

import type { AttendanceFilterKey } from '../../constants/attendance-history-defaults';
import { attendanceLogFilterTabsStyles as styles } from '../../styles/attendance-log-filter-tabs.styles';

type AttendanceLogFilterTabsProps = {
  tabs: { key: AttendanceFilterKey; label: string }[];
  activeFilter: AttendanceFilterKey;
  onChange: (key: AttendanceFilterKey) => void;
};

export function AttendanceLogFilterTabs({
  tabs,
  activeFilter,
  onChange,
}: AttendanceLogFilterTabsProps) {
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const active = tab.key === activeFilter;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
