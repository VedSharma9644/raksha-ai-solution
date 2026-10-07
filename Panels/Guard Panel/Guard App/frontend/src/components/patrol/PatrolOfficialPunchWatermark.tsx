import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { patrolSessionDefaults } from '../../constants/patrol-session-defaults';
import { useLiveTimestamp } from '../../hooks/useLiveTimestamp';
import { appColors } from '../../theme';
import { patrolOfficialPunchWatermarkStyles as styles } from '../../styles/patrol-official-punch-watermark.styles';

type PatrolOfficialPunchWatermarkProps = {
  coordinatesLabel?: string;
  securityNotice?: string;
};

export function PatrolOfficialPunchWatermark({
  coordinatesLabel = patrolSessionDefaults.coordinatesLabel,
  securityNotice = patrolSessionDefaults.securityNotice,
}: PatrolOfficialPunchWatermarkProps) {
  const timestamp = useLiveTimestamp();

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.timeRow}>
            <MaterialIcons name="schedule" size={16} color={appColors.primaryFixed} />
            <Text style={styles.timestamp} numberOfLines={1}>
              {timestamp}
            </Text>
          </View>
          <View style={styles.punchBadge}>
            <Text style={styles.punchBadgeText}>{patrolSessionDefaults.officialPunchLabel}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MaterialIcons name="pin-drop" size={15} color={appColors.surfaceDim} />
          <Text style={styles.locationText}>{coordinatesLabel}</Text>
        </View>
      </View>

      <View style={styles.securityRow}>
        <MaterialIcons name="shield" size={14} color={appColors.secondaryFixed} />
        <Text style={styles.securityText}>{securityNotice}</Text>
      </View>
    </View>
  );
}
