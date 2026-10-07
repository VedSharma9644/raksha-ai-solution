import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { attendanceMarkedDefaults } from '../../constants/attendance-marked-defaults';
import { appColors } from '../../theme';
import { attendanceRosterDispatchBannerStyles as styles } from '../../styles/attendance-roster-dispatch-banner.styles';

export function AttendanceRosterDispatchBanner() {
  return (
    <View style={styles.banner}>
      <MaterialIcons name="cell-tower" size={24} color={appColors.primary} />
      <View style={styles.copy}>
        <Text style={styles.title}>{attendanceMarkedDefaults.dispatchTitle}</Text>
        <Text style={styles.message}>{attendanceMarkedDefaults.dispatchMessage}</Text>
      </View>
    </View>
  );
}
