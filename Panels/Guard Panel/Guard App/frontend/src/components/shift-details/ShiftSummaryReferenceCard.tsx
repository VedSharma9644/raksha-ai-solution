import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardProfile } from '../../hooks/useGuardProfile';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import {
  dutyTypeLabel,
  formatShiftTimeRange,
  formatTodayBadge,
} from '../../utils/shift-display';
import { shiftSummaryReferenceCardStyles as styles } from '../../styles/shift-summary-reference-card.styles';

export function ShiftSummaryReferenceCard() {
  const duty = useGuardDutyAssignment();
  const { profile } = useGuardProfile();
  const { guardUser } = useGuardAppNavigation();

  const shiftFrom = profile?.shiftFrom || duty.shiftFrom || guardUser?.shiftFrom || '08:00';
  const shiftTo = profile?.shiftTo || duty.shiftTo || guardUser?.shiftTo || '20:00';
  const dutyTitle =
    profile?.shiftLabel?.trim() ||
    duty.shiftLabel ||
    dutyTypeLabel(shiftFrom, shiftTo);
  const reference =
    duty.assignmentId ||
    profile?.site.id ||
    guardUser?.assignedSiteId ||
    guardUser?.employeeCode ||
    '—';
  const statusLabel = duty.shiftActive
    ? 'Active On Duty'
    : duty.isDelayed
      ? 'Delayed'
      : 'Scheduled';
  const punchedLabel = duty.punchedAt
    ? new Date(duty.punchedAt).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : 'Not checked in';
  const statusBadge =
    duty.punchInStatus?.trim() ||
    (duty.shiftActive ? 'On Duty' : duty.statusBadge);

  return (
    <View style={styles.card}>
      <View style={styles.spine} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.referenceLabel}>Shift Reference</Text>
            <Text style={styles.referenceValue}>#{reference}</Text>
          </View>
          <View style={styles.statusBadge}>
            <MaterialIcons name="verified" size={18} color={appColors.onPrimaryFixed} />
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <Text style={styles.dutyTitle}>{dutyTitle}</Text>

        <View style={styles.metaRow}>
          <MaterialIcons name="calendar-today" size={20} color={appColors.primary} />
          <Text style={styles.metaText}>{formatTodayBadge()}</Text>
        </View>
        <View style={styles.metaRow}>
          <MaterialIcons name="schedule" size={20} color={appColors.primary} />
          <Text style={styles.metaTextStrong}>
            {formatShiftTimeRange(shiftFrom, shiftTo)}
          </Text>
        </View>

        <View style={styles.checkedInRow}>
          <View style={styles.checkedInLeft}>
            <MaterialIcons name="how-to-reg" size={22} color={appColors.primary} />
            <Text style={styles.checkedInLabel}>
              Checked-in:{' '}
              <Text style={styles.checkedInTime}>{punchedLabel}</Text>
            </Text>
          </View>
          <Text style={styles.earlyBadge}>{statusBadge}</Text>
        </View>
      </View>
    </View>
  );
}
