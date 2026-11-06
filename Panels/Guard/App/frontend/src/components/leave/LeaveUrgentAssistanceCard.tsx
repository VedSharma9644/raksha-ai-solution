import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import {
  formatPhoneDisplay,
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
import { leaveUrgentAssistanceCardStyles as styles } from '../../styles/leave-urgent-assistance-card.styles';
import { appColors } from '../../theme';

export function LeaveUrgentAssistanceCard() {
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
        <MaterialIcons name="contact-support" size={22} color={appColors.primary} />
        <Text style={styles.title}>Urgent leave?</Text>
      </View>

      <Text style={styles.message}>
        For same-day emergencies, call {hrName} instead of waiting on an online request.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.callButton, pressed && styles.callButtonPressed]}
        onPress={() => Linking.openURL(`tel:${hrTel}`)}
      >
        <MaterialIcons name="phone-in-talk" size={22} color={appColors.primary} />
        <Text style={styles.callLabel}>
          Call {hrName} · {formatPhoneDisplay(hrContact)}
        </Text>
      </Pressable>
    </View>
  );
}
