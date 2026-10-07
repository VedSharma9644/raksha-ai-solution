import { View } from 'react-native';

import { attendanceMarkedDefaults } from '../../constants/attendance-marked-defaults';
import { attendanceMarkedDetailsCardStyles as styles } from '../../styles/attendance-marked-details-card.styles';
import { DetailInfoRow } from '../shared/DetailInfoRow';
import { AttendanceGeofenceComplianceRow } from './AttendanceGeofenceComplianceRow';
import { AttendanceGuardProfileSummary } from './AttendanceGuardProfileSummary';

export function AttendanceMarkedDetailsCard() {
  return (
    <View style={styles.card}>
      <AttendanceGuardProfileSummary />

      <View style={styles.rows}>
        <DetailInfoRow
          icon="schedule"
          label={attendanceMarkedDefaults.punchInLabel}
          title={attendanceMarkedDefaults.punchInTime}
          titleVariant="headline"
          statusBadge={attendanceMarkedDefaults.punchInStatus}
          subtitle={attendanceMarkedDefaults.punchInDate}
        />

        <DetailInfoRow
          icon="domain"
          label={attendanceMarkedDefaults.dutySiteLabel}
          title={attendanceMarkedDefaults.dutySiteName}
          subtitle={attendanceMarkedDefaults.dutyPostName}
        />

        <DetailInfoRow
          icon="badge"
          label={attendanceMarkedDefaults.rosterLabel}
          title={attendanceMarkedDefaults.rosterTitle}
          subtitle={attendanceMarkedDefaults.rosterHours}
        />

        <AttendanceGeofenceComplianceRow />
      </View>
    </View>
  );
}
