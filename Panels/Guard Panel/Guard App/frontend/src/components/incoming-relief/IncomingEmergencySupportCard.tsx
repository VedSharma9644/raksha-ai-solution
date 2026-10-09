import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import {
  formatPhoneDisplay,
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
import { incomingEmergencySupportCardStyles as styles } from '../../styles/incoming-emergency-support-card.styles';
import { appColors } from '../../theme';

export function IncomingEmergencySupportCard() {
  const { profile } = useGuardProfile();
  const hrName = profile?.site.hrName?.trim() || 'Site HR';
  const hrContact = profile?.site.hrContact?.trim() || '';
  const hrTel = toTelHref(hrContact);

  if (!hrTel) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="support-agent" size={20} color={appColors.onTertiaryFixed} />
        </View>
        <Text style={styles.title}>Need help?</Text>
      </View>

      <Text style={styles.message}>
        Call {hrName} if this relief request needs urgent clarification.
      </Text>

      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          onPress={() => Linking.openURL(`tel:${hrTel}`)}
        >
          <MaterialIcons name="call" size={18} color={appColors.primary} />
          <Text style={styles.supervisorLabel}>
            Call {hrName} · {formatPhoneDisplay(hrContact)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
