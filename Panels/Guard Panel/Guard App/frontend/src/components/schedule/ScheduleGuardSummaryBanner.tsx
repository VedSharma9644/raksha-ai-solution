import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { upcomingScheduleDefaults } from '../../constants/upcoming-schedule-defaults';
import { appColors } from '../../theme';
import { scheduleGuardSummaryBannerStyles as styles } from '../../styles/schedule-guard-summary-banner.styles';

export function ScheduleGuardSummaryBanner() {
  return (
    <View style={styles.section}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <View style={styles.initials}>
            <Text style={styles.initialsText}>{upcomingScheduleDefaults.guardInitials}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{upcomingScheduleDefaults.guardName}</Text>
              <View style={styles.idBadge}>
                <Text style={styles.idText}>ID: {upcomingScheduleDefaults.guardId}</Text>
              </View>
            </View>
            <Text style={styles.prompt}>{upcomingScheduleDefaults.summaryPrompt}</Text>
          </View>
        </View>
        <View style={styles.badgeIconWrap}>
          <MaterialIcons name="badge" size={20} color={appColors.onSurfaceVariant} />
        </View>
      </View>

      <View style={styles.statPill}>
        <MaterialIcons name="event-available" size={18} color={appColors.primary} />
        <Text style={styles.statBold}>{upcomingScheduleDefaults.shiftsAssignedLabel}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.statMuted}>{upcomingScheduleDefaults.daysOffLabel}</Text>
      </View>
    </View>
  );
}
