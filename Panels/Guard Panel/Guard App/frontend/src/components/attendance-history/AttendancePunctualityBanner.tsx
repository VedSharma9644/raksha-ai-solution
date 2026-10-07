import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { attendanceHistoryDefaults } from '../../constants/attendance-history-defaults';
import { appColors } from '../../theme';
import { attendancePunctualityBannerStyles as styles } from '../../styles/attendance-punctuality-banner.styles';

export function AttendancePunctualityBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="military-tech" size={24} color={appColors.onPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{attendanceHistoryDefaults.punctualityTitle}</Text>
        <Text style={styles.subtitle}>{attendanceHistoryDefaults.punctualitySubtitle}</Text>
      </View>
    </View>
  );
}
