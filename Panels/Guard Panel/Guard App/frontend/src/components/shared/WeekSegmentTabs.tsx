import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { appColors } from '../../theme';
import { sharedWeekSegmentTabsStyles as styles } from '../../styles/shared-week-segment-tabs.styles';

export type WeekSegmentKey = 'thisWeek' | 'nextWeek';

type WeekSegmentOption = {
  key: WeekSegmentKey;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconFilled?: boolean;
};

const WEEK_OPTIONS: WeekSegmentOption[] = [
  { key: 'thisWeek', label: 'This Week', icon: 'date-range', iconFilled: true },
  { key: 'nextWeek', label: 'Next Week', icon: 'next-plan' },
];

type WeekSegmentTabsProps = {
  activeKey: WeekSegmentKey;
  onChange: (key: WeekSegmentKey) => void;
};

export function WeekSegmentTabs({ activeKey, onChange }: WeekSegmentTabsProps) {
  return (
    <View style={styles.group}>
      {WEEK_OPTIONS.map((option) => {
        const active = option.key === activeKey;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <MaterialIcons
              name={option.icon}
              size={20}
              color={active ? appColors.primary : appColors.secondary}
            />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
