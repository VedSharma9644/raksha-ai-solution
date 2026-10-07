import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, Text, View } from 'react-native';

import { shiftDetailsDefaults } from '../../constants/shift-details-defaults';
import { appColors } from '../../theme';
import { shiftAssignedPostCardStyles as styles } from '../../styles/shift-assigned-post-card.styles';

export function ShiftAssignedPostCard() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="location-city" size={24} color={appColors.primary} />
          <Text style={styles.headerTitle}>{shiftDetailsDefaults.assignedPostTitle}</Text>
        </View>
        <View style={styles.perimeterBadge}>
          <MaterialIcons name="wifi-tethering" size={16} color={appColors.primary} />
          <Text style={styles.perimeterText}>{shiftDetailsDefaults.perimeterSafeLabel}</Text>
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
            <Text style={styles.radiusText}>{shiftDetailsDefaults.radiusLabel}</Text>
          </View>
          <Text style={styles.gpsTagged}>{shiftDetailsDefaults.gpsTaggedLabel}</Text>
        </View>
      </View>

      <View>
        <Text style={styles.siteName}>{shiftDetailsDefaults.siteName}</Text>
        <Text style={styles.siteAddress}>{shiftDetailsDefaults.siteAddress}</Text>
        <View style={styles.checkpointBox}>
          <MaterialIcons name="door-front" size={20} color={appColors.primary} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.checkpointTitle}>{shiftDetailsDefaults.checkpointTitle}</Text>
            <Text style={styles.checkpointSubtitle}>{shiftDetailsDefaults.checkpointSubtitle}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.secondaryAction, pressed && styles.secondaryActionPressed]}
          onPress={() => Alert.alert('Site Directions', 'Directions will open here soon.')}
        >
          <MaterialIcons name="map" size={22} color={appColors.primary} />
          <Text style={styles.secondaryActionText}>{shiftDetailsDefaults.siteDirectionsLabel}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryAction, pressed && styles.secondaryActionPressed]}
          onPress={() => Alert.alert('Gate Intercom', 'Gate intercom call will start here soon.')}
        >
          <MaterialIcons name="call" size={22} color={appColors.primary} />
          <Text style={styles.secondaryActionText}>{shiftDetailsDefaults.gateIntercomLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
