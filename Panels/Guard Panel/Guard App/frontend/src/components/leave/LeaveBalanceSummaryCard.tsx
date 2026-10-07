import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { leaveTimeOffDefaults } from '../../constants/leave-time-off-defaults';
import { leaveBalanceSummaryCardStyles as styles } from '../../styles/leave-balance-summary-card.styles';
import { appColors } from '../../theme';

export function LeaveBalanceSummaryCard() {
  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <View style={styles.headingLeft}>
          <MaterialIcons name="calendar-month" size={22} color={appColors.primary} />
          <Text style={styles.heading}>{leaveTimeOffDefaults.balanceTitle}</Text>
        </View>
        <Text style={styles.updated}>{leaveTimeOffDefaults.balanceUpdated}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statValue}>{leaveTimeOffDefaults.daysLeftValue}</Text>
          <Text style={styles.statLabel}>{leaveTimeOffDefaults.daysLeftLabel}</Text>
          <Text style={styles.statSub}>{leaveTimeOffDefaults.daysLeftSub}</Text>
        </View>

        <View style={[styles.statCell, styles.statCellHighlighted]}>
          <Text style={[styles.statValue, styles.statValueMuted]}>
            {leaveTimeOffDefaults.takenValue}
          </Text>
          <Text style={styles.statLabel}>{leaveTimeOffDefaults.takenLabel}</Text>
          <Text style={styles.statSub}>{leaveTimeOffDefaults.takenSub}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={[styles.statValue, styles.statValuePending]}>
            {leaveTimeOffDefaults.pendingValue}
          </Text>
          <Text style={[styles.statLabel, styles.statLabelPending]}>
            {leaveTimeOffDefaults.pendingLabel}
          </Text>
          <Text style={styles.statSub}>{leaveTimeOffDefaults.pendingSub}</Text>
        </View>
      </View>

      <View style={styles.payrollBanner}>
        <MaterialIcons
          name="verified-user"
          size={20}
          color={appColors.primary}
          style={styles.payrollIcon}
        />
        <Text style={styles.payrollText}>{leaveTimeOffDefaults.payrollNote}</Text>
      </View>
    </View>
  );
}
