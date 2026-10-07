import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { applyForLeaveDefaults } from '../../constants/apply-for-leave-defaults';
import { appColors } from '../../theme';
import { leaveApplicationAssuranceBannerStyles as styles } from '../../styles/leave-application-assurance-banner.styles';

export function LeaveApplicationAssuranceBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.blob} />
      <View style={styles.iconWrap}>
        <MaterialIcons name="verified-user" size={28} color={appColors.onPrimary} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{applyForLeaveDefaults.bannerTitle}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{applyForLeaveDefaults.bannerBadge}</Text>
          </View>
        </View>
        <Text style={styles.message}>{applyForLeaveDefaults.bannerMessage}</Text>
      </View>
    </View>
  );
}
