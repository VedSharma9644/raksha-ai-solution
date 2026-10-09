import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { shiftCheckoutActionsStyles as styles } from '../../styles/shift-checkout-actions.styles';

export function ShiftCheckoutActions() {
  const { openPatrolSession } = useGuardAppNavigation();
  const duty = useGuardDutyAssignment();
  const ending = duty.shiftActive;

  return (
    <View style={styles.section}>
      <Pressable
        style={({ pressed }) => [styles.checkoutButton, pressed && styles.checkoutButtonPressed]}
        onPress={() => openPatrolSession(ending ? 'punch_out' : 'punch_in')}
      >
        <MaterialIcons
          name={ending ? 'logout' : 'login'}
          size={24}
          color={appColors.onPrimary}
        />
        <Text style={styles.checkoutLabel} numberOfLines={1}>
          {ending ? 'End shift' : 'Punch in'}
        </Text>
      </Pressable>
      <Text style={styles.sosHintText}>
        Opens camera for a live selfie at your site
      </Text>
    </View>
  );
}
