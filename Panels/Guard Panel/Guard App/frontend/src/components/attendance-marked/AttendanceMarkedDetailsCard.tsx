import { View } from 'react-native';

import { attendanceMarkedDefaults } from '../../constants/attendance-marked-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { attendanceMarkedDetailsCardStyles as styles } from '../../styles/attendance-marked-details-card.styles';
import { DetailInfoRow } from '../shared/DetailInfoRow';
import { AttendanceGeofenceComplianceRow } from './AttendanceGeofenceComplianceRow';
import { AttendanceGuardProfileSummary } from './AttendanceGuardProfileSummary';

export function AttendanceMarkedDetailsCard() {
  const { lastPunchResult } = useGuardAppNavigation();
  const isPunchOut =
    lastPunchResult?.mode === 'punch_out' || lastPunchResult?.shiftStatus === 'ended';

  return (
    <View style={styles.card}>
      <AttendanceGuardProfileSummary />

      <View style={styles.rows}>
        {isPunchOut ? (
          <>
            <DetailInfoRow
              icon="login"
              label="Punch-in Time"
              title={lastPunchResult?.punchInTime ?? attendanceMarkedDefaults.punchInTime}
              titleVariant="headline"
              statusBadge="Started"
              subtitle={lastPunchResult?.punchInDate ?? attendanceMarkedDefaults.punchInDate}
            />
            <DetailInfoRow
              icon="logout"
              label="Punch-out Time"
              title={
                lastPunchResult?.punchOutTime ??
                lastPunchResult?.punchInTime ??
                attendanceMarkedDefaults.punchInTime
              }
              titleVariant="headline"
              statusBadge={lastPunchResult?.punchInStatus ?? 'Shift Ended'}
              subtitle={lastPunchResult?.durationLabel ?? lastPunchResult?.rosterHours}
            />
          </>
        ) : (
          <DetailInfoRow
            icon="schedule"
            label={attendanceMarkedDefaults.punchInLabel}
            title={lastPunchResult?.punchInTime ?? attendanceMarkedDefaults.punchInTime}
            titleVariant="headline"
            statusBadge={lastPunchResult?.punchInStatus ?? attendanceMarkedDefaults.punchInStatus}
            subtitle={lastPunchResult?.punchInDate ?? attendanceMarkedDefaults.punchInDate}
          />
        )}

        <DetailInfoRow
          icon="domain"
          label={attendanceMarkedDefaults.dutySiteLabel}
          title={lastPunchResult?.dutySiteName ?? attendanceMarkedDefaults.dutySiteName}
          subtitle={lastPunchResult?.dutyPostName ?? attendanceMarkedDefaults.dutyPostName}
        />

        <DetailInfoRow
          icon="badge"
          label={isPunchOut ? 'Shift Duration' : attendanceMarkedDefaults.rosterLabel}
          title={lastPunchResult?.rosterTitle ?? attendanceMarkedDefaults.rosterTitle}
          subtitle={lastPunchResult?.rosterHours ?? attendanceMarkedDefaults.rosterHours}
        />

        <AttendanceGeofenceComplianceRow />
      </View>
    </View>
  );
}
