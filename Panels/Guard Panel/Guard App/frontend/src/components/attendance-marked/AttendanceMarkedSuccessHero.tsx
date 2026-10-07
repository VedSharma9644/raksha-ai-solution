import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { attendanceMarkedDefaults } from '../../constants/attendance-marked-defaults';
import { appColors } from '../../theme';
import { attendanceMarkedSuccessHeroStyles as styles } from '../../styles/attendance-marked-success-hero.styles';

export function AttendanceMarkedSuccessHero() {
  return (
    <View style={styles.section}>
      <View style={styles.iconCluster}>
        <View style={styles.pingRing} />
        <View style={styles.verifiedCircle}>
          <MaterialIcons name="verified" size={42} color={appColors.onPrimary} />
        </View>
      </View>

      <View style={styles.shiftBadge}>
        <MaterialIcons name="check-circle" size={16} color={appColors.onPrimaryFixed} />
        <Text style={styles.shiftBadgeText}>{attendanceMarkedDefaults.shiftCommencedLabel}</Text>
      </View>

      <Text style={styles.title}>{attendanceMarkedDefaults.successTitle}</Text>
      <Text style={styles.subtitle}>{attendanceMarkedDefaults.successSubtitle}</Text>
    </View>
  );
}
