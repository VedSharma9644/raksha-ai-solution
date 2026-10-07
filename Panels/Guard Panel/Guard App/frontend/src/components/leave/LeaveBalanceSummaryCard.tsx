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
  const year = balance?.year ?? new Date().getFullYear();
  const daysLeft = balance?.daysLeft ?? leaveTimeOffDefaults.daysLeftValue;
  const taken = balance?.daysTaken ?? leaveTimeOffDefaults.takenValue;
  const pending = balance?.daysPending ?? leaveTimeOffDefaults.pendingValue;
  const updated = balance?.updatedLabel ?? leaveTimeOffDefaults.balanceUpdated;
  const payroll = balance?.payrollNote ?? leaveTimeOffDefaults.payrollNote;

  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <View style={styles.headingLeft}>
          <MaterialIcons name="calendar-month" size={22} color={appColors.primary} />
          <Text style={styles.heading}>{`${year} Guard Leave Balance`}</Text>
        </View>
        <Text style={styles.updated}>{updated}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statValue}>{String(daysLeft)}</Text>
          <Text style={styles.statLabel}>{leaveTimeOffDefaults.daysLeftLabel}</Text>
          <Text style={styles.statSub}>{leaveTimeOffDefaults.daysLeftSub}</Text>
        </View>

        <View style={[styles.statCell, styles.statCellHighlighted]}>
          <Text style={[styles.statValue, styles.statValueMuted]}>{String(taken)}</Text>
          <Text style={styles.statLabel}>{leaveTimeOffDefaults.takenLabel}</Text>
          <Text style={styles.statSub}>{leaveTimeOffDefaults.takenSub}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={[styles.statValue, styles.statValuePending]}>{String(pending)}</Text>
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
        <Text style={styles.payrollText}>{payroll}</Text>
      </View>
    </View>
  );
}
