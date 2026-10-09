import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { shiftReliefHandoverCardStyles as styles } from '../../styles/shift-relief-handover-card.styles';

export function ShiftReliefHandoverCard() {
  const { openRelieveAGuard } = useGuardAppNavigation();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={openRelieveAGuard}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name="swap-horiz" size={22} color={appColors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Need shift cover?</Text>
        <Text style={styles.subtitle}>Request relief from HR</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={appColors.secondary} />
    </Pressable>
  );
}
