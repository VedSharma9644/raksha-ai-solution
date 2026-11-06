import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { appColors } from '../../theme';
import { attendancePunctualityBannerStyles as styles } from '../../styles/attendance-punctuality-banner.styles';

type AttendancePunctualityBannerProps = {
  title: string;
  subtitle: string;
};

export function AttendancePunctualityBanner({
  title,
  subtitle,
}: AttendancePunctualityBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="military-tech" size={24} color={appColors.onPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}
