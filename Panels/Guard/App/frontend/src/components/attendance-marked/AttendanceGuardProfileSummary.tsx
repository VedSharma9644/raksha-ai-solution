import { Image, Text, View } from 'react-native';

import { attendanceMarkedDefaults } from '../../constants/attendance-marked-defaults';
import { brandAssets } from '../../constants/brand-assets';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { attendanceGuardProfileSummaryStyles as styles } from '../../styles/attendance-guard-profile-summary.styles';

export function AttendanceGuardProfileSummary() {
  const { lastPunchResult, guardUser } = useGuardAppNavigation();
  const name =
    lastPunchResult?.guardName ?? guardUser?.fullName ?? attendanceMarkedDefaults.guardName;
  const guardId =
    lastPunchResult?.guardId ?? guardUser?.employeeCode ?? attendanceMarkedDefaults.guardId;

  return (
    <View style={styles.wrap}>
      <View style={styles.photoWrap}>
        <Image source={{ uri: brandAssets.attendanceVerifiedPhotoUri }} style={styles.photo} />
        <View style={styles.photoTint} />
        <View style={styles.verifiedRibbon}>
          <Text style={styles.verifiedText}>{attendanceMarkedDefaults.verifiedPhotoLabel}</Text>
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.guardId}>Guard ID: {guardId}</Text>
        <View style={styles.dutyRow}>
          <View style={styles.dutyDot} />
          <Text style={styles.dutyLabel}>{attendanceMarkedDefaults.activeDutyLabel}</Text>
        </View>
      </View>
    </View>
  );
}
