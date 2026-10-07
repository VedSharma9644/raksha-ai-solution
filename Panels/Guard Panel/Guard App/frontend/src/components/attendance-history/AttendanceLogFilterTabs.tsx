import { Pressable, Text, View } from 'react-native';

import {
  attendanceFilterTabs,
  type AttendanceFilterKey,
} from '../../constants/attendance-history-defaults';
import { attendanceLogFilterTabsStyles as styles } from '../../styles/attendance-log-filter-tabs.styles';

type AttendanceLogFilterTabsProps = {
  activeFilter: AttendanceFilterKey;
  onChange: (key: AttendanceFilterKey) => void;
};

export function AttendanceLogFilterTabs({ activeFilter, onChange }: AttendanceLogFilterTabsProps) {
  return (
    <View style={styles.row}>
      {attendanceFilterTabs.map((tab) => {
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
