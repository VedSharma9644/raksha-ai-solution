import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { attendanceMarkedDefaults } from '../../constants/attendance-marked-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { attendanceGeofenceComplianceRowStyles as styles } from '../../styles/attendance-geofence-compliance-row.styles';

export function AttendanceGeofenceComplianceRow() {
  const { lastPunchResult } = useGuardAppNavigation();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="location-on" size={20} color={appColors.onPrimary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{attendanceMarkedDefaults.geofenceTitle}</Text>
          <Text style={styles.detail} numberOfLines={1}>
            {lastPunchResult?.geofenceDetail ?? attendanceMarkedDefaults.geofenceDetail}
          </Text>
        </View>
      </View>
      <Text style={styles.result}>
        {lastPunchResult?.geofenceResult ?? attendanceMarkedDefaults.geofenceResult}
      </Text>
    </View>
  );
}
