import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Pressable, Text, View } from 'react-native';

import { shiftDetailsDefaults } from '../../constants/shift-details-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { shiftCheckoutActionsStyles as styles } from '../../styles/shift-checkout-actions.styles';

export function ShiftCheckoutActions() {
  const { goBack } = useGuardAppNavigation();

  const endShift = () => {
    Alert.alert('Complete Shift Handover', 'Complete shift handover and log out for Day Duty?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Shift',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Shift Ended', 'Handover report saved successfully.', [
            { text: 'OK', onPress: goBack },
          ]);
        },
      },
    ]);
  };

  return (
    <View style={styles.section}>
      <Pressable
        style={({ pressed }) => [styles.checkoutButton, pressed && styles.checkoutButtonPressed]}
        onPress={endShift}
      >
        <MaterialIcons name="logout" size={28} color={appColors.onPrimary} />
        <Text style={styles.checkoutLabel}>{shiftDetailsDefaults.checkoutLabel}</Text>
      </Pressable>

      <View style={styles.sosHintRow}>
        <MaterialIcons name="emergency-share" size={18} color={appColors.tertiary} />
        <Text style={styles.sosHintText}>{shiftDetailsDefaults.sosHint}</Text>
      </View>
    </View>
  );
}
