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
    'Assigned Site';
  const sitePost =
    profile?.site.postName ||
    (duty.postName !== 'Assigned post' ? duty.postName : '') ||
    guardUser?.postName?.trim() ||
    'Assigned Post';
  const shiftFrom = profile?.shiftFrom || duty.shiftFrom || guardUser?.shiftFrom || '08:00';
  const shiftTo = profile?.shiftTo || duty.shiftTo || guardUser?.shiftTo || '20:00';
  const shiftTime = formatShiftTimeRange(shiftFrom, shiftTo);
  const shiftRoster = duty.isNight ? 'Night Roster' : 'Day Roster';

  const agencyName = profile?.agencyName?.trim() || 'Security Agency';
  const hrName = profile?.site.hrName?.trim() || '';
  const hrContact = profile?.site.hrContact?.trim() || '';
  const hrTel = toTelHref(hrContact);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="apartment" size={20} color={appColors.primary} />
          </View>
          <Text style={styles.title}>{guardProfileDefaults.employerTitle}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{guardProfileDefaults.activeDutyLabel}</Text>
        </View>
      </View>

      <View style={styles.stack}>
        <View style={styles.infoBlock}>
          <Text style={styles.fieldLabel}>{guardProfileDefaults.agencyLabel}</Text>
          <Text style={styles.fieldValue}>{agencyName}</Text>
          <Text style={styles.fieldMeta}>
            Agency ID:{' '}
            <Text style={styles.mono}>{guardUser?.agencyId?.trim() || '—'}</Text>
          </Text>
        </View>

        <View style={[styles.infoRow, styles.infoRowStart]}>
          <View style={styles.infoIcon}>
            <MaterialIcons name="location-on" size={22} color={appColors.primary} />
          </View>
          <View style={styles.infoCopy}>
            <Text style={styles.fieldLabel}>{guardProfileDefaults.siteLabel}</Text>
            <Text style={styles.fieldValueLg}>{siteName}</Text>
            <Text style={styles.fieldMeta14}>{sitePost}</Text>
          </View>
        </View>

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
          <View style={styles.rosterChip}>
            <Text style={styles.rosterChipText}>{shiftRoster}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconCircle}>
            <MaterialIcons
              name="badge"
              size={22}
              color={appColors.onSecondaryContainer}
            />
          </View>
          <View style={styles.infoCopy}>
            <Text style={styles.fieldLabel}>Site HR Contact</Text>
            <Text style={styles.fieldValueLg} numberOfLines={1}>
              {hrName || 'Not on file'}
            </Text>
            <Text style={styles.fieldMeta}>
              {hrContact ? formatPhoneDisplay(hrContact) : 'Add HR details on the site'}
            </Text>
          </View>
          {hrTel ? (
            <Pressable
              accessibilityLabel="Call Site HR"
              style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
              onPress={() => Linking.openURL(`tel:${hrTel}`)}
            >
              <MaterialIcons name="call" size={22} color={appColors.onPrimary} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}
