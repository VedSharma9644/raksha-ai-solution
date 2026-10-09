import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    guardUser?.siteName ||
    'Assigned Site';
  const postName =
    profile?.site.postName ||
    (duty.postName !== 'Assigned post' ? duty.postName : '') ||
    guardUser?.postName ||
    'Assigned Post';
  const addressParts = [
    profile?.site.address?.trim(),
    profile?.site.city?.trim(),
  ].filter(Boolean);
  const siteAddress =
    addressParts.length > 0 ? addressParts.join(', ') : 'Address not on file for this site';
  const radius =
    profile?.site.geofenceRadiusMeters && profile.site.geofenceRadiusMeters > 0
      ? `Site geofence ${profile.site.geofenceRadiusMeters}m`
      : 'Site geofence configured';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="location-city" size={24} color={appColors.primary} />
          <Text style={styles.headerTitle}>Assigned Post</Text>
        </View>
        <View style={styles.perimeterBadge}>
          <MaterialIcons name="wifi-tethering" size={16} color={appColors.primary} />
          <Text style={styles.perimeterText}>Live Site</Text>
        </View>
      </View>

      <View style={styles.mapPreview}>
        <LinearGradient
          colors={['transparent', 'rgba(33, 49, 69, 0.2)', 'rgba(33, 49, 69, 0.8)']}
          style={styles.mapOverlay}
        />
        <View style={styles.mapFooter}>
          <View style={styles.radiusRow}>
            <MaterialIcons name="radar" size={18} color={appColors.primaryFixed} />
            <Text style={styles.radiusText}>{radius}</Text>
          </View>
          <Text style={styles.gpsTagged}>GPS Tagged</Text>
        </View>
      </View>

      <View>
        <Text style={styles.siteName}>{siteName}</Text>
        <Text style={styles.siteAddress}>{siteAddress}</Text>
        <View style={styles.checkpointBox}>
          <MaterialIcons
            name="door-front"
            size={20}
            color={appColors.primary}
            style={{ marginTop: 2 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.checkpointTitle}>{postName}</Text>
            <Text style={styles.checkpointSubtitle}>
              Your assigned duty post for this shift
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
