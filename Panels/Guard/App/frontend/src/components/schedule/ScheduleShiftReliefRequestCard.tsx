import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { scheduleShiftReliefRequestStyles as styles } from '../../styles/schedule-shift-relief-request.styles';

export function ScheduleShiftReliefRequestCard() {
  const { openRelieveAGuard } = useGuardAppNavigation();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={openRelieveAGuard}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name="swap-horiz" size={22} color={appColors.onPrimary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Need shift cover?</Text>
        <Text style={styles.message}>Request relief from HR</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={appColors.secondary} />
    </Pressable>
  );
}
