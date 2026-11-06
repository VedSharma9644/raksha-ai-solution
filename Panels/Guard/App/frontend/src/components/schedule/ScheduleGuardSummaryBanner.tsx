import { Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { scheduleGuardSummaryBannerStyles as styles } from '../../styles/schedule-guard-summary-banner.styles';
import { GuardUserAvatar } from '../shared/GuardUserAvatar';

export function ScheduleGuardSummaryBanner() {
  const { guardUser } = useGuardAppNavigation();
  const duty = useGuardDutyAssignment();
  const fullName = guardUser?.fullName?.trim() || 'Guard';
  const employeeCode = guardUser?.employeeCode?.trim();

  return (
    <View style={styles.section}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <GuardUserAvatar fullName={fullName} size={40} style={styles.initials} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {fullName}
              </Text>
              {employeeCode ? (
                <View style={styles.idBadge}>
                  <Text style={styles.idText}>ID: {employeeCode}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.prompt} numberOfLines={1}>
              {duty.siteName !== 'Assigned site' ? duty.siteName : 'Your roster'}
              {duty.timeRange ? ` · ${duty.timeRange}` : ''}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
