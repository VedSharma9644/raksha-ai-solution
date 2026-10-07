import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { shiftDetailsDefaults } from '../../constants/shift-details-defaults';
import { appColors } from '../../theme';
import { shiftSummaryReferenceCardStyles as styles } from '../../styles/shift-summary-reference-card.styles';

export function ShiftSummaryReferenceCard() {
  return (
    <View style={styles.card}>
      <View style={styles.spine} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.referenceLabel}>{shiftDetailsDefaults.shiftReferenceLabel}</Text>
            <Text style={styles.referenceValue}>{shiftDetailsDefaults.shiftReference}</Text>
          </View>
          <View style={styles.statusBadge}>
            <MaterialIcons name="verified" size={18} color={appColors.onPrimaryFixed} />
            <Text style={styles.statusText}>{shiftDetailsDefaults.activeStatusLabel}</Text>
          </View>
        </View>

        <Text style={styles.dutyTitle}>{shiftDetailsDefaults.dutyTitle}</Text>

        <View style={styles.metaRow}>
          <MaterialIcons name="calendar-today" size={20} color={appColors.primary} />
          <Text style={styles.metaText}>{shiftDetailsDefaults.dutyDate}</Text>
        </View>
        <View style={styles.metaRow}>
          <MaterialIcons name="schedule" size={20} color={appColors.primary} />
          <Text style={styles.metaTextStrong}>{shiftDetailsDefaults.dutyTimeRange}</Text>
        </View>

        <View style={styles.checkedInRow}>
          <View style={styles.checkedInLeft}>
            <MaterialIcons name="how-to-reg" size={22} color={appColors.primary} />
            <Text style={styles.checkedInLabel}>
              {shiftDetailsDefaults.checkedInLabel}{' '}
              <Text style={styles.checkedInTime}>{shiftDetailsDefaults.checkedInTime}</Text>
            </Text>
          </View>
          <Text style={styles.earlyBadge}>{shiftDetailsDefaults.earlyBadge}</Text>
        </View>
      </View>
    </View>
  );
}
