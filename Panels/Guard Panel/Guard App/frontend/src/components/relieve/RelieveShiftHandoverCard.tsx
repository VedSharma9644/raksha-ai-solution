import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Pressable, Text, View } from 'react-native';

import { relieveAGuardDefaults } from '../../constants/relieve-a-guard-defaults';
import { relieveShiftHandoverCardStyles as styles } from '../../styles/relieve-shift-handover-card.styles';
import { appColors } from '../../theme';

export function RelieveShiftHandoverCard() {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>1</Text>
          </View>
          <Text style={styles.stepTitle}>{relieveAGuardDefaults.step1Title}</Text>
        </View>
        <Pressable
          style={styles.changeButton}
          onPress={() => Alert.alert('Change shift', 'Shift picker will open here soon.')}
        >
          <Text style={styles.changeLabel}>{relieveAGuardDefaults.changeShiftLabel}</Text>
          <MaterialIcons name="calendar-month" size={18} color={appColors.primary} />
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.statusSpine} />

        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>{relieveAGuardDefaults.shiftStatusBadge}</Text>
          </View>
          <Text style={styles.whenLabel}>{relieveAGuardDefaults.shiftWhenLabel}</Text>
        </View>

        <Text style={styles.date}>{relieveAGuardDefaults.shiftDate}</Text>

        <View style={styles.timeRow}>
          <MaterialIcons name="wb-sunny" size={22} color={appColors.primary} />
          <Text style={styles.timeText}>{relieveAGuardDefaults.shiftTime}</Text>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{relieveAGuardDefaults.shiftDurationBadge}</Text>
          </View>
        </View>

        <View style={styles.siteBlock}>
          <MaterialIcons name="location-on" size={24} color={appColors.primaryContainer} />
          <View style={styles.siteCopy}>
            <Text style={styles.siteName} numberOfLines={1}>
              {relieveAGuardDefaults.siteName}
            </Text>
            <Text style={styles.postLabel}>{relieveAGuardDefaults.postLabel}</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.eligibleRow}>
            <MaterialIcons name="verified-user" size={18} color={appColors.primary} />
            <Text style={styles.eligibleText}>{relieveAGuardDefaults.reliefEligibleLabel}</Text>
          </View>
          <Text style={styles.supervisorText}>{relieveAGuardDefaults.supervisorLabel}</Text>
        </View>
      </View>
    </View>
  );
}
