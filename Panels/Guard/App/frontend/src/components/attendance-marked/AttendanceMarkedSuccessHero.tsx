import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { attendanceMarkedDefaults } from '../../constants/attendance-marked-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { attendanceMarkedSuccessHeroStyles as styles } from '../../styles/attendance-marked-success-hero.styles';

export function AttendanceMarkedSuccessHero() {
  const { lastPunchResult } = useGuardAppNavigation();
  const isPunchOut =
    lastPunchResult?.mode === 'punch_out' || lastPunchResult?.shiftStatus === 'ended';

  return (
    <View style={styles.section}>
      <View style={styles.iconCluster}>
        <View style={styles.pingRing} />
        <View style={styles.verifiedCircle}>
          <MaterialIcons
            name={isPunchOut ? 'logout' : 'verified'}
            size={42}
            color={appColors.onPrimary}
          />
        </View>
      </View>

      <View style={styles.shiftBadge}>
        <MaterialIcons
          name={isPunchOut ? 'task-alt' : 'check-circle'}
          size={16}
          color={appColors.onPrimaryFixed}
        />
        <Text style={styles.shiftBadgeText}>
          {isPunchOut ? 'SHIFT ENDED SUCCESSFULLY' : attendanceMarkedDefaults.shiftCommencedLabel}
        </Text>
      </View>

      <Text style={styles.title}>
        {isPunchOut ? 'Shift Complete' : attendanceMarkedDefaults.successTitle}
      </Text>
      <Text style={styles.subtitle}>
        {isPunchOut
          ? 'Your end-of-shift selfie was verified at the site. Duty hours have been logged.'
          : attendanceMarkedDefaults.successSubtitle}
      </Text>
    </View>
  );
}
