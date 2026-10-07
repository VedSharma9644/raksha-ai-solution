import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { relieveAGuardDefaults } from '../../constants/relieve-a-guard-defaults';
import { relieveGuidanceBannerStyles as styles } from '../../styles/relieve-guidance-banner.styles';
import { appColors } from '../../theme';

export function RelieveGuidanceBanner() {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="swap-horizontal-circle" size={28} color={appColors.onPrimary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{relieveAGuardDefaults.guidanceTitle}</Text>
          <Text style={styles.message}>{relieveAGuardDefaults.guidanceMessage}</Text>
          <View style={styles.policyChip}>
            <MaterialIcons name="schedule" size={18} color={appColors.primary} />
            <Text style={styles.policyText}>{relieveAGuardDefaults.policyChip}</Text>
          </View>
        </View>
      </View>

      <View style={styles.guardStrip}>
        <View style={styles.guardStripLeft}>
          <MaterialIcons name="badge" size={16} color={appColors.onSurfaceVariant} />
          <Text style={styles.guardStripText} numberOfLines={1}>
            {relieveAGuardDefaults.currentGuardName}
          </Text>
        </View>
        <Text style={styles.guardId}>{relieveAGuardDefaults.currentGuardId}</Text>
      </View>
    </View>
  );
}
