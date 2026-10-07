import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  leaveRequestFilterTabs,
  type LeaveRequestFilter,
} from '../../constants/leave-time-off-defaults';
import { leaveRequestFilterTabsStyles as styles } from '../../styles/leave-request-filter-tabs.styles';

type LeaveRequestFilterTabsProps = {
  activeFilter: LeaveRequestFilter;
  onChange: (filter: LeaveRequestFilter) => void;
  counts?: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

function badgeStyle(tone: (typeof leaveRequestFilterTabs)[number]['badgeTone'], active: boolean) {
  switch (tone) {
    case 'pending':
      return styles.badgePending;
    case 'approved':
      return styles.badgeApproved;
    case 'rejected':
      return styles.badgeRejected;
    default:
      return active ? styles.badgeNeutralActive : styles.badgeNeutral;
  }
}

export function LeaveRequestFilterTabs({
  activeFilter,
  onChange,
  counts,
}: LeaveRequestFilterTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {leaveRequestFilterTabs.map((tab) => {
        const active = tab.key === activeFilter;
        const isNeutral = tab.badgeTone === 'neutral';
        const count = counts ? counts[tab.key] : tab.count;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            <View style={[styles.badge, badgeStyle(tab.badgeTone, active)]}>
              <Text style={[styles.badgeText, isNeutral && styles.badgeTextNeutral]}>{count}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
