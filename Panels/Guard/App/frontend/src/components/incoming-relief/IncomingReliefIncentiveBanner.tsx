import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { incomingReliefRequestsDefaults } from '../../constants/incoming-relief-requests-defaults';
import { incomingReliefIncentiveBannerStyles as styles } from '../../styles/incoming-relief-incentive-banner.styles';
import { appColors } from '../../theme';

export function IncomingReliefIncentiveBanner() {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="payments" size={24} color={appColors.onPrimary} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{incomingReliefRequestsDefaults.incentiveTitle}</Text>
          <View style={styles.rateBadge}>
            <Text style={styles.rateText}>{incomingReliefRequestsDefaults.incentiveRate}</Text>
          </View>
        </View>
        <Text style={styles.message}>{incomingReliefRequestsDefaults.incentiveMessage}</Text>
      </View>
    </View>
  );
}
