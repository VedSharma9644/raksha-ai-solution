import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import { guardProfileDefaults } from '../../constants/guard-profile-defaults';
import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import {
  formatPhoneDisplay,
  toTelHref,
  useGuardProfile,
} from '../../hooks/useGuardProfile';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { guardProfileSectionCardStyles as styles } from '../../styles/guard-profile-section-card.styles';
import { appColors } from '../../theme';
import { formatShiftTimeRange } from '../../utils/shift-display';

export function GuardProfileEmployerCard() {
  const { guardUser } = useGuardAppNavigation();
  const duty = useGuardDutyAssignment();
  const { profile } = useGuardProfile();

  const siteName =
    profile?.site.siteName ||
    (duty.siteName !== 'Assigned site' ? duty.siteName : '') ||
    guardUser?.siteName?.trim() ||
    '';
  const sitePost =
    profile?.site.postName ||
    (duty.postName !== 'Assigned post' ? duty.postName : '') ||
    guardUser?.postName?.trim() ||
    '';
  const shiftFrom = profile?.shiftFrom || duty.shiftFrom || guardUser?.shiftFrom || '';
  const shiftTo = profile?.shiftTo || duty.shiftTo || guardUser?.shiftTo || '';
  const shiftTime =
    shiftFrom && shiftTo ? formatShiftTimeRange(shiftFrom, shiftTo) : '';

  const agencyName = profile?.agencyName?.trim() || '';
  const hrName = profile?.site.hrName?.trim() || '';
  const hrContact = profile?.site.hrContact?.trim() || '';
  const hrTel = toTelHref(hrContact);

  if (!agencyName && !siteName && !shiftTime && !hrTel) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="apartment" size={20} color={appColors.primary} />
          </View>
          <Text style={styles.title}>{guardProfileDefaults.employerTitle}</Text>
        </View>
      </View>

      <View style={styles.stack}>
        {agencyName ? (
          <View style={styles.infoBlock}>
            <Text style={styles.fieldLabel}>{guardProfileDefaults.agencyLabel}</Text>
            <Text style={styles.fieldValue}>{agencyName}</Text>
          </View>
        ) : null}

        {siteName ? (
          <View style={[styles.infoRow, styles.infoRowStart]}>
            <View style={styles.infoIcon}>
              <MaterialIcons name="location-on" size={22} color={appColors.primary} />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.fieldLabel}>{guardProfileDefaults.siteLabel}</Text>
              <Text style={styles.fieldValueLg}>{siteName}</Text>
              {sitePost ? (
                <Text style={styles.fieldMeta14}>{sitePost}</Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {shiftTime ? (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialIcons name="schedule" size={22} color={appColors.primary} />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.fieldLabel}>{guardProfileDefaults.shiftLabel}</Text>
              <Text style={styles.fieldValueLg} numberOfLines={1}>
                {shiftTime}
              </Text>
            </View>
          </View>
        ) : null}

        {hrTel ? (
          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <MaterialIcons
                name="badge"
                size={22}
                color={appColors.onSecondaryContainer}
              />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.fieldLabel}>Site HR</Text>
              <Text style={styles.fieldValueLg} numberOfLines={1}>
                {hrName || 'Site HR'}
              </Text>
              <Text style={styles.fieldMeta}>{formatPhoneDisplay(hrContact)}</Text>
            </View>
            <Pressable
              accessibilityLabel="Call Site HR"
              style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
              onPress={() => Linking.openURL(`tel:${hrTel}`)}
            >
              <MaterialIcons name="call" size={22} color={appColors.onPrimary} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}
