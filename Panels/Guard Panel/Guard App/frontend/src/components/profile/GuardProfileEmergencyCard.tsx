import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import { guardProfileDefaults } from '../../constants/guard-profile-defaults';
import {
  formatPhoneDisplay,
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
import { guardProfileSectionCardStyles as styles } from '../../styles/guard-profile-section-card.styles';
import { appColors } from '../../theme';

export function GuardProfileEmergencyCard() {
  const { profile } = useGuardProfile();
  const hrName = profile?.site.hrName?.trim() || '';
  const hrContact = profile?.site.hrContact?.trim() || '';
  const hrTel = toTelHref(hrContact);
  const esiNumber = profile?.esiNumber?.trim() || '';
  const pfNumber = profile?.pfNumber?.trim() || '';

  return (
    <View style={styles.card}>
      <View style={styles.headerLeft}>
        <View style={[styles.iconWrap, styles.iconWrapError]}>
          <MaterialIcons name="medical-services" size={20} color={appColors.error} />
        </View>
        <Text style={styles.title}>Emergency & ESIC</Text>
      </View>

      <View style={styles.stack}>
        <View style={styles.infoRow}>
          <View style={styles.infoCopy}>
            <Text style={styles.fieldLabel}>Emergency Contact (Site HR)</Text>
            <Text style={styles.fieldValueLg} numberOfLines={1}>
              {hrName || 'Not on file'}
            </Text>
            <Text style={styles.fieldMeta14}>
              {hrContact ? formatPhoneDisplay(hrContact) : 'Add HR contact on the site'}
            </Text>
          </View>
          {hrTel ? (
            <Pressable
              accessibilityLabel="Call Site HR"
              style={({ pressed }) => [styles.emergencyCall, pressed && styles.pressed]}
              onPress={() => Linking.openURL(`tel:${hrTel}`)}
            >
              <MaterialIcons name="emergency" size={22} color={appColors.onErrorContainer} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCopy}>
            <Text style={styles.fieldLabel}>{guardProfileDefaults.esicLabel}</Text>
            <Text style={styles.fieldValue}>{esiNumber || 'Not on file'}</Text>
            <Text style={styles.fieldMeta}>
              {pfNumber ? `PF: ${pfNumber}` : 'From your guard employment record'}
            </Text>
          </View>
          <MaterialIcons name="health-and-safety" size={28} color={appColors.primary} />
        </View>
      </View>
    </View>
  );
}
