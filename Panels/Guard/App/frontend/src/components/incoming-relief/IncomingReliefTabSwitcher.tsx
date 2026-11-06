import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import {
  incomingReliefRequestsDefaults,
  type IncomingReliefTab,
} from '../../constants/incoming-relief-requests-defaults';
import { incomingReliefTabSwitcherStyles as styles } from '../../styles/incoming-relief-tab-switcher.styles';
import { appColors } from '../../theme';

type IncomingReliefTabSwitcherProps = {
  activeTab: IncomingReliefTab;
  onChange: (tab: IncomingReliefTab) => void;
  incomingCount?: number;
  sentCount?: number;
};

export function IncomingReliefTabSwitcher({
  activeTab,
  onChange,
  incomingCount = 0,
  sentCount = 0,
}: IncomingReliefTabSwitcherProps) {
  const incomingActive = activeTab === 'incoming';

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.tab, incomingActive && styles.tabActive]}
        onPress={() => onChange('incoming')}
      >
        <MaterialIcons
          name="inbox"
          size={20}
          color={incomingActive ? appColors.primary : appColors.secondary}
        />
        <Text style={[styles.tabLabel, incomingActive && styles.tabLabelActive]} numberOfLines={1}>
          {incomingReliefRequestsDefaults.incomingTabLabel}
        </Text>
        <View style={[styles.badge, styles.badgeIncoming]}>
          <Text style={styles.badgeTextIncoming}>{incomingCount}</Text>
        </View>
      </Pressable>

      <Pressable
        style={[styles.tab, !incomingActive && styles.tabActive]}
        onPress={() => onChange('sent')}
      >
        <MaterialIcons
          name="outbox"
          size={20}
          color={!incomingActive ? appColors.primary : appColors.secondary}
        />
        <Text style={[styles.tabLabel, !incomingActive && styles.tabLabelActive]} numberOfLines={1}>
          {incomingReliefRequestsDefaults.sentTabLabel}
        </Text>
        <View style={[styles.badge, styles.badgeSent]}>
          <Text style={styles.badgeTextSent}>{sentCount}</Text>
        </View>
      </Pressable>
    </View>
  );
}
