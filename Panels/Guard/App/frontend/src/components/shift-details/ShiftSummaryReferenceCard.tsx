import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useGuardDutyAssignment } from '../../hooks/useGuardDutyAssignment';
import { useGuardProfile } from '../../hooks/useGuardProfile';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import {
  dutyTypeLabel,
  formatDurationLabel,
  formatShiftTimeRange,
  formatTodayBadge,
} from '../../utils/shift-display';
import { shiftSummaryReferenceCardStyles as styles } from '../../styles/shift-summary-reference-card.styles';

function cleanDutyTitle(
  profileLabel: string | undefined,
  dutyLabel: string | undefined,
  shiftFrom: string,
  shiftTo: string,
): string {
  const profile = profileLabel?.trim() ?? '';
  if (profile && !/^today'?s?\s+shift/i.test(profile)) {
    return profile;
  }
  const fromDuty = (dutyLabel ?? '')
    .replace(/^today'?s?\s+shift\s*[•·-]?\s*/i, '')
    .trim();
  if (fromDuty && fromDuty.length <= 32) {
    return fromDuty;
  }
  return dutyTypeLabel(shiftFrom, shiftTo);
}

export function ShiftSummaryReferenceCard() {
  const duty = useGuardDutyAssignment();
  const { profile } = useGuardProfile();
  const { guardUser } = useGuardAppNavigation();

  const shiftFrom = profile?.shiftFrom || duty.shiftFrom || guardUser?.shiftFrom || '08:00';
  const shiftTo = profile?.shiftTo || duty.shiftTo || guardUser?.shiftTo || '20:00';
  const dutyTitle = cleanDutyTitle(
    profile?.shiftLabel,
    duty.shiftLabel,
    shiftFrom,
    shiftTo,
  );
  const duration = formatDurationLabel(shiftFrom, shiftTo);
  const punchedLabel = duty.punchedAt
    ? new Date(duty.punchedAt).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  let statusLabel = 'Scheduled';
  if (duty.shiftActive) {
    const late =
      duty.punchInStatus?.toLowerCase().includes('late') === true;
    statusLabel = late ? 'Late Login' : 'On Duty';
  } else if (duty.isDelayed) {
    statusLabel = 'Delayed';
  } else if (duty.statusBadge === 'MISSED') {
    statusLabel = 'Missed';
  }

  return (
    <View style={styles.card}>
      <View style={styles.spine} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.todayLabel}>{formatTodayBadge()}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <Text style={styles.dutyTitle} numberOfLines={2}>
          {dutyTitle}
        </Text>

        <View style={styles.metaRow}>
          <MaterialIcons name="schedule" size={20} color={appColors.primary} />
          <Text style={styles.metaTextStrong}>
            {formatShiftTimeRange(shiftFrom, shiftTo)}
            {duration ? `  ${duration}` : ''}
          </Text>
        </View>

        <View style={styles.checkedInRow}>
          <MaterialIcons
            name={punchedLabel ? 'how-to-reg' : 'pending-actions'}
            size={22}
            color={appColors.primary}
          />
          <Text style={styles.checkedInLabel}>
            {punchedLabel ? (
              <>
                Checked in at{' '}
                <Text style={styles.checkedInTime}>{punchedLabel}</Text>
              </>
            ) : (
              'Not checked in yet'
            )}
          </Text>
        </View>
      </View>
    </View>
  );
}
