import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

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

  if (!hrTel && !esiNumber && !pfNumber) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerLeft}>
        <View style={[styles.iconWrap, styles.iconWrapError]}>
          <MaterialIcons name="medical-services" size={20} color={appColors.error} />
        </View>
        <Text style={styles.title}>Emergency contacts</Text>
      </View>

      <View style={styles.stack}>
        {hrTel ? (
          <View style={styles.infoRow}>
            <View style={styles.infoCopy}>
              <Text style={styles.fieldLabel}>Site HR</Text>
              <Text style={styles.fieldValueLg} numberOfLines={1}>
                {hrName || 'Site HR'}
              </Text>
              <Text style={styles.fieldMeta14}>{formatPhoneDisplay(hrContact)}</Text>
            </View>
            <Pressable
              accessibilityLabel="Call Site HR"
              style={({ pressed }) => [styles.emergencyCall, pressed && styles.pressed]}
              onPress={() => Linking.openURL(`tel:${hrTel}`)}
            >
              <MaterialIcons name="call" size={22} color={appColors.onErrorContainer} />
            </Pressable>
          </View>
        ) : null}

        {esiNumber ? (
          <View style={styles.infoBlock}>
            <Text style={styles.fieldLabel}>ESIC</Text>
            <Text style={styles.fieldValue}>{esiNumber}</Text>
          </View>
        ) : null}

        {pfNumber ? (
          <View style={styles.infoBlock}>
            <Text style={styles.fieldLabel}>PF</Text>
            <Text style={styles.fieldValue}>{pfNumber}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
