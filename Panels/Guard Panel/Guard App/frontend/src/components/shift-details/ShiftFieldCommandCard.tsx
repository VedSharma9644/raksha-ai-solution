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
  const agencyPhone = profile?.agencyPhone?.trim() || '';
  const hrTel = toTelHref(hrContact);
  const agencyTel = toTelHref(agencyPhone);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="security" size={24} color={appColors.primary} />
          <Text style={styles.headerTitle}>Field Command</Text>
        </View>
        <Text style={styles.status}>Site HR</Text>
      </View>

      <View style={styles.profileRow}>
        <View
          style={[
            styles.photo,
            {
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: appColors.secondaryContainer,
            },
          ]}
        >
          <MaterialIcons name="badge" size={36} color={appColors.primary} />
        </View>
        <View>
          <Text style={styles.name}>{hrName}</Text>
          <Text style={styles.role}>Site HR Contact</Text>
          <Text style={styles.phone}>
            {hrContact ? formatPhoneDisplay(hrContact) : 'Phone not on file'}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {hrTel ? (
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={() => Linking.openURL(`tel:${hrTel}`)}
          >
            <MaterialIcons name="call" size={24} color={appColors.onPrimary} />
            <Text style={styles.primaryButtonText}>Call Site HR</Text>
          </Pressable>
        ) : null}

        {agencyTel ? (
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
            onPress={() => Linking.openURL(`tel:${agencyTel}`)}
          >
            <MaterialIcons name="support-agent" size={24} color={appColors.tertiary} />
            <Text style={styles.secondaryButtonText}>
              {profile?.agencyName?.trim() || 'Agency Desk'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
