import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { scheduleShiftReliefRequestStyles as styles } from '../../styles/schedule-shift-relief-request.styles';

export function ScheduleShiftReliefRequestCard() {
  const { openRelieveAGuard } = useGuardAppNavigation();

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="swap-horiz" size={22} color={appColors.onPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Need to swap a shift?</Text>
          <Text style={styles.message}>
            Request replacement relief or apply for emergency leave at least 12 hours in advance.
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={openRelieveAGuard}
      >
        <MaterialIcons name="published-with-changes" size={22} color={appColors.onPrimary} />
        <Text style={styles.buttonText}>Request Shift Relief</Text>
      </Pressable>
    </View>
  );
}
