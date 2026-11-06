import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardProfile } from '../../hooks/useGuardProfile';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { shiftAssignedPostCardStyles as styles } from '../../styles/shift-assigned-post-card.styles';

export function ShiftAssignedPostCard() {
  const duty = useGuardDutyAssignment();
  const { profile } = useGuardProfile();
  const { guardUser } = useGuardAppNavigation();

  const siteName =
    profile?.site.siteName ||
    (duty.siteName !== 'Assigned site' ? duty.siteName : '') ||
    guardUser?.siteName?.trim() ||
    'Assigned Site';
  const postName =
    profile?.site.postName ||
    (duty.postName !== 'Assigned post' ? duty.postName : '') ||
    guardUser?.postName?.trim() ||
    '';
  const addressParts = [
    profile?.site.address?.trim(),
    profile?.site.city?.trim(),
  ].filter(Boolean);
  const siteAddress = addressParts.join(', ');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialIcons name="location-on" size={22} color={appColors.primary} />
        <Text style={styles.headerTitle}>Where to report</Text>
      </View>

      <Text style={styles.siteName} numberOfLines={2}>
        {siteName}
      </Text>
      {siteAddress ? (
        <Text style={styles.siteAddress} numberOfLines={3}>
          {siteAddress}
        </Text>
      ) : null}
      {postName ? (
        <View style={styles.checkpointBox}>
          <MaterialIcons name="badge" size={18} color={appColors.primary} />
          <Text style={styles.checkpointTitle} numberOfLines={2}>
            {postName}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
