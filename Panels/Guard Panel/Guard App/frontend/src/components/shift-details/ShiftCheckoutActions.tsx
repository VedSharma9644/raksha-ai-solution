import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { shiftCheckoutActionsStyles as styles } from '../../styles/shift-checkout-actions.styles';

export function ShiftCheckoutActions() {
  const { openPatrolSession } = useGuardAppNavigation();
  const duty = useGuardDutyAssignment();

  return (
    <View style={styles.section}>
      <Pressable
        style={({ pressed }) => [styles.checkoutButton, pressed && styles.checkoutButtonPressed]}
        onPress={() => openPatrolSession(duty.shiftActive ? 'punch_out' : 'punch_in')}
      >
        <MaterialIcons name="logout" size={28} color={appColors.onPrimary} />
        <Text style={styles.checkoutLabel}>
          {duty.shiftActive
            ? 'Mark Check-Out / Shift End'
            : 'Mark Attendance / Punch In'}
        </Text>
      </Pressable>

      <View style={styles.sosHintRow}>
        <MaterialIcons name="camera-alt" size={18} color={appColors.tertiary} />
        <Text style={styles.sosHintText}>
          Opens the live selfie camera at your assigned site geofence
        </Text>
      </View>
    </View>
  );
}
