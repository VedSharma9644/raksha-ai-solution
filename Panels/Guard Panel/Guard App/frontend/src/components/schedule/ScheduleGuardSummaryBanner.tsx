import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { scheduleGuardSummaryBannerStyles as styles } from '../../styles/schedule-guard-summary-banner.styles';
import { GuardUserAvatar } from '../shared/GuardUserAvatar';

export function ScheduleGuardSummaryBanner() {
  const { guardUser } = useGuardAppNavigation();
  const duty = useGuardDutyAssignment();
  const fullName = guardUser?.fullName?.trim() || 'Guard';
  const employeeCode = guardUser?.employeeCode?.trim() || '—';

  return (
    <View style={styles.section}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <GuardUserAvatar fullName={fullName} size={40} style={styles.initials} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{fullName}</Text>
              <View style={styles.idBadge}>
                <Text style={styles.idText}>ID: {employeeCode}</Text>
              </View>
            </View>
            <Text style={styles.prompt}>
              {duty.siteName} • {duty.timeRange}
            </Text>
          </View>
        </View>
        <View style={styles.badgeIconWrap}>
          <MaterialIcons name="badge" size={20} color={appColors.onSurfaceVariant} />
        </View>
      </View>

      <View style={styles.statPill}>
        <MaterialIcons name="event-available" size={18} color={appColors.primary} />
        <Text style={styles.statBold}>Assigned: {duty.postName}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.statMuted}>{duty.dutyType}</Text>
      </View>
    </View>
  );
}
