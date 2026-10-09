import { Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { shiftGpsLiveBannerStyles as styles } from '../../styles/shift-gps-live-banner.styles';

export function ShiftGpsLiveBanner() {
  const duty = useGuardDutyAssignment();

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <View style={styles.liveDot} />
        <Text style={styles.liveLabel}>
          {duty.siteName !== 'Assigned site' ? duty.siteName : 'Assigned Site'}
        </Text>
      </View>
      <Text style={styles.signalLabel}>
        {duty.shiftActive ? 'On Duty' : duty.statusBadge}
      </Text>
    </View>
  );
}
