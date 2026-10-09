import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import {
  formatPhoneDisplay,
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
import { appColors } from '../../theme';
import { shiftFieldCommandCardStyles as styles } from '../../styles/shift-field-command-card.styles';

export function ShiftFieldCommandCard() {
  const { profile } = useGuardProfile();
  const hrName = profile?.site.hrName?.trim() || 'Site HR';
  const hrContact = profile?.site.hrContact?.trim() || '';
  const hrTel = toTelHref(hrContact);

  if (!hrTel) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.label}>Need help?</Text>
          <Text style={styles.name} numberOfLines={1}>
            {hrName}
          </Text>
          <Text style={styles.phone}>{formatPhoneDisplay(hrContact)}</Text>
        </View>
        <Pressable
          accessibilityLabel={`Call ${hrName}`}
          style={({ pressed }) => [styles.callButton, pressed && styles.callPressed]}
          onPress={() => Linking.openURL(`tel:${hrTel}`)}
        >
          <MaterialIcons name="call" size={22} color={appColors.onPrimary} />
          <Text style={styles.callLabel}>Call</Text>
        </Pressable>
      </View>
    </View>
  );
}
