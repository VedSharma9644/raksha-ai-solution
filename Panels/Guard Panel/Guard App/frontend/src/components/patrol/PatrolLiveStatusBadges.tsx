import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { patrolSessionDefaults } from '../../constants/patrol-session-defaults';
import { appColors } from '../../theme';
import { patrolLiveStatusBadgesStyles as styles } from '../../styles/patrol-live-status-badges.styles';

type PatrolLiveStatusBadgesProps = {
  faceDetectedLabel?: string;
  geofenceLabel?: string;
};

export function PatrolLiveStatusBadges({
  faceDetectedLabel = patrolSessionDefaults.faceDetectedLabel,
  geofenceLabel = patrolSessionDefaults.geofenceLabel,
}: PatrolLiveStatusBadgesProps) {
  return (
    <View style={styles.row}>
      <View style={styles.faceDetected}>
        <View style={styles.faceDot} />
        <Text style={styles.faceLabel}>{faceDetectedLabel}</Text>
      </View>

      <View style={styles.geofence}>
        <MaterialIcons name="location-on" size={16} color={appColors.primary} />
        <Text style={styles.geofenceLabel}>{geofenceLabel}</Text>
      </View>
    </View>
  );
}
