import { Text, View } from 'react-native';

import { shiftDetailsDefaults } from '../../constants/shift-details-defaults';
import { shiftGpsLiveBannerStyles as styles } from '../../styles/shift-gps-live-banner.styles';

export function ShiftGpsLiveBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <View style={styles.liveDot} />
        <Text style={styles.liveLabel}>{shiftDetailsDefaults.gpsLiveLabel}</Text>
      </View>
      <Text style={styles.signalLabel}>{shiftDetailsDefaults.signalLabel}</Text>
    </View>
  );
}
