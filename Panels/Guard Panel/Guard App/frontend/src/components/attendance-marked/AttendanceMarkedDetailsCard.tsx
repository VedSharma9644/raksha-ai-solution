import { View } from 'react-native';

import { attendanceMarkedDefaults } from '../../constants/attendance-marked-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { attendanceMarkedDetailsCardStyles as styles } from '../../styles/attendance-marked-details-card.styles';
import { DetailInfoRow } from '../shared/DetailInfoRow';
import { AttendanceGeofenceComplianceRow } from './AttendanceGeofenceComplianceRow';
import { AttendanceGuardProfileSummary } from './AttendanceGuardProfileSummary';

export function AttendanceMarkedDetailsCard() {
  const { lastPunchResult } = useGuardAppNavigation();

  return (
    <View style={styles.card}>
      <AttendanceGuardProfileSummary />

      <View style={styles.rows}>
        <DetailInfoRow
          icon="schedule"
          label={attendanceMarkedDefaults.punchInLabel}
          title={lastPunchResult?.punchInTime ?? attendanceMarkedDefaults.punchInTime}
          titleVariant="headline"
          statusBadge={lastPunchResult?.punchInStatus ?? attendanceMarkedDefaults.punchInStatus}
          subtitle={lastPunchResult?.punchInDate ?? attendanceMarkedDefaults.punchInDate}
        />

        <DetailInfoRow
          icon="domain"
          label={attendanceMarkedDefaults.dutySiteLabel}
          title={lastPunchResult?.dutySiteName ?? attendanceMarkedDefaults.dutySiteName}
          subtitle={lastPunchResult?.dutyPostName ?? attendanceMarkedDefaults.dutyPostName}
        />

        <DetailInfoRow
          icon="badge"
          label={attendanceMarkedDefaults.rosterLabel}
          title={lastPunchResult?.rosterTitle ?? attendanceMarkedDefaults.rosterTitle}
          subtitle={lastPunchResult?.rosterHours ?? attendanceMarkedDefaults.rosterHours}
        />

        <AttendanceGeofenceComplianceRow />
      </View>
    </View>
  );
}
