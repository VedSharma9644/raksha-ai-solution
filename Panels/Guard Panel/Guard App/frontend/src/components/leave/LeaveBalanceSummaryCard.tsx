import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { LeaveBalanceSummaryDto } from '../../api/guard-api';
import { leaveTimeOffDefaults } from '../../constants/leave-time-off-defaults';
import { leaveBalanceSummaryCardStyles as styles } from '../../styles/leave-balance-summary-card.styles';
import { appColors } from '../../theme';

type LeaveBalanceSummaryCardProps = {
  balance?: LeaveBalanceSummaryDto | null;
};

export function LeaveBalanceSummaryCard({ balance }: LeaveBalanceSummaryCardProps) {
  if (!balance) {
    return null;
  }

  const year = balance.year ?? new Date().getFullYear();
  const daysLeft = balance.daysLeft ?? 0;
  const taken = balance.daysTaken ?? 0;
  const pending = balance.daysPending ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <View style={styles.headingLeft}>
          <MaterialIcons name="calendar-month" size={22} color={appColors.primary} />
          <Text style={styles.heading}>{`${year} Leave balance`}</Text>
        </View>
        {balance.updatedLabel ? (
          <Text style={styles.updated}>{balance.updatedLabel}</Text>
        ) : null}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statValue}>{String(daysLeft)}</Text>
          <Text style={styles.statLabel}>{leaveTimeOffDefaults.daysLeftLabel}</Text>
        </View>

        <View style={[styles.statCell, styles.statCellHighlighted]}>
          <Text style={[styles.statValue, styles.statValueMuted]}>{String(taken)}</Text>
          <Text style={styles.statLabel}>{leaveTimeOffDefaults.takenLabel}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={[styles.statValue, styles.statValuePending]}>{String(pending)}</Text>
          <Text style={[styles.statLabel, styles.statLabelPending]}>
            {leaveTimeOffDefaults.pendingLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
