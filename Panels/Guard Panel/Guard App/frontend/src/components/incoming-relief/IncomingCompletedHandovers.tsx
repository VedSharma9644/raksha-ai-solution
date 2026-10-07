import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import {
  completedHandover,
  incomingReliefRequestsDefaults,
} from '../../constants/incoming-relief-requests-defaults';
import { incomingCompletedHandoversStyles as styles } from '../../styles/incoming-completed-handovers.styles';
import { appColors } from '../../theme';

export function IncomingCompletedHandovers() {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{incomingReliefRequestsDefaults.historyTitle}</Text>
        <Text style={styles.month}>{incomingReliefRequestsDefaults.historyMonth}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.approvalRow}>
          <View style={styles.approvalBadge}>
            <MaterialIcons name="verified" size={16} color={appColors.onPrimaryFixed} />
            <Text style={styles.approvalText}>{completedHandover.approvalLabel}</Text>
          </View>
          <Text style={styles.date}>{completedHandover.dateLabel}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailCopy}>
            <Text style={styles.coverTitle} numberOfLines={1}>
              {completedHandover.title}
            </Text>
            <Text style={styles.siteMeta} numberOfLines={1}>
              {completedHandover.siteMeta}
            </Text>
          </View>
          <View style={styles.payBlock}>
            <Text style={styles.payAmount}>{completedHandover.payAmount}</Text>
            <Text style={styles.paySub}>{completedHandover.paySub}</Text>
          </View>
        </View>

        <View style={styles.timesheetRow}>
          <MaterialIcons name="history-toggle-off" size={16} color={appColors.primary} />
          <Text style={styles.timesheetText}>{completedHandover.timesheetNote}</Text>
        </View>
      </View>
    </View>
  );
}
